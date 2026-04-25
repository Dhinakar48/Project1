const pool = require('./db');

async function test() {
  try {
    // Test insert with null customer_id and null seller_id
    const r = await pool.query(
      "INSERT INTO notifications (order_id, type, message) VALUES ($1, $2, $3) RETURNING notification_id",
      ['ORD-001', 'System Alert', 'Test cancellation alert']
    );
    console.log('Insert OK:', r.rows[0]);
    // Clean up
    await pool.query("DELETE FROM notifications WHERE notification_id = $1", [r.rows[0].notification_id]);
    console.log('Cleanup OK');
    process.exit(0);
  } catch (err) {
    console.error('FAILED:', err.message);
    console.error(err.detail || '');
    process.exit(1);
  }
}
test();
