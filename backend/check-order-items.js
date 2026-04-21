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
  const res = await client.query("SELECT order_id, product_id, quantity, unit_price, total_price FROM order_items ORDER BY order_id DESC LIMIT 5");
  console.table(res.rows);
  await client.end();
}
run();
