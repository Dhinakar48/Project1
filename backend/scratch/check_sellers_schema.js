const pool = require('../db');

async function checkSellersSchema() {
  try {
    const res = await pool.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'sellers'");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

checkSellersSchema();
