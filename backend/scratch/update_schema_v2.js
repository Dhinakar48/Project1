const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function run() {
  try {
    await pool.query("ALTER TABLE addresses ADD COLUMN IF NOT EXISTS address_type VARCHAR(20) DEFAULT 'Home';");
    console.log("Column 'address_type' added successfully.");
    
    // Add a second address for CUS005 (or whoever is likely active)
    const res = await pool.query("SELECT customer_id FROM customers ORDER BY created_at DESC LIMIT 1");
    if (res.rows.length > 0) {
      const cId = res.rows[0].customer_id;
      await pool.query(
        `INSERT INTO addresses (customer_id, full_name, phone, address_line1, city, state, pincode, country, address_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [cId, 'Office Contact', '+91 99999 88888', '456 Business Park, Floor 2', 'Erode', 'Tamil Nadu', '638456', 'India', 'Work']
      );
      console.log("Added a second address for customer:", cId);
    }
  } catch (err) {
    console.error("Error updating schema:", err.message);
  } finally {
    await pool.end();
  }
}

run();
