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
    console.log("Checking table existence for 'product_images'...");
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_images'
      );
    `);
    console.log("Table exists:", tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      console.log("Checking columns...");
      const cols = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'product_images'
      `);
      console.table(cols.rows);
    }
  } catch (err) {
    console.error("DIAGNOSTIC ERROR:", err.message);
  } finally {
    await pool.end();
  }
}

diagnostic();
