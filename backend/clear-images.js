const { Client } = require('pg');

async function clearImagesTable() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: '3616',
    port: 5432,
    database: 'local_db'
  });

  try {
    await client.connect();
    await client.query("TRUNCATE TABLE product_images CASCADE;");
    console.log("Successfully cleared all data from 'product_images' table.");
  } catch (err) {
    console.error("Failed to clear table:", err.message);
  } finally {
    await client.end();
  }
}

clearImagesTable();
