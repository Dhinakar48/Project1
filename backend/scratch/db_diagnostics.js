const { Client } = require('pg');

const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  password: '3616',
  port: 5432,
  database: 'local_db'
};

async function runDiagnostics() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log("=== DATABASE DIAGNOSTICS ===");

    // 1. Check Payments
    const payRes = await client.query('SELECT count(*) FROM payments');
    console.log(`Payments: ${payRes.rows[0].count} records found.`);

    // 2. Check Finance Summary
    const finRes = await client.query('SELECT COALESCE(SUM(total_revenue), 0) as revenue FROM daily_finances');
    console.log(`Total Revenue (Ledger): ₹${Number(finRes.rows[0].revenue).toLocaleString()}`);

    // 3. Check Orphaned Payments
    const orphanRes = await client.query(`
      SELECT count(*) FROM payments p 
      LEFT JOIN orders o ON p.order_id = o.order_id 
      WHERE o.order_id IS NULL
    `);
    console.log(`Orphaned Payments: ${orphanRes.rows[0].count}`);

    // 4. Check Tables Status
    const tables = ['sellers', 'orders', 'products', 'daily_finances'];
    for (const table of tables) {
      const res = await client.query(`SELECT count(*) FROM ${table}`);
      console.log(`Table '${table}': ${res.rows[0].count} rows`);
    }

  } catch (err) {
    console.error("Diagnostic Error:", err.message);
  } finally {
    await client.end();
  }
}

runDiagnostics();
