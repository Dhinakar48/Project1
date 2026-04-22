const fs = require('fs');
const path = 'c:/Users/MAKESH/my-app/electronics-store/backend/server.js';
let content = fs.readFileSync(path, 'utf8');

// Find the last clean part
const searchStr = 'app.listen(5000, () => {';
const index = content.indexOf(searchStr);

if (index !== -1) {
  // Take everything up to just before the listener start
  // Actually, I want to add the featured-products before the listener
  const cleanBase = content.substring(0, index).trim();
  
  const newPart = `
app.get("/featured-products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE is_featured = true AND is_active = true AND deleted_at IS NULL ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching featured products" });
  }
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
`;

  fs.writeFileSync(path, cleanBase + "\n" + newPart);
  console.log("server.js cleaned successfully.");
} else {
  console.log("Could not find anchor string.");
}
