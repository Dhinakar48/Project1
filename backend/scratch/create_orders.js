const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function createOrdersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id SERIAL PRIMARY KEY,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE SET NULL,
        address_id INT REFERENCES addresses(address_id) ON DELETE SET NULL,
        coupon_id VARCHAR(50),
        subtotal DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        shipping_charge DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        order_status VARCHAR(50) DEFAULT 'Pending',
        payment_status VARCHAR(50) DEFAULT 'Pending',
        cancellation_reason TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Orders table created successfully!");
  } catch (err) {
    console.error("❌ Error creating orders table:", err.message);
  } finally {
    process.exit();
  }
}

createOrdersTable();
