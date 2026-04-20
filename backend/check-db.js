const { Client } = require('pg');

async function check() {
  const client = new Client({
    user: 'postgres', host: 'localhost', password: '3616', port: 5432, database: 'local_db'
  });
  try {
    await client.connect();
    const res = await client.query("SELECT * FROM categories ORDER BY category_id;");
    console.log("Current Categories:", res.rows);
  } finally {
    await client.end();
  }
}
check();
