const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    user: 'postgres', host: 'localhost', password: '3616', port: 5432, database: 'local_db'
  });
  try {
    await client.connect();
    await client.query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE");
    console.log("Column 'is_active' added to customers table successfully.");
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
migrate();
