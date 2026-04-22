const { Client } = require('pg');
const client = new Client({
  user: 'postgres', host: 'localhost', database: 'local_db', password: '3616', port: 5432,
});
async function run() {
  await client.connect();
  const res = await client.query("SELECT * FROM orders");
  console.table(res.rows.map(r => ({
    id: r.order_id,
    sub: r.subtotal,
    disc: r.discount_amount,
    ship: r.shipping_charge,
    total: r.total_amount,
    calc: parseFloat(r.subtotal) - parseFloat(r.discount_amount) + parseFloat(r.shipping_charge)
  })));
  await client.end();
}
run();
