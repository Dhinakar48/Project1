const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function checkConstraints() {
  try {
    const res = await pool.query(`
      SELECT 
        conname AS constraint_name, 
        pg_get_constraintdef(oid) AS constraint_definition
      FROM pg_constraint 
      WHERE conrelid = 'addresses'::regclass;
    `);
    console.log("Constraints for 'addresses':");
    console.table(res.rows);
  } catch (e) {
    console.error(e.message);
  } finally {
    process.exit();
  }
}

checkConstraints();
