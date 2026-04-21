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
    const res = await pool.query("SELECT * FROM product_variants WHERE product_id = 'PRD004'");
    console.log("Variants for PRD004:");
    console.table(res.rows);
    
    const res2 = await pool.query("SELECT * FROM products WHERE product_id = 'PRD004'");
    console.log("Product PRD004:");
    console.table(res2.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
