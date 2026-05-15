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
    const res = await pool.query("SELECT customer_id, email FROM customers LIMIT 10;");
    console.log("Customers:", res.rows);
    const adminRes = await pool.query("SELECT admin_id, email FROM admins LIMIT 10;");
    console.log("Admins:", adminRes.rows);
    const cartRes = await pool.query("SELECT * FROM carts LIMIT 10;");
    console.log("Carts:", cartRes.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
