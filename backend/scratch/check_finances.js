const pool = require('../db');

async function checkDailyFinances() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'daily_finances'");
    console.log("Columns in daily_finances:", JSON.stringify(res.rows, null, 2));
    
    if (res.rowCount === 0) {
      console.log("Table daily_finances does not exist.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

checkDailyFinances();
