const pool = require('../db');

async function listTables() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log("Tables in public schema:", JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

listTables();
