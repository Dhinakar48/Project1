const pool = require('../db');

async function createFinanceTransactionsTable() {
  try {
    console.log("Creating finance_transactions table...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS finance_transactions (
        finance_transaction_id VARCHAR(30) PRIMARY KEY,
        daily_finance_id VARCHAR(30) REFERENCES daily_finances(daily_finance_id) ON DELETE SET NULL,
        order_id VARCHAR(20) REFERENCES orders(order_id) ON DELETE SET NULL,
        payment_id VARCHAR(30),
        seller_payout_id VARCHAR(30),
        transaction_type VARCHAR(50) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("Table 'finance_transactions' created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    process.exit();
  }
}

createFinanceTransactionsTable();
