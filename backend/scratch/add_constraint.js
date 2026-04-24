const pool = require('../db');

async function addConstraint() {
  try {
    await pool.query("ALTER TABLE addresses ADD CONSTRAINT unique_seller UNIQUE (seller_id)");
    console.log("✅ Unique constraint on seller_id added successfully.");
    process.exit(0);
  } catch (err) {
    if (err.message.includes("already exists")) {
       console.log("⚠️ Constraint already exists.");
       process.exit(0);
    }
    console.error("Failed to add constraint:", err.message);
    process.exit(1);
  }
}

addConstraint();
