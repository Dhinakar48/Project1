const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function diagnostic() {
  try {
    console.log("Checking table existence...");
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_variants'
      );
    `);
    console.log("Table exists:", tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      console.log("Checking columns...");
      const cols = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'product_variants'
      `);
      console.table(cols.rows);

      console.log("Attempting to select first 5 rows...");
      const data = await pool.query("SELECT * FROM product_variants LIMIT 5");
      console.log("Data count:", data.rows.length);
      console.log("Sample data:", JSON.stringify(data.rows, null, 2));
    }
  } catch (err) {
    console.error("DIAGNOSTIC ERROR:", err.message);
    if (err.detail) console.error("Detail:", err.detail);
    if (err.hint) console.error("Hint:", err.hint);
  } finally {
    await pool.end();
  }
}

diagnostic();
