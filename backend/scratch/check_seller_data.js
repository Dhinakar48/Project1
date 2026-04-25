const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function checkData() {
  const client = await pool.connect();
  try {
    console.log("--- Sellers ---");
    const sellers = await client.query("SELECT seller_id, gstin, pan, aadhar FROM sellers");
    console.table(sellers.rows);

    console.log("--- Bank Accounts ---");
    const banks = await client.query("SELECT owner_id, account_number, bank_name FROM bank_accounts");
    console.table(banks.rows);

    console.log("--- Addresses ---");
    const addrs = await client.query("SELECT seller_id, address1, city FROM addresses WHERE seller_id IS NOT NULL");
    console.table(addrs.rows);

  } catch (e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}

checkData();
