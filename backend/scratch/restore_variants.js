const pool = require('../db');

async function migrate_back() {
  try {
    console.log("Restoring default variant IDs...");
    
    const items = await pool.query("SELECT cart_item_id, product_id FROM cart_items WHERE variant_id IS NULL");
    
    for (const item of items.rows) {
      const defaultVariant = `default-${item.product_id}`;
      await pool.query(
        "UPDATE cart_items SET variant_id = $1 WHERE cart_item_id = $2",
        [defaultVariant, item.cart_item_id]
      );
    }
    
    console.log(`Restored ${items.rowCount} rows to use 'default-PRDxxx' format.`);
    console.log("Migration Completed Successfully!");
  } catch (err) {
    console.error("Migration Failed:", err);
  } finally {
    process.exit();
  }
}

migrate_back();
