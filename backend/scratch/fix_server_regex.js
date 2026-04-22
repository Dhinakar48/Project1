const fs = require('fs');
const path = 'c:/Users/MAKESH/my-app/electronics-store/backend/server.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /app\.get\("\/customer-orders\/:customerId", async \(req, res\) => \{[\s\S]*?WHERE oi\.order_id = o\.order_id\s*p\.name as product_name, p\.images as product_images,[\s\S]*?WHERE oi\.seller_id = \$1\s*ORDER BY o\.placed_at DESC\s*`, \[sellerId\]\);/m;

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
        o.placed_at, o.order_status, o.payment_status, o.total_amount,
        p.name as product_name, p.images as product_images,
        c.name as customer_name, c.email as customer_email,
        a.full_name as shipping_name, a.address1, a.address2, a.city, a.state, a.pincode, a.phone as shipping_phone
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN addresses a ON o.address_id = a.address_id
      WHERE oi.seller_id = $1
      ORDER BY o.placed_at DESC
    \`, [sellerId]);`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
    console.log("✅ Fixed server.js using regex.");
} else {
    console.log("❌ Regex failed to match.");
}
