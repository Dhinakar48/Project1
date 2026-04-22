const { Client } = require('pg');
const client = new Client({
  user: 'postgres', host: 'localhost', database: 'local_db', password: '3616', port: 5432,
});
async function run() {
  await client.connect();
  try {
    // Update order_items.total_price with o.total_amount
    const res = await client.query(`
      UPDATE order_items oi
      SET total_price = o.total_amount
      FROM orders o
      WHERE oi.order_id = o.order_id
    `);
    console.log(`Updated ${res.rowCount} order items.`);

    // Also update order_items.unit_price if total_price is changed and quantity is 1? 
    // User didn't ask but maybe consistent. 
    // I'll stick to what they asked.
  } catch (e) {
    console.error(e);
  }
  await client.end();
}
run();
