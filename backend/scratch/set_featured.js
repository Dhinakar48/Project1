const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function setFeatured() {
  try {
    const productsToFeature = ['PRD001', 'PRD002', 'PRD003'];
    for (const pId of productsToFeature) {
      await pool.query("UPDATE products SET is_featured = true WHERE product_id = $1", [pId]);
      console.log(`Marked ${pId} as featured.`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

setFeatured();
