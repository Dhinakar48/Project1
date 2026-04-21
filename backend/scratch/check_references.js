const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function check() {
  try {
    const res1 = await pool.query("SELECT DISTINCT variant_id FROM order_items WHERE variant_id LIKE 'VAR-%'");
    console.log("Variant IDs in order_items:");
    console.table(res1.rows);
    
    const res2 = await pool.query("SELECT DISTINCT variant_id FROM cart_items WHERE variant_id LIKE 'VAR-%'");
    console.log("Variant IDs in cart_items:");
    console.table(res2.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
