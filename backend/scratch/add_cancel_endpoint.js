const fs = require('fs');
const path = 'c:/Users/MAKESH/my-app/electronics-store/backend/server.js';
let content = fs.readFileSync(path, 'utf8');

const searchStr = 'app.get("/cart/:customerId"';
const cancelPath = `app.post("/order/cancel", async (req, res) => {
  const { orderId, reason } = req.body;
  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE orders SET order_status = 'Cancelled', cancellation_reason = $1 WHERE order_id = $2 RETURNING *",
      [reason || "User cancelled", orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, message: "Order cancelled successfully", order: result.rows[0] });
  } catch (err) {
    console.error("Order cancellation error:", err);
    res.status(500).json({ message: "Error cancelling order" });
  }
});

`;

if (content.includes(searchStr)) {
    const parts = content.split(searchStr);
    content = parts[0] + cancelPath + searchStr + parts[1];
    fs.writeFileSync(path, content);
    console.log("Successfully added /order/cancel endpoint.");
} else {
    console.log("Could not find anchor for /order/cancel.");
}
