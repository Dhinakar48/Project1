const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function listTables() {
  const result = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  console.log("Tables in database:", result.rows.map(r => r.table_name).join(', '));
  process.exit();
}

listTables();
