const { Client } = require('pg');

async function checkSchema() {
  const client = new Client({
    user: 'postgres', host: 'localhost', password: '3616', port: 5432, database: 'local_db'
  });
  try {
    await client.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products';");
    console.log(res.rows);
  } finally {
    await client.end();
  }
}
checkSchema();
