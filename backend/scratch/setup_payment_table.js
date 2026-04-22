const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function setup() {
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_payment_methods (
        payment_method_id SERIAL PRIMARY KEY,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        last4 VARCHAR(4) NOT NULL,
        expiry VARCHAR(10) NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ customer_payment_methods table ready!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

setup();
