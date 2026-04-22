const { Client } = require('pg');
const client = new Client({
  user: 'postgres', host: 'localhost', database: 'local_db', password: '3616', port: 5432,
});
async function run() {
  await client.connect();
  try {
    // Check if column exists and its length
    const res = await client.query(`
      SELECT character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'wishlist_items' AND column_name = 'product_id';
    `);
    
    if (res.rows.length > 0) {
      console.log("Current product_id length in wishlist_items:", res.rows[0].character_maximum_length);
      // ALTER to 50
      await client.query("ALTER TABLE wishlist_items ALTER COLUMN product_id TYPE VARCHAR(50);");
      console.log("Updated product_id to VARCHAR(50)");
    }

    // Also check wishlists table length just in case
    const res2 = await client.query(`
      SELECT character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'wishlists' AND column_name = 'wishlist_id';
    `);
    if (res2.rows.length > 0) {
      await client.query("ALTER TABLE wishlists ALTER COLUMN wishlist_id TYPE VARCHAR(50);");
      console.log("Updated wishlist_id to VARCHAR(50) in wishlists table");
    }

    const res3 = await client.query(`
      SELECT character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'wishlist_items' AND column_name = 'wishlist_id';
    `);
    if (res3.rows.length > 0) {
       await client.query("ALTER TABLE wishlist_items ALTER COLUMN wishlist_id TYPE VARCHAR(50);");
       console.log("Updated wishlist_id to VARCHAR(50) in wishlist_items table");
    }

  } catch (e) {
    console.error(e);
  }
  await client.end();
}
run();
