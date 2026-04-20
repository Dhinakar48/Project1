const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function createProductVariantsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        variant_id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
        sku VARCHAR(100) UNIQUE,
        variant_name VARCHAR(100),
        variant_value VARCHAR(100),
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INT DEFAULT 0,
        weight DECIMAL(10, 2),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Product_Variants table created successfully!");
  } catch (err) {
    console.error("❌ Error creating product_variants table:", err.message);
  } finally {
    process.exit();
  }
}

createProductVariantsTable();
