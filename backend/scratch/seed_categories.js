const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function seedCategories() {
  const categories = [
    { name: 'Mobile & Tablets', slug: 'mobile-tablets' },
    { name: 'Laptops & Computing', slug: 'laptops-computing' },
    { name: 'Audio & Headphones', slug: 'audio-headphones' },
    { name: 'Cameras & Photography', slug: 'cameras-photography' },
    { name: 'Smart Home', slug: 'smart-home' },
    { name: 'Accessories', slug: 'accessories' }
  ];

  try {
    for (const cat of categories) {
      await pool.query(
        "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING",
        [cat.name, cat.slug]
      );
    }
    console.log("✅ Categories seeded successfully!");
  } catch (err) {
    console.error("❌ Error seeding categories:", err.message);
  } finally {
    process.exit();
  }
}

seedCategories();
