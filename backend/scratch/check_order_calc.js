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
  const res = await client.query("SELECT * FROM order_items");
  console.table(res.rows.map(r => ({
    id: r.order_item_id,
    order: r.order_id,
    qty: r.quantity,
    unit: r.unit_price,
    total: r.total_price,
    calc: parseFloat(r.unit_price) * r.quantity
  })));
  await client.end();
}
run();
