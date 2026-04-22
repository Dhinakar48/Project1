const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function run() {
  await client.connect();
  try {
    await client.query("DROP TABLE IF EXISTS payments");
    console.log("Dropped table 'payments'");

    await client.query(`
      CREATE TABLE payments (
        payment_id SERIAL PRIMARY KEY,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE SET NULL,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE SET NULL,
        order_id VARCHAR(20) REFERENCES orders(order_id) ON DELETE CASCADE,
        payment_method VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_id VARCHAR(100) UNIQUE,
        payment_status VARCHAR(50) DEFAULT 'Pending',
        paid_at TIMESTAMP,
        gateway_name VARCHAR(100),
        gateway_response_code VARCHAR(50),
        failure_reason_code VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created table 'payments' with correct schema");
  } catch (err) {
    console.error("Error updating schema:", err);
  } finally {
    await client.end();
  }
}
run();
