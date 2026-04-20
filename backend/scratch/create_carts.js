const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function createCartsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carts (
        cart_id SERIAL PRIMARY KEY,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_customer_cart UNIQUE (customer_id)
      );
    `);
    console.log("✅ Carts table created successfully!");
  } catch (err) {
    console.error("❌ Error creating carts table:", err.message);
  } finally {
    process.exit();
  }
}

createCartsTable();
