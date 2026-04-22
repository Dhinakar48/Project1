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
  const res = await client.query(`
    SELECT ci.*, c.customer_id 
    FROM cart_items ci 
    JOIN carts c ON ci.cart_id = c.cart_id 
    LIMIT 10
  `);
  console.table(res.rows);
  await client.end();
}
run();
