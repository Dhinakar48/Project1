const pool = require('./backend/db');

async function checkDataTypes() {
  const tables = ['orders', 'order_items', 'sellers', 'customers', 'products'];
  for (const table of tables) {
    try {
      const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table]);
      console.log(`Table: ${table}`);
      res.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
      console.log('---');
    } catch (err) {
      console.error(`Error checking table ${table}:`, err.message);
    }
  }
  process.exit(0);
}

checkDataTypes();
