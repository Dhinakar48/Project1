const pool = require('../db');

async function createCommissionsTable() {
  try {
    console.log("Creating seller_commissions table...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seller_commissions (
        commission_id VARCHAR(30) PRIMARY KEY,
        order_item_id VARCHAR(30) REFERENCES order_items(order_item_id) ON DELETE CASCADE,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        order_id VARCHAR(20) REFERENCES orders(order_id) ON DELETE CASCADE,
        sale_amount DECIMAL(15, 2) NOT NULL,
        commission_rate DECIMAL(5, 2) NOT NULL,
        commission_amount DECIMAL(15, 2) NOT NULL,
        seller_earnings DECIMAL(15, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("Table 'seller_commissions' created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    process.exit();
  }
}

createCommissionsTable();
