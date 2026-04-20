const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function createOrderSellersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_sellers (
        order_seller_id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        seller_subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Order_Sellers table created successfully!");
  } catch (err) {
    console.error("❌ Error creating order_sellers table:", err.message);
  } finally {
    process.exit();
  }
}

createOrderSellersTable();
