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
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'");
    console.log(JSON.stringify(res.rows, null, 2));
    
    const sample = await pool.query("SELECT product_id, name, sku FROM products LIMIT 5");
    console.log("Sample data:", JSON.stringify(sample.rows, null, 2));
    
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
