const pool = require('../db');

async function migrate() {
  try {
    console.log("Starting Cart Data Migration...");
    
    // 1. Fix variant_id typo 'default-xxx' -> NULL
    const fixVariants = await pool.query(
      "UPDATE cart_items SET variant_id = NULL WHERE variant_id LIKE 'default-%'"
    );
    console.log(`Updated ${fixVariants.rowCount} rows with 'default-' variant placeholders.`);

    // 2. Fix cart_item_id format
    const rows = await pool.query("SELECT * FROM cart_items ORDER BY added_at ASC");
    let count = 1;
    for (const row of rows.rows) {
      const newId = `CRT-IT-${count.toString().padStart(4, '0')}`;
      await pool.query(
        "UPDATE cart_items SET cart_item_id = $1 WHERE cart_item_id = $2",
        [newId, row.cart_item_id]
      );
      count++;
    }
    console.log(`Renamed ${rows.rowCount} cart items to sequential format (CRT-IT-XXXX).`);

    // 3. Fix cart_id format
    const carts = await pool.query("SELECT * FROM carts ORDER BY created_at ASC");
    let cartCount = 1;
    for (const cart of carts.rows) {
      const newCartId = `CRT-${cartCount.toString().padStart(3, '0')}`;
      // Need to handle FK constraints - update items first or disable constraints
      // Since we are in a simple setup, we'll update items first
      await pool.query("UPDATE cart_items SET cart_id = $1 WHERE cart_id = $2", [newCartId, cart.cart_id]);
      await pool.query("UPDATE carts SET cart_id = $1 WHERE cart_id = $2", [newCartId, cart.cart_id]);
      cartCount++;
    }
    console.log(`Renamed ${carts.rowCount} carts to sequential format (CRT-XXX).`);

    console.log("Migration Completed Successfully!");
  } catch (err) {
    console.error("Migration Failed:", err);
  } finally {
    process.exit();
  }
}

migrate();
