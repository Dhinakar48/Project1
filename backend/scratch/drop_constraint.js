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
    await pool.query("ALTER TABLE addresses DROP CONSTRAINT IF EXISTS unique_customer_address;");
    console.log("Constraint 'unique_customer_address' dropped successfully.");
  } catch (err) {
    console.error("Error dropping constraint:", err.message);
  } finally {
    await pool.end();
  }
}

run();
