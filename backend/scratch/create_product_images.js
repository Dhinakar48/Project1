const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function createProductImagesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        image_id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Product_Images table created successfully!");
  } catch (err) {
    console.error("❌ Error creating product_images table:", err.message);
  } finally {
    process.exit();
  }
}

createProductImagesTable();
