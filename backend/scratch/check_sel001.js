const pool = require('../db');

async function checkData() {
  try {
    const res = await pool.query("SELECT * FROM daily_finances WHERE seller_id = 'SEL001'");
    console.log("Rows found for SEL001:", res.rowCount);
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

checkData();
