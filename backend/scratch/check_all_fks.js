const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres", host: "localhost", database: "local_db", password: "3616", port: 5432,
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT 
        tc.table_name, kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY';
    `);
    console.table(res.rows);
  } catch(e) { console.error(e.message); }
  finally { process.exit(); }
}
run();
