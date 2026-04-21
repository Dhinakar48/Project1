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
    const res = await pool.query("SELECT * FROM product_variants WHERE variant_value LIKE '%+%'");
    console.log("Variants with '+' in value:");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
