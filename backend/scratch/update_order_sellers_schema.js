const { Client } = require('pg');
const client = new Client({
  user: 'postgres', host: 'localhost', database: 'local_db', password: '3616', port: 5432,
});
async function run() {
  await client.connect();
  try {
    // Drop the table and recreate it with the correct type for order_id
    await client.query("DROP TABLE IF EXISTS order_sellers;");
    await client.query(`
      CREATE TABLE order_sellers (
        order_seller_id SERIAL PRIMARY KEY,
        order_id VARCHAR(20) REFERENCES orders(order_id) ON DELETE CASCADE,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        seller_subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'order_sellers' recreated successfully with VARCHAR order_id.");
  } catch (e) {
    console.error(e);
  }
  await client.end();
}
run();
