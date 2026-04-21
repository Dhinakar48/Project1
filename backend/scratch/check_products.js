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
    const res = await pool.query("SELECT product_id FROM products ORDER BY product_id ASC LIMIT 20");
    console.log("Products (ASC):");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
