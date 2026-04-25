const { Client } = require('pg');

async function updateDB() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: '3616',
    port: 5432,
    database: 'local_db'
  });

  try {
    await client.connect();
    await client.query('ALTER TABLE bank_accounts ALTER COLUMN account_number TYPE TEXT;');
    await client.query('ALTER TABLE bank_accounts ALTER COLUMN ifsc_code TYPE TEXT;');
    console.log("Database schema updated: account_number and ifsc_code changed to TEXT");
  } catch (err) {
    console.error("Error updating schema:", err);
  } finally {
    await client.end();
  }
}

updateDB();
