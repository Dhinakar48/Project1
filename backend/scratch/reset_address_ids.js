const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function resetAddressIds() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log("Renumbering address_id sequentially...");
    
    // Create a temporary table with sequential IDs
    await client.query(`
      CREATE TEMP TABLE temp_addresses AS 
      SELECT * FROM addresses ORDER BY address_id;
    `);
    
    // Truncate the original table (RESTART IDENTITY resets the sequence too)
    await client.query("TRUNCATE TABLE addresses RESTART IDENTITY CASCADE;");
    
    // Insert back without specifying ID so they get new sequential IDs
    await client.query(`
      INSERT INTO addresses (
        customer_id, sellerid, full_name, phone, address1, address2, 
        city, state, pincode, country, is_default, created_at, updated_at, deleted_at
      )
      SELECT 
        customer_id, sellerid, full_name, phone, address1, address2, 
        city, state, pincode, country, is_default, created_at, updated_at, deleted_at
      FROM temp_addresses;
    `);
    
    await client.query('COMMIT');
    console.log("✅ address_id table has been re-indexed successfully (1, 2, 3...)");
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("❌ Error re-indexing table:", err.message);
  } finally {
    client.release();
    process.exit();
  }
}

resetAddressIds();
