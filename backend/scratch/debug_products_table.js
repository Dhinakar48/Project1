const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function checkTable() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `);
    console.table(res.rows);
    
    const data = await pool.query("SELECT name, images FROM products LIMIT 5");
    console.log("Current Products Data:");
    console.log(JSON.stringify(data.rows, null, 2));
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit();
  }
}

checkTable();
