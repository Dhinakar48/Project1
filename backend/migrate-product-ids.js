const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: '3616',
    port: 5432,
    database: 'local_db'
  });

  try {
    await client.connect();
    console.log("Connected to database for ID migration...");

    await client.query("BEGIN;");

    // 1. Drop ALL foreign keys pointing to products
    await client.query("ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;");
    await client.query("ALTER TABLE wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_product_id_fkey;");
    await client.query("ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;");

    // 2. Change product_id type in all tables
    await client.query("ALTER TABLE products ALTER COLUMN product_id TYPE VARCHAR(20);");
    await client.query("ALTER TABLE product_images ALTER COLUMN product_id TYPE VARCHAR(20);");
    await client.query("ALTER TABLE wishlist_items ALTER COLUMN product_id TYPE VARCHAR(20);");
    await client.query("ALTER TABLE product_variants ALTER COLUMN product_id TYPE VARCHAR(20);");
    
    // 3. Convert IDs to PRD001 format
    await client.query("UPDATE products SET product_id = 'PRD' || LPAD(product_id::text, 3, '0') WHERE product_id ~ '^[0-9]+$';");
    await client.query("UPDATE product_images SET product_id = 'PRD' || LPAD(product_id::text, 3, '0') WHERE product_id ~ '^[0-9]+$';");
    await client.query("UPDATE wishlist_items SET product_id = 'PRD' || LPAD(product_id::text, 3, '0') WHERE product_id ~ '^[0-9]+$';");
    await client.query("UPDATE product_variants SET product_id = 'PRD' || LPAD(product_id::text, 3, '0') WHERE product_id ~ '^[0-9]+$';");

    // 4. Restore constraints
    await client.query("ALTER TABLE product_images ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;");
    await client.query("ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;");
    await client.query("ALTER TABLE product_variants ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;");

    await client.query("COMMIT;");
    console.log("Migration to semantic Product IDs (PRD001...) completed successfully.");
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

migrate();
