const pool = require('../db');

async function checkData() {
  const sellerId = 'SEL001';
  try {
    const prd = await pool.query("SELECT COUNT(*) FROM products WHERE seller_id = $1", [sellerId]);
    const ordItems = await pool.query("SELECT COUNT(*) FROM order_items WHERE seller_id = $1", [sellerId]);
    const ordSellers = await pool.query("SELECT COUNT(*) FROM order_sellers WHERE seller_id = $1", [sellerId]);
    const cust = await pool.query("SELECT COUNT(DISTINCT o.customer_id) as total_customers FROM orders o JOIN order_items oi ON o.order_id = oi.order_id WHERE oi.seller_id = $1", [sellerId]);

    console.log(`Stats for ${sellerId}:`);
    console.log(`Products: ${prd.rows[0].count}`);
    console.log(`Order Items: ${ordItems.rows[0].count}`);
    console.log(`Order Sellers: ${ordSellers.rows[0].count}`);
    console.log(`Customers: ${cust.rows[0].total_customers}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

checkData();
