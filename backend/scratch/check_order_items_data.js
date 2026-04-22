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
    SELECT oi.*, o.customer_id 
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    ORDER BY oi.created_at DESC
    LIMIT 20
  `);
  console.table(res.rows);
  await client.end();
}
run();
