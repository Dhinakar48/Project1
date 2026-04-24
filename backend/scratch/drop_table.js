const pool = require('../db');

async function dropTable() {
  try {
    console.log("Dropping customer_payment_methods table...");
    await pool.query("DROP TABLE IF EXISTS customer_payment_methods CASCADE;");
    console.log("Table 'customer_payment_methods' dropped successfully.");
  } catch (err) {
    console.error("Error dropping table:", err);
  } finally {
    process.exit();
  }
}

dropTable();
