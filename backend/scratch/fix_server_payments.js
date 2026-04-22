const fs = require('fs');
const path = 'c:/Users/MAKESH/my-app/electronics-store/backend/server.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `app.get("/customer-orders/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const result = await pool.query(\`
      SELECT o.*, 
             (SELECT json_agg(items) FROM (
                SELECT oi.*, p.name, p.images
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = o.order_id`;

// Restore the broken part and add the new routes
const replacement = `app.get("/customer-orders/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const result = await pool.query(\`
      SELECT o.*, 
             (SELECT json_agg(items) FROM (
                SELECT oi.*, p.name, p.images
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = o.order_id
             ) items) as items
      FROM orders o
      WHERE o.customer_id = $1
      ORDER BY o.placed_at DESC
    \`, [customerId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch customer orders error" });
  }
});

app.get("/payment-methods/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM customer_payment_methods WHERE customer_id = $1 ORDER BY created_at DESC", [customerId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching payment methods" });
  }
});

app.post("/payment-methods", async (req, res) => {
  const { customerId, type, last4, expiry, isDefault } = req.body;
  try {
    if (isDefault) {
      await pool.query("UPDATE customer_payment_methods SET is_default = false WHERE customer_id = $1", [customerId]);
    }
    const result = await pool.query(
      "INSERT INTO customer_payment_methods (customer_id, type, last4, expiry, is_default) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [customerId, type, last4, expiry, isDefault || false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving payment method" });
  }
});

app.delete("/payment-methods/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM customer_payment_methods WHERE payment_method_id = $1", [id]);
    res.json({ message: "Payment method deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting payment method" });
  }
});

app.get("/seller-orders/:sellerId", async (req, res) => {
  const { sellerId } = req.params;
  try {
    const result = await pool.query(\`
      SELECT 
        oi.*, 
        o.placed_at, o.order_status, o.payment_status, o.total_amount,`;

if (content.includes(targetStr)) {
    // We need to find where the broken part starts and ends.
    // The broken part starts at targetStr and ends where it starts talking about products p.
    // Actually, looking at the previous view_file:
    // 1291:                 WHERE oi.order_id = o.order_id
    // 1292:         p.name as product_name, p.images as product_images,
    
    // I'll use a more direct approach: REPLACE the whole section from 1282 to 1308.
    const lines = content.split('\n');
    lines.splice(1281, 27, replacement); // 1281 is line 1282 (0-indexed)
    fs.writeFileSync(path, lines.join('\n'));
    console.log("✅ Fixed server.js and added payment routes.");
} else {
    console.log("❌ Could not find target in server.js.");
}
