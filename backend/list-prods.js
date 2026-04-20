const { Client } = require('pg');

async function check() {
  const client = new Client({
    user: 'postgres', host: 'localhost', password: '3616', port: 5432, database: 'local_db'
  });
  try {
    await client.connect();
    const res = await client.query("SELECT product_id, name, array_length(images, 1) as len FROM products;");
    res.rows.forEach(r => console.log(`${r.product_id} - ${r.name}: ${r.len} images`));
  } finally {
    await client.end();
  }
}
check();
