const pool = require('../db');

async function test() {
  try {
    const res = await pool.query("SELECT * FROM sellers LIMIT 1");
    console.log("Sellers found:", res.rowCount);
    const res2 = await pool.query("SELECT * FROM addresses LIMIT 1");
    console.log("Addresses found:", res2.rowCount);
    process.exit(0);
  } catch (err) {
    console.error("Database test failed:", err.message);
    process.exit(1);
  }
}

test();
