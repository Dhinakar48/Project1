const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});
async function seedAdmin() {
    try {
        const hashedPassword = await bcrypt.hash("3616", 10);
        await pool.query(
            "INSERT INTO sellers (sellerid, full_name, email, phone, password, store_name) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (sellerid) DO NOTHING",
            ["SEL001", "Admin Seller", "electroshop@gmail.com", "9876543210", hashedPassword, "ElectroShop Office"]
        );
        console.log("Admin Seller seeded successfully ✅");
    } catch (e) {
        console.error("Error seeding admin:", e.message);
    } finally {
        pool.end();
    }
}
seedAdmin();
