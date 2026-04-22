const { Client } = require('pg');
const client = new Client({
  user: 'postgres', host: 'localhost', database: 'local_db', password: '3616', port: 5432,
});
async function run() {
  await client.connect();
  try {
    await client.query("ALTER TABLE orders ADD COLUMN platform_fee DECIMAL(10, 2) DEFAULT 15.00;");
    console.log("Column platform_fee added.");
  } catch (e) {
    if (e.code === '42701') {
      console.log("Column already exists.");
    } else {
      console.error(e);
    }
  }
  await client.end();
}
run();
