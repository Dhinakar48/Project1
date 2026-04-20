const { Client } = require('pg');

async function clearTable() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: '3616',
    port: 5432,
    database: 'local_db'
  });

  try {
    await client.connect();
    await client.query("TRUNCATE TABLE product_variants CASCADE;");
    console.log("Successfully cleared all data from 'product_variants' table.");
  } catch (err) {
    console.error("Failed to clear table:", err.message);
  } finally {
    await client.end();
  }
}

clearTable();
