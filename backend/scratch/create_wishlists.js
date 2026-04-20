const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function createWishlistsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        wishlist_id SERIAL PRIMARY KEY,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_customer_wishlist UNIQUE (customer_id)
      );
    `);
    console.log("✅ Wishlists table created successfully!");
  } catch (err) {
    console.error("❌ Error creating wishlists table:", err.message);
  } finally {
    process.exit();
  }
}

createWishlistsTable();
