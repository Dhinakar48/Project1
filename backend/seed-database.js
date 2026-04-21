const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

const productsData = {
    "1": { name: "Bose Buds Pro", brand: "Bose", category: "Audio", price: "9999", variants: [{ id: "v1_1", name: "Pearl", price: "9999", img: "/featured/buds1.avif" }, { id: "v1_2", name: "Midnight", price: "10999", img: "/featured/buds2.jpg" }] },
    "2": { name: "Pulse Watch X", brand: "Pulse", category: "Wearables", price: "11999", variants: [{ id: "v2_1", name: "Titanium", price: "11999", img: "/featured/watch1.avif" }, { id: "v2_2", name: "Ocean", price: "13999", img: "/featured/watch2.webp" }] },
    "3": { name: "Vertex Laptop 16", brand: "Vertex", category: "Computing", price: "124999", variants: [{ id: "v3_1", name: "Silver", price: "124999", img: "/computing/laptop5.avif" }, { id: "v3_2", name: "Graphite", price: "134999", img: "/featured/laptop2.jpg" }] },
    "4": { name: "Nothing Phone 4a", brand: "Nothing", category: "Computing", price: "34999", variants: [{ id: "v4_1", name: "White", price: "34999", img: "/featured/headphone3.jpg" }, { id: "v4_2", name: "Pink", price: "35999", img: "/featured/headphone4.png" }] },
    "13": { name: "Samsung S26 Ultra", brand: "Samsung", category: "Computing", price: "134999", discount: 10, variants: [{ id: "v13_1", name: "Rose Pink", price: "134999", img: "/computing/mobile1.webp" }, { id: "v13_2", name: "Dark Gray", price: "136999", img: "/computing/mobile2.webp" }] }
};

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get the seller ID
    const sellerRes = await client.query("SELECT seller_id FROM sellers WHERE email = 'dhinakar3616@gmail.com'");
    if (sellerRes.rows.length === 0) {
        console.error("Seller not found!");
        return;
    }
    const sellerId = sellerRes.rows[0].seller_id;
    console.log("Seeding for seller:", sellerId);

    for (const id in productsData) {
      const p = productsData[id];
      const productId = `PRD${id.padStart(3, '0')}`;
      
      // Upsert product
      await client.query(`
        INSERT INTO products (product_id, seller_id, name, brand, price, images, discount, stock_quantity)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 100)
        ON CONFLICT (product_id) DO UPDATE SET 
            seller_id = EXCLUDED.seller_id,
            name = EXCLUDED.name,
            price = EXCLUDED.price,
            discount = EXCLUDED.discount
      `, [productId, sellerId, p.name, p.brand, p.price, [p.variants[0].img], p.discount || 0]);

      for (const v of p.variants) {
         await client.query(`
           INSERT INTO product_variants (variant_id, product_id, variant_name, variant_value, price, stock_quantity)
           VALUES ($1, $2, $3, $4, $5, 100)
           ON CONFLICT (variant_id) DO UPDATE SET price = EXCLUDED.price
         `, [v.id, productId, 'Color', v.name, v.price]);
      }
    }

    // Fix existing order items to point to this seller!
    await client.query("UPDATE order_items SET seller_id = $1 WHERE seller_id IS NULL", [sellerId]);

    await client.query('COMMIT');
    console.log("Database seeded successfully!");
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
