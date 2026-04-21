const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT p.product_id, p.name, v.variant_value as color FROM products p JOIN product_variants v ON p.product_id = v.product_id WHERE v.variant_name = 'Color' AND p.name ILIKE '%samsung%'");
  console.table(res.rows);
  
  for (const row of res.rows) {
     const imgs = await client.query("SELECT image FROM product_images WHERE product_id = $1", [row.product_id]);
     console.log(`Images for ${row.name}:`, imgs.rows.map(r => r.image.substring(0, 50) + '...'));
  }
  
  await client.end();
}
run();
