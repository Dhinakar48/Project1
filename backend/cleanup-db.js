const { Client } = require('pg');

async function cleanup() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: '3616',
    port: 5432,
    database: 'local_db'
  });

  try {
    await client.connect();
    console.log("Connected to database for cleanup...");

    await client.query("BEGIN;");

    // 1. Delete categories 1 to 6
    await client.query("DELETE FROM categories WHERE category_id BETWEEN 1 AND 6;");
    console.log("Deleted categories with IDs 1-6.");

    // 2. Temporarily disable foreign key constraints
    await client.query("ALTER TABLE products DROP CONSTRAINT products_category_id_fkey;");
    await client.query("ALTER TABLE product_images DROP CONSTRAINT product_images_product_id_fkey;");
    await client.query("ALTER TABLE wishlist_items DROP CONSTRAINT wishlist_items_product_id_fkey;");

    // 3. Re-sequence Categories
    await client.query(`
      CREATE TEMP TABLE cat_mapping AS 
      SELECT category_id as old_id, row_number() OVER (ORDER BY category_id) as new_id 
      FROM categories;
      
      UPDATE categories SET category_id = m.new_id 
      FROM cat_mapping m WHERE categories.category_id = m.old_id;
      
      UPDATE products SET category_id = m.new_id 
      FROM cat_mapping m WHERE products.category_id = m.old_id;
    `);

    // 4. Re-sequence Products
    await client.query(`
      CREATE TEMP TABLE prod_mapping AS 
      SELECT product_id as old_id, row_number() OVER (ORDER BY product_id) as new_id 
      FROM products;
      
      UPDATE products SET product_id = m.new_id 
      FROM prod_mapping m WHERE products.product_id = m.old_id;
      
      UPDATE product_images SET product_id = m.new_id 
      FROM prod_mapping m WHERE product_images.product_id = m.old_id;
      
      UPDATE wishlist_items SET product_id = m.new_id 
      FROM prod_mapping m WHERE wishlist_items.product_id = m.old_id;
    `);

    // 5. Restore constraints
    await client.query("ALTER TABLE products ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL;");
    await client.query("ALTER TABLE product_images ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;");
    await client.query("ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;");

    // 6. Reset Sequences
    await client.query("SELECT setval('categories_category_id_seq', COALESCE((SELECT MAX(category_id) FROM categories), 0) + 1, false);");
    await client.query("SELECT setval('products_product_id_seq', COALESCE((SELECT MAX(product_id) FROM products), 0) + 1, false);");

    await client.query("COMMIT;");
    console.log("Cleanup and re-indexing completed successfully.");

  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Cleanup failed:", err.message);
  } finally {
    await client.end();
  }
}

cleanup();
