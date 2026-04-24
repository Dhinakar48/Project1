const pool = require('../db');

async function checkAnnual() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'annual_finances'");
    console.log("Columns in annual_finances:", JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

checkAnnual();
