const pool = require('./backend/db');

async function migrate() {
  try {
    console.log("Removing foreign key constraint from wishlist_items...");
    // Find constraint name first
    const res = await pool.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'wishlist_items'::regclass AND contype = 'f' AND confrelid = 'products'::regclass
    `);
    
    if (res.rows.length > 0) {
      const conname = res.rows[0].conname;
      console.log(`Dropping constraint: ${conname}`);
      await pool.query(`ALTER TABLE wishlist_items DROP CONSTRAINT "${conname}"`);
      console.log("Constraint dropped successfully.");
    } else {
      console.log("No constraint found to drop.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Migration Error:", err);
    process.exit(1);
  }
}

migrate();
