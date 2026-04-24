const pool = require('../db');

async function checkMonthlyFinances() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'monthly_finances'");
    console.log("Columns in monthly_finances:", JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

checkMonthlyFinances();
