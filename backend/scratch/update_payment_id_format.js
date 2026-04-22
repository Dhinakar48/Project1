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
    console.log("Dropping existing payments table...");
    await client.query("DROP TABLE IF EXISTS payments");
    
    console.log("Creating sequence and table...");
    await client.query(`CREATE SEQUENCE IF NOT EXISTS payment_id_seq START 1;`);
    await client.query(`
      CREATE TABLE payments (
        payment_id VARCHAR(20) PRIMARY KEY,
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

    console.log("Creating trigger function...");
    await client.query(`
      CREATE OR REPLACE FUNCTION generate_payment_id()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.payment_id IS NULL THEN
            NEW.payment_id := 'PMT-' || LPAD(nextval('payment_id_seq')::text, 3, '0');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log("Applying trigger...");
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_generate_payment_id ON payments;
      CREATE TRIGGER trigger_generate_payment_id
      BEFORE INSERT ON payments
      FOR EACH ROW
      EXECUTE FUNCTION generate_payment_id();
    `);

    console.log("✅ Semantic Payment ID system initialized successfully.");
  } catch (err) {
    console.error("❌ Error updating schema:", err);
  } finally {
    await client.end();
  }
}
run();
