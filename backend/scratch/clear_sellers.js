const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function clearSellers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log("Cleaning up seller bank accounts...");
    await client.query("DELETE FROM bank_accounts WHERE owner_type = 'seller'");
    
    console.log("Cleaning up seller addresses...");
    await client.query("DELETE FROM addresses WHERE sellerid IS NOT NULL");
    
    console.log("Cleaning up sellers...");
    await client.query("DELETE FROM sellers");
    
    await client.query('COMMIT');
    console.log("✅ All seller data cleared successfully. Starting freshly!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Error clearing data:", err.message);
  } finally {
    client.release();
    process.exit();
  }
}

clearSellers();
