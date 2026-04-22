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
  console.log("Backfilling seller_id in payments table...");
  
  // Find orders where all items belong to the same seller
  const res = await client.query(`
    UPDATE payments p
    SET seller_id = sub.seller_id
    FROM (
      SELECT order_id, MIN(seller_id) as seller_id
      FROM order_items
      GROUP BY order_id
      HAVING COUNT(DISTINCT seller_id) = 1
    ) sub
    WHERE p.order_id = sub.order_id AND p.seller_id IS NULL
  `);
  
  console.log(`Updated ${res.rowCount} payment records.`);
  await client.end();
}
run().catch(console.error);
