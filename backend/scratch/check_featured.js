const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function checkFeatured() {
  try {
    const res = await pool.query("SELECT product_id, name, is_featured, is_active, deleted_at FROM products WHERE is_featured = true");
    console.log("Featured Products in DB:", res.rows);
    
    const allCount = await pool.query("SELECT COUNT(*) FROM products");
    console.log("Total Products in DB:", allCount.rows[0].count);
    
    const activeFeatured = await pool.query("SELECT COUNT(*) FROM products WHERE is_featured = true AND is_active = true AND deleted_at IS NULL");
    console.log("Active Featured Products:", activeFeatured.rows[0].count);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkFeatured();
