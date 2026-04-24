const pool = require('./backend/db');

async function testQueries() {
  try {
    console.log("Testing volRes...");
    const volRes = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as vol FROM orders");
    console.log("volRes success:", volRes.rows[0]);

    console.log("Testing sellRes...");
    const sellRes = await pool.query("SELECT COUNT(*) as sellers FROM sellers");
    console.log("sellRes success:", sellRes.rows[0]);

    console.log("Testing custRes...");
    const custRes = await pool.query("SELECT COUNT(*) as customers FROM customers");
    console.log("custRes success:", custRes.rows[0]);

    console.log("Testing recentActRes...");
    const recentActRes = await pool.query("SELECT order_id as detail, placed_at as time, 'New Order Placed' as action FROM orders ORDER BY placed_at DESC LIMIT 4");
    console.log("recentActRes success, rows:", recentActRes.rows.length);

    console.log("Testing topProdRes...");
    const topProdRes = await pool.query(`
         SELECT p.name, p.product_id, SUM(oi.quantity) as sales, SUM(oi.unit_price * oi.quantity) as rev 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.product_id 
         GROUP BY p.product_id, p.name 
         ORDER BY rev DESC LIMIT 3
      `);
    console.log("topProdRes success, rows:", topProdRes.rows.length);

    process.exit(0);
  } catch (err) {
    console.error("QUERY FAILED:");
    console.error(err);
    process.exit(1);
  }
}

testQueries();
