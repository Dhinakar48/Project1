const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function update() {
  try {
    const res = await pool.query("UPDATE products SET sku = 'NOISE-AIR-001' WHERE product_id = 'PRD002' RETURNING sku");
    console.log("Updated SKU:", res.rows[0].sku);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

update();
