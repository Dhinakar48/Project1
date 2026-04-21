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
    const res = await pool.query("SELECT variant_id FROM product_variants ORDER BY variant_id DESC");
    console.log("All variants (DESC):");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
