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
  console.log("--- Tables ---");
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.table(tables.rows);

  console.log("\n--- Payments Schema ---");
  const payments = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'payments'");
  console.table(payments.rows);

  console.log("\n--- Payments Data Count ---");
  const count = await client.query("SELECT COUNT(*) FROM payments");
  console.log("Count:", count.rows[0].count);

  await client.end();
}
run();
