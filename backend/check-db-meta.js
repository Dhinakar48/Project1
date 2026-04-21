const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conrelid = 'products'::regclass
    `);
    console.log("Constraints:", JSON.stringify(res.rows, null, 2));
    
    // Also check for triggers again just in case
    const triggers = await pool.query(`
      SELECT tgname 
      FROM pg_trigger 
      WHERE tgrelid = 'products'::regclass
    `);
    console.log("Triggers:", JSON.stringify(triggers.rows, null, 2));
    
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
