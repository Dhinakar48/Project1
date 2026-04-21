const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function run() {
  try {
    const products = await pool.query("SELECT product_id, name FROM products WHERE name ILIKE '%Samsung%'");
    console.log("Samsung Products:", products.rows);
    
    if (products.rows.length > 0) {
      const ids = products.rows.map(p => p.product_id);
      const variants = await pool.query("SELECT * FROM product_variants WHERE product_id = ANY($1)", [ids]);
      console.log("Variants for Samsung:", variants.rows);
    } else {
      console.log("No Samsung product found.");
    }
  } finally {
    await pool.end();
  }
}
run();
