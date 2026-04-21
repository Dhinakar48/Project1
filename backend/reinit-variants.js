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
    console.log("Dropping table...");
    await pool.query("DROP TABLE IF EXISTS product_variants CASCADE");
    console.log("Re-initializing database...");
    // We could call init-db.js but it's easier to just run the create here or run init-db separately
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
