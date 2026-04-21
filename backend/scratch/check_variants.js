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
    const res = await pool.query("SELECT variant_id FROM product_variants ORDER BY variant_id ASC LIMIT 20");
    console.log("First 20 variants (ASC):");
    console.table(res.rows);
    
    const res2 = await pool.query("SELECT variant_id FROM product_variants ORDER BY variant_id DESC LIMIT 5");
    console.log("Last 5 variants (DESC):");
    console.table(res2.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
