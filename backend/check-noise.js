const { Client } = require('pg');

async function checkProduct() {
  const client = new Client({
    user: 'postgres', host: 'localhost', password: '3616', port: 5432, database: 'local_db'
  });
  try {
    await client.connect();
    const res = await client.query("SELECT product_id, name, images FROM products WHERE name ILIKE '%Noise Buds%';");
    console.log("Noise Buds Data:", JSON.stringify(res.rows, null, 2));
  } finally {
    await client.end();
  }
}
checkProduct();
