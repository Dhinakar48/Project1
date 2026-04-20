const { Client } = require('pg');

async function reindex() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: '3616',
    port: 5432,
    database: 'local_db'
  });

  try {
    await client.connect();
    console.log("Connected for re-indexing semantic IDs...");

    await client.query("BEGIN;");

    // 1. Drop constraints
    await client.query("ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;");
    await client.query("ALTER TABLE wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_product_id_fkey;");
    await client.query("ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;");

    // 2. Create mapping
    await client.query(`
      CREATE TEMP TABLE prod_mapping AS 
      SELECT product_id as old_id, 'PRD' || LPAD(row_number() OVER (ORDER BY product_id)::text, 3, '0') as new_id 
      FROM products;
    `);

    // 3. Update products and dependencies
    await client.query("UPDATE products SET product_id = m.new_id FROM prod_mapping m WHERE products.product_id = m.old_id;");
    await client.query("UPDATE product_images SET product_id = m.new_id FROM prod_mapping m WHERE product_images.product_id = m.old_id;");
    await client.query("UPDATE wishlist_items SET product_id = m.new_id FROM prod_mapping m WHERE wishlist_items.product_id = m.old_id;");
    await client.query("UPDATE product_variants SET product_id = m.new_id FROM prod_mapping m WHERE product_variants.product_id = m.old_id;");

    // 4. Restore constraints
    await client.query("ALTER TABLE product_images ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;");
    await client.query("ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;");
    await client.query("ALTER TABLE product_variants ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;");

    await client.query("COMMIT;");
    console.log("Semantic IDs re-indexed to be sequential (PRD001, PRD002...).");
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Re-indexing failed:", err.message);
  } finally {
    await client.end();
  }
}

reindex();
