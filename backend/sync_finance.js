const pool = require('./db');

async function syncFinanceData() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('--- STARTING FINANCE SYNC ---');

        // 0. Fix missing seller_ids in order_items
        const fixItems = await client.query(`
            UPDATE order_items oi
            SET seller_id = p.seller_id
            FROM products p
            WHERE oi.product_id = p.product_id AND oi.seller_id IS NULL
        `);
        console.log(`Fixed ${fixItems.rowCount} order items with missing seller_id`);

        // 1. Find all orders since May 5th
        const ordersRes = await client.query(`
            SELECT o.order_id, o.placed_at, o.total_amount, o.customer_id
            FROM orders o
            WHERE o.placed_at >= '2026-05-05'
        `);

        for (const order of ordersRes.rows) {
            console.log(`Processing Order: ${order.order_id}`);
            
            // Get seller(s) for this order
            const sellerRes = await client.query(`
                SELECT seller_id, SUM(total_amount) as seller_subtotal
                FROM order_items
                WHERE order_id = $1
                GROUP BY seller_id
            `, [order.order_id]);

            const placedDate = new Date(order.placed_at).toISOString().split('T')[0];

            // Get payment info
            const payRes = await client.query('SELECT payment_id FROM payments WHERE order_id = $1', [order.order_id]);
            const paymentId = payRes.rows.length > 0 ? payRes.rows[0].payment_id : null;

            for (const seller of sellerRes.rows) {
                const sId = seller.seller_id;
                if (!sId) continue;

                const subtotal = parseFloat(seller.seller_subtotal);
                const commission = subtotal * 0.1;
                const net = subtotal - commission;

                // A. Ensure Daily Finance exists
                let dailyFinRes = await client.query(
                    'SELECT daily_finance_id FROM daily_finances WHERE seller_id = $1 AND finance_date = $2',
                    [sId, placedDate]
                );

                let dailyFinId;
                if (dailyFinRes.rows.length === 0) {
                    const newFin = await client.query(
                        'INSERT INTO daily_finances (seller_id, finance_date, total_revenue, platform_commissions, net_seller_earnings) VALUES ($1, $2, $3, $4, $5) RETURNING daily_finance_id',
                        [sId, placedDate, subtotal, commission, net]
                    );
                    dailyFinId = newFin.rows[0].daily_finance_id;
                } else {
                    dailyFinId = dailyFinRes.rows[0].daily_finance_id;
                    // Check if transaction already exists for this order to avoid double counting
                    const txnCheck = await client.query(
                        'SELECT finance_transaction_id FROM finance_transactions WHERE order_id = $1 AND daily_finance_id = $2',
                        [order.order_id, dailyFinId]
                    );
                    
                    if (txnCheck.rows.length === 0) {
                        await client.query(
                            'UPDATE daily_finances SET total_revenue = total_revenue + $1, platform_commissions = platform_commissions + $2, net_seller_earnings = net_seller_earnings + $3 WHERE daily_finance_id = $4',
                            [subtotal, commission, net, dailyFinId]
                        );
                    }
                }

                // B. Ensure Transaction exists
                const txnCheck = await client.query(
                    'SELECT finance_transaction_id FROM finance_transactions WHERE order_id = $1 AND daily_finance_id = $2',
                    [order.order_id, dailyFinId]
                );

                if (txnCheck.rows.length === 0) {
                    await client.query(
                        'INSERT INTO finance_transactions (daily_finance_id, order_id, payment_id, transaction_type, amount) VALUES ($1, $2, $3, $4, $5)',
                        [dailyFinId, order.order_id, paymentId, 'sale', subtotal]
                    );
                    console.log(`  - Created finance transaction for ${sId}`);
                }

                // C. Update payment's seller_id if missing
                if (paymentId) {
                    await client.query(
                        'UPDATE payments SET seller_id = $1 WHERE payment_id = $2 AND seller_id IS NULL',
                        [sId, paymentId]
                    );
                }
            }
        }

        await client.query('COMMIT');
        console.log('--- FINANCE SYNC COMPLETED ---');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error syncing finance data:', err);
    } finally {
        client.release();
        process.exit();
    }
}

syncFinanceData();
