const pool = require('./backend/db');

async function checkFeatured() {
  try {
    const res = await pool.query("SELECT * FROM products WHERE is_featured = true");
    console.log("Featured Products Count:", res.rows.length);
    if (res.rows.length > 0) {
      console.log("First Featured Product Sample:", res.rows[0]);
    }
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkFeatured();
