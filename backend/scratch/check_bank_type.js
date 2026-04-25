const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'local_db', password: '3616', port: 5432 });

async function check() {
  const client = await pool.connect();
  const res = await client.query("SELECT owner_id, owner_type FROM bank_accounts");
  console.table(res.rows);
  client.release();
  pool.end();
}
check();
