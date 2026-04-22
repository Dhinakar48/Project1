const { Client } = require('pg');
const client = new Client({
  user: 'postgres', host: 'localhost', database: 'local_db', password: '3616', port: 5432,
});
async function run() {
  await client.connect();
  const res = await client.query("SELECT * FROM order_items ORDER BY created_at DESC");
  console.table(res.rows);
  await client.end();
}
run();
