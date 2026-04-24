const pool = require('../db');

async function migrate_wishlist() {
  try {
    console.log("Starting Wishlist Data Migration...");

    // Fix wishlist_id format
    const wishlists = await pool.query("SELECT * FROM wishlists ORDER BY created_at ASC");
    let wishlistCount = 1;
    for (const w of wishlists.rows) {
      const newId = `WIS-${wishlistCount.toString().padStart(3, '0')}`;
      if (newId !== w.wishlist_id) {
        await pool.query("UPDATE wishlist_items SET wishlist_id = $1 WHERE wishlist_id = $2", [newId, w.wishlist_id]);
        await pool.query("UPDATE wishlists SET wishlist_id = $1 WHERE wishlist_id = $2", [newId, w.wishlist_id]);
      }
      wishlistCount++;
    }
    console.log(`Verified/Renamed ${wishlists.rowCount} wishlists to sequential format (WIS-XXX).`);

    // Fix wishlist_item_id format
    const rows = await pool.query("SELECT * FROM wishlist_items ORDER BY added_at ASC");
    let count = 1;
    for (const row of rows.rows) {
      const newId = `WIS-IT-${count.toString().padStart(4, '0')}`;
      if (newId !== row.wishlist_item_id) {
        await pool.query(
          "UPDATE wishlist_items SET wishlist_item_id = $1 WHERE wishlist_item_id = $2",
          [newId, row.wishlist_item_id]
        );
      }
      count++;
    }
    console.log(`Renamed ${rows.rowCount} wishlist items to sequential format (WIS-IT-XXXX).`);

    console.log("Wishlist Migration Completed Successfully!");
  } catch (err) {
    console.error("Migration Failed:", err);
  } finally {
    process.exit();
  }
}

migrate_wishlist();
