const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function createWishlistItemsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        wishlist_item_id SERIAL PRIMARY KEY,
        wishlist_id INT REFERENCES wishlists(wishlist_id) ON DELETE CASCADE,
        product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (wishlist_id, product_id)
      );
    `);
    console.log("✅ Wishlist_Items table created successfully!");
  } catch (err) {
    console.error("❌ Error creating wishlist_items table:", err.message);
  } finally {
    process.exit();
  }
}

createWishlistItemsTable();
