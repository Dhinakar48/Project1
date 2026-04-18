const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});
async function check() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bank_accounts'");
        console.log("Columns in bank_accounts:");
        res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
        
        const constraints = await pool.query("SELECT conname FROM pg_constraint WHERE conrelid = 'bank_accounts'::regclass");
        console.log("\nConstraints:");
        constraints.rows.forEach(r => console.log(r.conname));

        const count = await pool.query("SELECT COUNT(*) FROM bank_accounts");
        console.log(`\nRow Count: ${count.rows[0].count}`);
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        pool.end();
    }
}
check();
