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
  console.log("Clearing all order-related data...");
  
  try {
    await client.query('BEGIN');
    
    // Deleting from child tables first (though CASCADE would handle it, this is safer for explicit reset)
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM order_sellers');
    await client.query('DELETE FROM payments');
    await client.query('DELETE FROM orders');
    
    // Reset sequences if any are used for order items or similar (though we use semantic IDs)
    // For example, if we have order_id_seq
    // await client.query('ALTER SEQUENCE order_id_seq RESTART WITH 1');
    
    await client.query('COMMIT');
    console.log("Successfully cleared all orders, items, payments, and seller summaries.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error clearing data:", err);
  } finally {
    await client.end();
  }
}
run();
