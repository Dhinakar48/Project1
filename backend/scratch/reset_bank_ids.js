const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function resetBankIds() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log("Renumbering bank_account_id sequentially...");
    
    await client.query(`
      CREATE TEMP TABLE temp_banks AS 
      SELECT * FROM bank_accounts ORDER BY bank_account_id;
    `);
    
    await client.query("TRUNCATE TABLE bank_accounts RESTART IDENTITY CASCADE;");
    
    await client.query(`
      INSERT INTO bank_accounts (
        owner_id, owner_type, account_number, upi_id, bank_name, ifsc_code, 
        account_type, account_holder_name, verification_status, is_primary, created_at, updated_at
      )
      SELECT 
        owner_id, owner_type, account_number, upi_id, bank_name, ifsc_code, 
        account_type, account_holder_name, verification_status, is_primary, created_at, updated_at
      FROM temp_banks;
    `);
    
    await client.query('COMMIT');
    console.log("✅ bank_account_id has been reset to start from 1.");
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("❌ Error resetting IDs:", err.message);
  } finally {
    client.release();
    process.exit();
  }
}

resetBankIds();
