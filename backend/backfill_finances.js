const pool = require('./db');

async function backfill() {
    const client = await pool.connect();
    try {
        console.log("Truncating finance tables before full backfill...");
        await client.query("TRUNCATE daily_finances, weekly_finances, monthly_finances, quarterly_finances, half_yearly_finances, annual_finances, finance_transactions CASCADE");

        console.log("Starting backfill from order_items (joining with orders for dates)...");
        const items = await client.query(`
            SELECT 
                oi.order_item_id, 
                oi.seller_id, 
                oi.order_id, 
                oi.total_amount as sale_amount, 
                o.placed_at as created_at
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            ORDER BY o.placed_at ASC
        `);
        console.log(`Found ${items.rows.length} order items to process.`);

        for (const row of items.rows) {
            // 0. Ensure seller_commission exists for this item
            const commCheck = await client.query("SELECT commission_id FROM seller_commissions WHERE order_item_id = $1", [row.order_item_id]);
            
            const commissionRate = 10.00; // Flat 10%
            const commissionAmount = parseFloat(row.sale_amount) * (commissionRate / 100);
            const sellerEarnings = parseFloat(row.sale_amount) - commissionAmount;

            if (commCheck.rows.length === 0) {
                console.log(`Creating missing commission for ${row.order_item_id}`);
                const commId = `COM-${row.order_item_id.replace('ORD-IT-', '')}`;
                await client.query(
                    `INSERT INTO seller_commissions (commission_id, order_item_id, seller_id, order_id, sale_amount, commission_rate, commission_amount, seller_earnings, status, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [commId, row.order_item_id, row.seller_id, row.order_id, row.sale_amount, commissionRate, commissionAmount, sellerEarnings, 'Confirmed', row.created_at]
                );
            }

            // Using DB functions for consistent date/week/month extraction
            const dateRes = await client.query(`
                SELECT 
                    $1::date as v_date,
                    EXTRACT(YEAR FROM $1::timestamp) as v_year,
                    EXTRACT(MONTH FROM $1::timestamp) as v_month,
                    EXTRACT(WEEK FROM $1::timestamp) as v_week,
                    EXTRACT(QUARTER FROM $1::timestamp) as v_quarter,
                    CASE WHEN EXTRACT(MONTH FROM $1::timestamp) <= 6 THEN 1 ELSE 2 END as v_half
            `, [row.created_at]);
            
            const { v_date, v_year, v_month, v_week, v_quarter, v_half } = dateRes.rows[0];

            // 1. Sync Daily
            let dailyRes = await client.query(
                "SELECT daily_finance_id FROM daily_finances WHERE seller_id = $1 AND finance_date = $2",
                [row.seller_id, v_date]
            );
            let v_daily_id;
            if (dailyRes.rows.length === 0) {
                const res = await client.query(
                    "INSERT INTO daily_finances (seller_id, finance_date, total_revenue, platform_commissions, net_seller_earnings) VALUES ($1, $2, $3, $4, $5) RETURNING daily_finance_id",
                    [row.seller_id, v_date, row.sale_amount, commissionAmount, sellerEarnings]
                );
                v_daily_id = res.rows[0].daily_finance_id;
            } else {
                v_daily_id = dailyRes.rows[0].daily_finance_id;
                await client.query(
                    "UPDATE daily_finances SET total_revenue = total_revenue + $1, platform_commissions = platform_commissions + $2, net_seller_earnings = net_seller_earnings + $3 WHERE daily_finance_id = $4",
                    [row.sale_amount, commissionAmount, sellerEarnings, v_daily_id]
                );
            }

            // 2. Sync Monthly
            let monthlyRes = await client.query(
                "SELECT monthly_finance_id FROM monthly_finances WHERE seller_id = $1 AND month_number = $2 AND year = $3",
                [row.seller_id, v_month, v_year]
            );
            let v_monthly_id;
            if (monthlyRes.rows.length === 0) {
                const res = await client.query(
                    "INSERT INTO monthly_finances (seller_id, month_number, year, total_revenue, platform_commission, net_seller_earnings) VALUES ($1, $2, $3, $4, $5, $6) RETURNING monthly_finance_id",
                    [row.seller_id, v_month, v_year, row.sale_amount, commissionAmount, sellerEarnings]
                );
                v_monthly_id = res.rows[0].monthly_finance_id;
            } else {
                v_monthly_id = monthlyRes.rows[0].monthly_finance_id;
                await client.query(
                    "UPDATE monthly_finances SET total_revenue = total_revenue + $1, platform_commission = platform_commission + $2, net_seller_earnings = net_seller_earnings + $3 WHERE monthly_finance_id = $4",
                    [row.sale_amount, commissionAmount, sellerEarnings, v_monthly_id]
                );
            }
            await client.query("UPDATE daily_finances SET monthly_finance_id = $1 WHERE daily_finance_id = $2", [v_monthly_id, v_daily_id]);

            // 3. Sync Weekly
            let weeklyRes = await client.query(
                "SELECT weekly_finance_id FROM weekly_finances WHERE seller_id = $1 AND week_number = $2 AND year = $3",
                [row.seller_id, v_week, v_year]
            );
            let v_weekly_id;
            if (weeklyRes.rows.length === 0) {
                const res = await client.query(
                    "INSERT INTO weekly_finances (seller_id, week_number, year, total_revenue, platform_commission, net_seller_earnings, daily_finance_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING weekly_finance_id",
                    [row.seller_id, v_week, v_year, row.sale_amount, commissionAmount, sellerEarnings, v_daily_id]
                );
                v_weekly_id = res.rows[0].weekly_finance_id;
            } else {
                v_weekly_id = weeklyRes.rows[0].weekly_finance_id;
                await client.query(
                    "UPDATE weekly_finances SET total_revenue = total_revenue + $1, platform_commission = platform_commission + $2, net_seller_earnings = net_seller_earnings + $3 WHERE weekly_finance_id = $4",
                    [row.sale_amount, commissionAmount, sellerEarnings, v_weekly_id]
                );
            }
            await client.query("UPDATE daily_finances SET weekly_finance_id = $1 WHERE daily_finance_id = $2", [v_weekly_id, v_daily_id]);

            // 4. Sync Quarterly
            let quarterlyRes = await client.query(
                "SELECT quarterly_finance_id FROM quarterly_finances WHERE seller_id = $1 AND quarter_number = $2 AND year = $3",
                [row.seller_id, v_quarter, v_year]
            );
            let v_quarterly_id;
            if (quarterlyRes.rows.length === 0) {
                const res = await client.query(
                    "INSERT INTO quarterly_finances (seller_id, quarter_number, year, total_revenue, platform_commission, net_seller_earnings, monthly_finance_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING quarterly_finance_id",
                    [row.seller_id, v_quarter, v_year, row.sale_amount, commissionAmount, sellerEarnings, v_monthly_id]
                );
                v_quarterly_id = res.rows[0].quarterly_finance_id;
            } else {
                v_quarterly_id = quarterlyRes.rows[0].quarterly_finance_id;
                await client.query(
                    "UPDATE quarterly_finances SET total_revenue = total_revenue + $1, platform_commission = platform_commission + $2, net_seller_earnings = net_seller_earnings + $3 WHERE quarterly_finance_id = $4",
                    [row.sale_amount, commissionAmount, sellerEarnings, v_quarterly_id]
                );
            }
            await client.query("UPDATE monthly_finances SET quarterly_finance_id = $1 WHERE monthly_finance_id = $2", [v_quarterly_id, v_monthly_id]);

            // 5. Sync Half-Yearly
            let halfRes = await client.query(
                "SELECT half_yearly_finances_id FROM half_yearly_finances WHERE seller_id = $1 AND half_number = $2 AND year = $3",
                [row.seller_id, v_half, v_year]
            );
            let v_half_id;
            if (halfRes.rows.length === 0) {
                const res = await client.query(
                    "INSERT INTO half_yearly_finances (seller_id, half_number, year, total_revenue, platform_commission, net_seller_earnings) VALUES ($1, $2, $3, $4, $5, $6) RETURNING half_yearly_finances_id",
                    [row.seller_id, v_half, v_year, row.sale_amount, commissionAmount, sellerEarnings]
                );
                v_half_id = res.rows[0].half_yearly_finances_id;
            } else {
                v_half_id = halfRes.rows[0].half_yearly_finances_id;
                await client.query(
                    "UPDATE half_yearly_finances SET total_revenue = total_revenue + $1, platform_commission = platform_commission + $2, net_seller_earnings = net_seller_earnings + $3 WHERE half_yearly_finances_id = $4",
                    [row.sale_amount, commissionAmount, sellerEarnings, v_half_id]
                );
            }
            await client.query("UPDATE quarterly_finances SET half_yearly_finances_id = $1 WHERE quarterly_finance_id = $2", [v_half_id, v_quarterly_id]);

            // 6. Sync Annual
            let annualRes = await client.query(
                "SELECT annual_finance_id FROM annual_finances WHERE seller_id = $1 AND year = $2",
                [row.seller_id, v_year]
            );
            let v_annual_id;
            if (annualRes.rows.length === 0) {
                const res = await client.query(
                    "INSERT INTO annual_finances (seller_id, year, total_revenue, platform_commission, net_seller_earnings) VALUES ($1, $2, $3, $4, $5) RETURNING annual_finance_id",
                    [row.seller_id, v_year, row.sale_amount, commissionAmount, sellerEarnings]
                );
                v_annual_id = res.rows[0].annual_finance_id;
            } else {
                v_annual_id = annualRes.rows[0].annual_finance_id;
                await client.query(
                    "UPDATE annual_finances SET total_revenue = total_revenue + $1, platform_commission = platform_commission + $2, net_seller_earnings = net_seller_earnings + $3 WHERE annual_finance_id = $4",
                    [row.sale_amount, commissionAmount, sellerEarnings, v_annual_id]
                );
            }
            await client.query("UPDATE half_yearly_finances SET annual_finance_id = $1 WHERE half_yearly_finances_id = $2", [v_annual_id, v_half_id]);
            // Fix: Link Annual to Half-Yearly
            await client.query("UPDATE annual_finances SET half_yearly_finances_id = $1 WHERE annual_finance_id = $2", [v_half_id, v_annual_id]);

            // 7. Record Transaction
            await client.query(
                "INSERT INTO finance_transactions (daily_finance_id, order_id, transaction_type, amount, created_at) VALUES ($1, $2, $3, $4, $5)",
                [v_daily_id, row.order_id, 'Sale', row.sale_amount, row.created_at]
            );
        }
        console.log("Backfill from orders completed successfully.");
    } catch (err) {
        console.error("Backfill error:", err);
    } finally {
        client.release();
        process.exit();
    }
}

backfill();
