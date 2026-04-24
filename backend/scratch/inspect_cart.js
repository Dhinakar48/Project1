const pool = require('../db');
async function check() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_items'");
    console.log("Columns in cart_items:", res.rows.map(r => r.column_name).join(', '));
    const data = await pool.query("SELECT * FROM cart_items LIMIT 5");
    console.log("Sample Data:", JSON.stringify(data.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
check();
