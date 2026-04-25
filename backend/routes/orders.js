const express = require('express');
const router = express.Router();
const pool = require('../db');

// Place Order
router.post("/order/place", async (req, res) => {
  console.log("--- ORDER PLACE REQUEST RECEIVED ---", req.body);
  const { customerId, addressId, cartItems, subtotal, discountAmount, totalAmount, couponId, shippingCharge, paymentMethod, transactionId } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Security Check: Verify user is not blocked
    const userCheck = await client.query("SELECT is_active, is_blocked FROM customers WHERE customer_id = $1", [customerId]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].is_active === false || userCheck.rows[0].is_blocked === true) {
      throw new Error("ACCOUNT_RESTRICTED");
    }
    
    const backendSubtotal = cartItems.reduce((acc, it) => {
      const p = parseFloat(String(it.variant?.price || it.price || 0).replace(/[^\d.]/g, ''));
      return acc + (p * it.quantity);
    }, 0);
    
    const backendRawSubtotal = cartItems.reduce((acc, it) => {
      const mrp = parseFloat(String(it.variant?.mrp || it.mrp || it.variant?.price || it.price || 0).replace(/[^\d.]/g, ''));
      return acc + (mrp * it.quantity);
    }, 0);

    const productDiscount = backendRawSubtotal - backendSubtotal;
    const totalDiscountAmount = productDiscount + (discountAmount || 0);
    const backendTotal = backendSubtotal - (discountAmount || 0) + (req.body.platformFee || 15) + (shippingCharge || 0);
    
    const maxOrderRes = await client.query("SELECT order_id FROM orders ORDER BY order_id DESC LIMIT 1");
    let nextNum = 1;
    if (maxOrderRes.rows.length > 0) {
      const lastId = maxOrderRes.rows[0].order_id;
      const match = lastId.match(/\d+/);
      nextNum = (match ? parseInt(match[0]) : 0) + 1;
    }
    const orderId = `ORD-${nextNum.toString().padStart(3, '0')}`;

    const isPaid = paymentMethod && paymentMethod.toLowerCase() !== 'cod';
    const paymentStatus = isPaid ? 'Paid' : 'Pending';
    const platformFee = req.body.platformFee || 15;

    let finalCouponId = null;
    if (couponId) {
      const couponRes = await client.query("SELECT coupon_id, code, used_count, max_usage, is_active, valid_until FROM coupons WHERE code = $1", [couponId]);
      if (couponRes.rows.length > 0) {
        const coupon = couponRes.rows[0];
        const now = new Date();
        if (coupon.is_active && (!coupon.valid_until || new Date(coupon.valid_until) > now) && (!coupon.max_usage || coupon.used_count < coupon.max_usage)) {
          finalCouponId = coupon.coupon_id;
        }
      }
    }

    await client.query(
      `INSERT INTO orders (order_id, customer_id, address_id, coupon_id, subtotal, discount_amount, platform_fee, shipping_charge, total_amount, order_status, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [orderId, customerId, addressId || null, finalCouponId, backendRawSubtotal, totalDiscountAmount, platformFee, shippingCharge || 0, backendTotal, 'Confirmed', paymentStatus]
    );

    if (finalCouponId) {
      // Record coupon usage
      await client.query(
        "INSERT INTO order_coupons (order_id, coupon_id, discount_amount) VALUES ($1, $2, $3)",
        [orderId, finalCouponId, discountAmount || 0]
      );
      await client.query(
        "INSERT INTO coupon_usage (coupon_id, customer_id, order_id) VALUES ($1, $2, $3)",
        [finalCouponId, customerId, orderId]
      );
      await client.query(
        "UPDATE coupons SET used_count = used_count + 1 WHERE coupon_id = $1",
        [finalCouponId]
      );
    }

    const maxItemRes = await client.query("SELECT order_item_id FROM order_items ORDER BY order_item_id DESC LIMIT 1");
    let nextItemNum = 1;
    if (maxItemRes.rows.length > 0) {
      const lastItemId = maxItemRes.rows[0].order_item_id;
      const matchItem = lastItemId.match(/\d+/);
      nextItemNum = (matchItem ? parseInt(matchItem[0]) : 0) + 1;
    }

    const sellerSubtotals = {};
    for (const item of cartItems) {
       const uPrice = parseFloat(String(item.variant?.price || item.price || 0).replace(/[^\d.]/g, ''));
       const itemTotal = uPrice * item.quantity;
       const prodRes = await client.query("SELECT seller_id FROM products WHERE product_id = $1", [item.product_id || item.productId]);
       const sellerId = prodRes.rows.length > 0 ? prodRes.rows[0].seller_id : null;
       if (sellerId && sellerId !== 'null' && sellerId !== 'undefined') {
         sellerSubtotals[sellerId] = (sellerSubtotals[sellerId] || 0) + itemTotal;
       }
       const orderItemId = `ORD-IT-${(nextItemNum++).toString().padStart(4, '0')}`;
       const vId = item.variant_id || item.variantId || (item.variant ? (item.variant.variant_id || item.variant.id) : null);
       const totalFeesAndDiscounts = platformFee + (shippingCharge || 0) - (discountAmount || 0);
       const proRatedTotal = itemTotal + (backendSubtotal > 0 ? (itemTotal / backendSubtotal) * totalFeesAndDiscounts : 0);

       await client.query(
         "INSERT INTO order_items (order_item_id, order_id, product_id, seller_id, variant_id, quantity, unit_price, total_amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
         [orderItemId, orderId, item.product_id || item.productId, sellerId, vId, item.quantity, uPrice, proRatedTotal]
       );

       // Insert into seller_commissions
       if (sellerId && sellerId !== 'null' && sellerId !== 'undefined') {
         const commId = `COM-${orderItemId.replace('ORD-IT-', '')}`;
         const commissionRate = 10.00; // Flat 10% rate
         const commissionAmount = proRatedTotal * (commissionRate / 100);
         const sellerEarnings = proRatedTotal - commissionAmount;

         await client.query(
           `INSERT INTO seller_commissions (commission_id, order_item_id, seller_id, order_id, sale_amount, commission_rate, commission_amount, seller_earnings, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
           [commId, orderItemId, sellerId, orderId, proRatedTotal, commissionRate, commissionAmount, sellerEarnings, 'Pending']
         );
       }

       if (vId) {
         await client.query("UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE variant_id = $2", [item.quantity, vId]);
       } else {
         await client.query("UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2", [item.quantity, item.product_id || item.productId]);
       }
    }

    const sellerIds = Object.keys(sellerSubtotals);
    if (paymentMethod) {
      const finalTransactionId = (transactionId && transactionId !== 'COD') ? transactionId : null;
      await client.query(
        "INSERT INTO payments (customer_id, order_id, payment_method, amount, transaction_id, payment_status, paid_at, gateway_name, seller_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [customerId, orderId, paymentMethod, backendTotal, finalTransactionId, paymentStatus, isPaid ? new Date() : null, isPaid ? 'Razorpay' : null, sellerIds[0] || null]
      );
    }

    for (const sId in sellerSubtotals) {
      await client.query("INSERT INTO order_sellers (order_id, seller_id, seller_subtotal) VALUES ($1, $2, $3)", [orderId, sId, sellerSubtotals[sId]]);
      // ✅ ADDED: Notify Seller of new order
      await client.query("INSERT INTO notifications (seller_id, order_id, type, message) VALUES ($1, $2, $3, $4)", [sId, orderId, 'New Order', `New order ${orderId} received for your products.`]);
    }
    await client.query("INSERT INTO notifications (customer_id, order_id, type, message) VALUES ($1, $2, $3, $4)", [customerId, orderId, 'Order Placed', `Your order ${orderId} has been placed successfully.`]);
    await client.query("INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES ($1, $2, $3, $4)", [orderId, 'Confirmed', 'System', 'Order placed and confirmed.']);
    await client.query("DELETE FROM cart_items ci USING carts c WHERE ci.cart_id = c.cart_id AND c.customer_id = $1", [customerId]);

    await client.query("COMMIT");
    res.json({ success: true, orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Order placement error:", err);
    if (err.message === "ACCOUNT_RESTRICTED") {
      return res.status(403).json({ success: false, message: "Your account is currently restricted. Order placement is disabled." });
    }
    res.status(500).json({ message: "Order placement error" });
  } finally {
    client.release();
  }
});

router.post("/order/cancel", async (req, res) => {
  const { orderId, reason } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Update order status
    const result = await client.query("UPDATE orders SET order_status = 'Cancelled', cancellation_reason = $1 WHERE order_id = $2 RETURNING *", [reason || "User cancelled", orderId]);
    
    if (result.rows.length > 0) {
      const order = result.rows[0];
      
      // 1. Notify Customer
      await client.query(
        "INSERT INTO notifications (customer_id, order_id, type, message) VALUES ($1, $2, $3, $4)",
        [order.customer_id, orderId, 'Order Cancelled', `Your order ${orderId} has been cancelled. Reason: ${reason || 'User request'}`]
      );

      // 2. Notify Seller(s)
      const sellerRes = await client.query("SELECT DISTINCT seller_id FROM order_items WHERE order_id = $1", [orderId]);
      for (const row of sellerRes.rows) {
        await client.query(
          "INSERT INTO notifications (seller_id, order_id, type, message) VALUES ($1, $2, $3, $4)",
          [row.seller_id, orderId, 'Order Cancelled', `Order ${orderId} has been cancelled by the customer.`]
        );
      }

      // 3. Platform Notification (for Admin)
      await client.query(
        "INSERT INTO notifications (order_id, type, message) VALUES ($1, $2, $3)",
        [orderId, 'System Alert', `Order ${orderId} was cancelled by customer. Reason: ${reason || 'N/A'}`]
      );

      await client.query("INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES ($1, $2, $3, $4)", [orderId, 'Cancelled', 'Customer', reason || 'Order cancelled by customer']);
    }

    await client.query("COMMIT");
    res.json({ success: true, order: result.rows[0] });
  } catch (err) { 
    await client.query("ROLLBACK");
    console.error("Cancellation error:", err);
    res.status(500).json({ message: "Cancel error" }); 
  } finally {
    client.release();
  }
});

router.patch("/order/status", async (req, res) => {
  const { orderId, status, changedBy, notes } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2", [status, orderId]);
    await client.query("INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES ($1, $2, $3, $4)", [orderId, status, changedBy || 'Seller', notes || 'Order status updated to ' + status]);
    const orderRes = await client.query("SELECT customer_id FROM orders WHERE order_id = $1", [orderId]);
    if (orderRes.rows.length > 0) {
      await client.query("INSERT INTO notifications (customer_id, order_id, type, message) VALUES ($1, $2, $3, $4)", [orderRes.rows[0].customer_id, orderId, 'Order Update', `Your order ${orderId} is now ${status}.`]);
    }
    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) { await client.query("ROLLBACK"); res.status(500).json({ message: "Status update error" }); }
  finally { client.release(); }
});

router.get("/order-history/:orderId", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY changed_at DESC", [req.params.orderId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "History error" }); }
});

router.get("/customer-orders/:customerId", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, a.full_name as shipping_name, a.address1 as address, a.address2, a.city, a.state, a.pincode, a.phone as shipping_phone,
             (SELECT json_agg(items) FROM (SELECT oi.*, p.name, p.images FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = o.order_id) items) as items
      FROM orders o LEFT JOIN addresses a ON o.address_id = a.address_id WHERE o.customer_id = $1 ORDER BY o.placed_at DESC
    `, [req.params.customerId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Fetch orders error" }); }
});

router.get("/seller-orders/:sellerId", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT oi.*, o.placed_at, o.order_status, o.payment_status, o.total_amount, p.name as product_name, p.images as product_images, c.name as customer_name, c.email as customer_email,
             a.full_name as shipping_name, a.address1 as address, a.address2, a.city, a.state, a.pincode, a.phone as shipping_phone
      FROM order_items oi JOIN orders o ON oi.order_id = o.order_id JOIN products p ON oi.product_id = p.product_id LEFT JOIN customers c ON o.customer_id = c.customer_id LEFT JOIN addresses a ON o.address_id = a.address_id
      WHERE oi.seller_id = $1 ORDER BY o.placed_at DESC
    `, [req.params.sellerId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Seller orders error" }); }
});

router.get("/seller-customers/:sellerId", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
          c.customer_id,
          c.name,
          c.email,
          SUM(oi.total_amount) as total_spend,
          MAX(o.placed_at) as last_order_date,
          (
              SELECT p.name 
              FROM order_items oi2 
              JOIN orders o2 ON oi2.order_id = o2.order_id 
              JOIN products p ON oi2.product_id = p.product_id
              WHERE o2.customer_id = c.customer_id AND oi2.seller_id = $1
              ORDER BY o2.placed_at DESC 
              LIMIT 1
          ) as latest_product
      FROM customers c
      JOIN orders o ON c.customer_id = o.customer_id
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE oi.seller_id = $1
      GROUP BY c.customer_id, c.name, c.email
      ORDER BY total_spend DESC
    `, [req.params.sellerId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching seller customers:", err);
    res.status(500).json({ message: "Seller customers error" });
  }
});

router.get("/notifications/customer/:customerId", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM notifications WHERE customer_id = $1 ORDER BY created_at DESC", [req.params.customerId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Customer notifications error" }); }
});

router.get("/notifications/seller/:sellerId", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM notifications WHERE seller_id = $1 ORDER BY created_at DESC", [req.params.sellerId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Seller notifications error" }); }
});

router.patch("/notifications/read/:notificationId", async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read = TRUE WHERE notification_id = $1", [req.params.notificationId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: "Mark read error" }); }
});

module.exports = router;
