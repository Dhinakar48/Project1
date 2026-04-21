const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function run() {
  try {
    const wishlists = await pool.query("SELECT * FROM wishlists");
    console.log("Wishlists:", wishlists.rows);
    
    const items = await pool.query("SELECT * FROM wishlist_items");
    console.log("Wishlist Items:", items.rows);
  } finally {
    await pool.end();
  }
}
run();
