const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function fixPaymentIds() {
    try {
        console.log("Fixing payment_id in finance_transactions...");
        const result = await pool.query(`
            UPDATE finance_transactions ft
            SET payment_id = p.payment_id
            FROM payments p
            WHERE ft.order_id = p.order_id
            AND ft.payment_id IS NULL;
        `);
        console.log(`Updated ${result.rowCount} transactions.`);
    } catch (err) {
        console.error("Error fixing payment IDs:", err);
    } finally {
        await pool.end();
    }
}

fixPaymentIds();
