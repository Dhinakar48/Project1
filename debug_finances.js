const pool = require('./backend/db');

async function debugSellerFinances() {
  const sellerId = process.argv[2] || 'SEL001';
  try {
    const commRes = await pool.query('SELECT * FROM seller_commissions WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 5', [sellerId]);
    console.log('Recent Seller Commissions:', commRes.rows);

    const dailyRes = await pool.query('SELECT * FROM daily_finances WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 5', [sellerId]);
    console.log('Recent Daily Finances:', dailyRes.rows);
    
    const orderRes = await pool.query(`
      SELECT o.order_id, o.placed_at, o.payment_status, o.order_status, oi.total_amount 
      FROM order_items oi 
      JOIN orders o ON oi.order_id = o.order_id 
      WHERE oi.seller_id = $1 
      ORDER BY o.placed_at DESC LIMIT 5
    `, [sellerId]);
    console.log('Recent Orders:', orderRes.rows);

  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
debugSellerFinances();
