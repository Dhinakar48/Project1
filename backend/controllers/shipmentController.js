const pool = require('../db');
const shiprocket = require('../utils/shiprocket');
const { sendOrderStatusNotifications } = require('../utils/notifications');
const { recordAuditLog } = require('../utils/audit');

/**
 * Intelligent Auto-Pilot: Create SR Order -> Choose Best Courier -> Assign AWB -> Schedule Pickup
 */
const pushOrderToShiprocket = async (orderId, client = pool) => {
    try {
        // 1. Fetch Order Details with Customer Address (Fixing columns for DB)
        const orderRes = await client.query(`
            SELECT o.*, a.full_name, a.phone, a.address1 as address_line_1, a.city, a.state, a.pincode, c.email, pay.payment_id
            FROM orders o
            JOIN addresses a ON o.address_id = a.address_id
            JOIN customers c ON o.customer_id = c.customer_id
            LEFT JOIN payments pay ON o.order_id = pay.order_id
            WHERE o.order_id = $1
        `, [orderId]);

        if (orderRes.rows.length === 0) {
            console.error(`[SHIPROCKET] Error: Order ${orderId} not found in DB.`);
            return;
        }

        const order = orderRes.rows[0];

        // 2. Fetch Order Items with Product Weight/Dimensions
        const itemsRes = await client.query(`
            SELECT oi.*, p.name as product_name, p.sku, p.weight, p.height, p.width as breadth, p.height -- mapping width to breadth
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = $1
        `, [orderId]);

        const items = itemsRes.rows;
        if (items.length === 0) {
            console.error(`[SHIPROCKET] Error: No items found for order ${orderId}.`);
            return;
        }

        // 3. Get Default Pickup Location for the primary seller (Fixing table name)
        const firstSellerId = items[0].seller_id;
        const pickupRes = await client.query(`
            SELECT * FROM seller_pickup_locations 
            WHERE (seller_id = $1 OR (seller_id IS NULL AND $1 IS NULL)) 
            AND is_default = true
            LIMIT 1
        `, [firstSellerId]);

        let pickupLocation = pickupRes.rows[0];

        // Fallback to Admin's default pickup if seller has none
        if (!pickupLocation) {
            console.log(`[SHIPROCKET] Falling back to Admin pickup for seller ${firstSellerId}`);
            const adminPickupRes = await client.query(`
                SELECT * FROM seller_pickup_locations 
                WHERE seller_id IS NULL AND is_default = true
                LIMIT 1
            `);
            pickupLocation = adminPickupRes.rows[0];
        }

        if (!pickupLocation) {
            throw new Error(`No pickup location found for seller ${firstSellerId} or Admin.`);
        }

        // 4. Prepare Shiprocket Payload
        const nameParts = (order.full_name || "Customer User").trim().split(/\s+/);
        const firstName = nameParts[0] || "Customer";
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User";
        
        let cleanedPhone = order.phone ? order.phone.replace(/\D/g, '') : '';
        if (cleanedPhone.length > 10 && cleanedPhone.startsWith('91')) {
            cleanedPhone = cleanedPhone.substring(cleanedPhone.length - 10);
        }
        const validPhone = cleanedPhone.length >= 10 ? cleanedPhone.substring(0, 10) : "9876543210";
        
        // Use address exactly as provided in DB
        const customerAddress = (order.address_line_1 || '').trim();

        const srOrderItems = items.map(item => ({
            name: item.product_name || "Product",
            sku: (item.sku || (item.product_id ? item.product_id.slice(0, 8) : "PROD")).toString().slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, ''),
            units: item.quantity,
            selling_price: Number(item.unit_price)
        }));

        const srPayload = {
            order_id: order.order_id.toString().slice(0, 20),
            order_date: new Date(order.placed_at).toISOString().split('T')[0],
            pickup_location: pickupLocation.location_name,
            billing_customer_name: firstName,
            billing_last_name: lastName,
            billing_address: customerAddress,
            billing_city: order.city,
            billing_pincode: order.pincode,
            billing_state: order.state,
            billing_country: "India",
            billing_email: order.email,
            billing_phone: validPhone,
            shipping_is_billing: true,
            order_items: srOrderItems,
            payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
            sub_total: Number(order.total_amount),
            shipping_charges: Number(order.shipping_charges || 0),
            total_discount: Number(order.discount_amount || 0),
            length: Math.max(...items.map(i => Number(i.length) || 10)),
            breadth: Math.max(...items.map(i => Number(i.breadth) || 10)),
            height: Math.max(...items.map(i => Number(i.height) || 10)),
            weight: items.reduce((acc, i) => acc + (Number(i.weight) || 0.5) * i.quantity, 0)
        };

        // 5. Create Order in Shiprocket
        let srOrderRes = await shiprocket.createShiprocketOrder(srPayload);

        // Auto-Sync Pickup Location
        if (srOrderRes && srOrderRes.message && srOrderRes.message.toLowerCase().includes('pickup location')) {
            try {
                const syncRes = await shiprocket.addShiprocketPickupLocation(pickupLocation);
                if (syncRes && (syncRes.success || syncRes.status_code === 200)) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    srOrderRes = await shiprocket.createShiprocketOrder(srPayload);
                }
            } catch (syncError) {
                console.error(`[SHIPROCKET AUTO-SYNC] Error:`, syncError.message);
            }
        }

        if (!srOrderRes || !srOrderRes.order_id) {
            throw new Error(srOrderRes.message || "Shiprocket: Failed to create order.");
        }

        const srOrderId = srOrderRes.order_id;
        const shipmentId = srOrderRes.shipment_id;

        // 6. Intelligent Courier Selection
        const svcParams = {
            pickup_postcode: pickupLocation.pincode,
            delivery_postcode: order.pincode,
            weight: srPayload.weight,
            cod: order.payment_method === 'cod' ? 1 : 0,
            is_return: 0
        };
        
        const svcRes = await shiprocket.getShiprocketServiceability(svcParams);
        let selectedCourierId = null;
        let courierName = "Shiprocket Auto";

        if (svcRes && svcRes.status === 200 && svcRes.data.available_courier_companies.length > 0) {
            const bestCourier = svcRes.data.available_courier_companies.sort((a, b) => Number(a.rate) - Number(b.rate))[0];
            selectedCourierId = bestCourier.courier_company_id;
            courierName = bestCourier.courier_name;
        }

        // 7. Assign AWB
        let awbCode = null;
        if (selectedCourierId) {
            const awbRes = await shiprocket.assignShiprocketAWB({
                shipment_id: shipmentId,
                courier_id: selectedCourierId
            });
            if (awbRes.status === 200) {
                awbCode = awbRes.response.data.awb_code;
            }
        }

        // 8. Generate Pickup
        if (awbCode) {
            await shiprocket.generateShiprocketPickup([shipmentId]);
        }

        // 9. Save to shiprocket_orders table (Fixing column names to match DB schema)
        await client.query(`
            INSERT INTO shiprocket_orders (
                sr_order_id, order_id, shipment_id, sr_status, awb_code, courier_name, payment_id, updated_at
            ) VALUES ($1, $2, $3, 'READY_TO_SHIP', $4, $5, $6, NOW())
            ON CONFLICT (order_id) DO UPDATE SET 
                shipment_id = EXCLUDED.shipment_id,
                sr_status = EXCLUDED.sr_status,
                awb_code = EXCLUDED.awb_code,
                courier_name = EXCLUDED.courier_name,
                payment_id = EXCLUDED.payment_id,
                updated_at = NOW()
        `, [srOrderId.toString(), order.order_id, shipmentId.toString(), awbCode, courierName, order.payment_id]);

        return { 
            sr_order_id: srOrderId, 
            shipment_id: shipmentId, 
            awb_code: awbCode, 
            courier: courierName 
        };
    } catch (error) {
        console.error(`[SHIPROCKET FATAL ERROR] Order ${orderId}:`, error.message);
        throw error;
    }
};

const initiateShipment = async (req, res) => {
    const { orderId } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const srResponse = await pushOrderToShiprocket(orderId, client);

        if (!srResponse || !srResponse.shipment_id) {
            throw new Error("Shiprocket failed to return a valid shipment ID.");
        }

        await client.query(`
            UPDATE orders SET order_status = 'Processing', courier = 'Shiprocket', tracking_id = $1 WHERE order_id = $2
        `, [srResponse.shipment_id.toString(), orderId]);

        await sendOrderStatusNotifications(orderId, 'Processing', client);
        
        // Audit Log
        const adminId = (req.body && req.body.adminId) ? req.body.adminId : 'System';
        await recordAuditLog(adminId, 'orders', orderId, 'SHIPROCKET_SYNC', null, srResponse, req);

        await client.query('COMMIT');

        return res.status(200).json({ success: true, message: "Shipment initiated", data: srResponse });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`[SHIPROCKET ERROR]:`, error.message);
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

const handleShiprocketWebhook = async (req, res) => {
    res.status(200).send('OK');
    const payload = req.body;
    if (!payload || !payload.awb) return;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Log webhook
        await client.query(`
            INSERT INTO shiprocket_webhook_log (sr_order_id, event_type, raw_payload, is_processed, received_at)
            VALUES ($1, $2, $3, true, NOW())
        `, [payload.order_id?.toString(), payload.current_status, JSON.stringify(payload)]);

        const localOrderId = payload.channel_order_id;
        if (!localOrderId) {
            await client.query('ROLLBACK');
            return;
        }

        let newLocalStatus = null;
        if (['SHIPPED', 'IN TRANSIT', 'OUT FOR DELIVERY', 'PICKED UP'].includes(payload.current_status?.toUpperCase())) {
            newLocalStatus = 'Shipped';
        } else if (payload.current_status?.toUpperCase() === 'DELIVERED') {
            newLocalStatus = 'Delivered';
        }

        if (newLocalStatus) {
            await client.query(`
                UPDATE orders SET order_status = $1, tracking_id = $2, courier = $3, updated_at = NOW()
                WHERE order_id = $4
            `, [newLocalStatus, payload.awb, payload.courier_name, localOrderId]);

            await sendOrderStatusNotifications(localOrderId, newLocalStatus, client, payload.courier_name, payload.awb);
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Webhook Error:", err.message);
    } finally {
        client.release();
    }
};

module.exports = {
    initiateShipment,
    handleShiprocketWebhook,
    pushOrderToShiprocket
};
