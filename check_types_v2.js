const pool = require('./backend/db');

async function check() {
  const res = await pool.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('orders', 'order_items')");
  res.rows.forEach(r => console.log(`${r.table_name}.${r.column_name}: ${r.data_type}`));
  process.exit(0);
}

check();
