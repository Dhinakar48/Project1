const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db");

// Import Routes
const orderRoutes = require("./routes/orders");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");
const reviewRoutes = require("./routes/reviews");
const adminRoutes = require("./routes/admin");
const couponRoutes = require("./routes/coupons");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Request Logger
app.use((req, res, next) => {
  res.on('finish', () => {
    const bodyStr = req.body ? JSON.stringify(req.body) : '';
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode}`, req.method !== 'GET' ? bodyStr.substring(0, 500) : '');
  });
  next();
});

// Use Routes (Mounted at root to match original endpoints exactly)
app.use("/", orderRoutes);
app.use("/", productRoutes);
app.use("/", userRoutes);
app.use("/", cartRoutes);
app.use("/", reviewRoutes);
app.use("/", adminRoutes);
app.use("/", couponRoutes);

// Additional Support for /api prefix
app.use("/api", orderRoutes);
app.use("/api", productRoutes);
app.use("/api", userRoutes);
app.use("/api", cartRoutes);
app.use("/api", reviewRoutes);
app.use("/api", adminRoutes);
app.use("/api", couponRoutes);

// Misc Routes
app.get("/seller-stats/:sellerId", async (req, res) => {
  const { sellerId } = req.params;
  console.log(`[seller-stats] Fetching stats for: ${sellerId}`);
  try {
    const rev = await pool.query("SELECT SUM(seller_subtotal) as total_revenue FROM order_sellers WHERE seller_id = $1", [sellerId]);
    const ord = await pool.query("SELECT COUNT(DISTINCT order_id) as total_orders FROM order_items WHERE seller_id = $1", [sellerId]);
    const prd = await pool.query("SELECT COUNT(*) as total_products FROM products WHERE seller_id = $1", [sellerId]);
    const cust = await pool.query("SELECT COUNT(DISTINCT o.customer_id) as total_customers FROM orders o JOIN order_items oi ON o.order_id = oi.order_id WHERE oi.seller_id = $1", [sellerId]);
    
    console.log(`[seller-stats] Raw Results -> Rev: ${rev.rows[0].total_revenue}, Ord: ${ord.rows[0].total_orders}, Prd: ${prd.rows[0].total_products}, Cust: ${cust.rows[0].total_customers}`);

    res.json({ 
      totalRevenue: rev.rows[0].total_revenue || 0, 
      totalOrders: ord.rows[0].total_orders || 0, 
      totalProducts: prd.rows[0].total_products || 0,
      totalCustomers: cust.rows[0].total_customers || 0
    });
  } catch (err) { 
    console.error(`[seller-stats] Error:`, err);
    res.status(500).json({ message: "Stats error" }); 
  }
});

app.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Categories error" }); }
});

app.get("/", (req, res) => { res.send("Backend is running 🚀 (Modular Version)"); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });
