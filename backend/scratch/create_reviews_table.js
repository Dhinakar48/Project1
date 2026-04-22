const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function createReviewsTable() {
  try {
    // 1. Create the sequence for review_id
    await pool.query(`CREATE SEQUENCE IF NOT EXISTS review_id_seq START 1;`);
    console.log("✅ Sequence 'review_id_seq' ensured.");

    // 2. Create the reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        review_id VARCHAR(20) PRIMARY KEY,
        order_item_id VARCHAR(30) REFERENCES order_items(order_item_id) ON DELETE CASCADE,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE CASCADE,
        product_id VARCHAR(50) REFERENCES products(product_id) ON DELETE CASCADE,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        body TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Table 'reviews' created successfully.");

    // 3. Create the ID generation function
    await pool.query(`
      CREATE OR REPLACE FUNCTION generate_review_id()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.review_id IS NULL THEN
            NEW.review_id := 'rev-' || LPAD(nextval('review_id_seq')::text, 3, '0');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✅ Function 'generate_review_id' created.");

    // 4. Create the trigger
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_generate_review_id ON reviews;
      CREATE TRIGGER trigger_generate_review_id
      BEFORE INSERT ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION generate_review_id();
    `);
    console.log("✅ Trigger 'trigger_generate_review_id' created.");

  } catch (err) {
    console.error("❌ Error during table creation:", err.message);
  } finally {
    await pool.end();
  }
}

createReviewsTable();
