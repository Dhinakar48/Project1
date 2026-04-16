const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// ✅ PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "3616",
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack)
  }
  console.log('Successfully connected to PostgreSQL Database ✅')
})

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const check = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, password]
    );

    res.json({ message: "Registered successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profile_picture,
        is_verified: user.is_verified,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await pool.query(
      "INSERT INTO otp_verifications (phone, otp) VALUES ($1, $2)",
      [phone, otp]
    );

    console.log("OTP:", otp); // 👉 shows in terminal

    res.json({ message: "OTP sent", devOtp: otp });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM otp_verifications WHERE phone=$1 AND otp=$2 ORDER BY created_at DESC LIMIT 1",
      [phone, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false });
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.post("/onboarding", async (req, res) => {
  const { email, phone, name, gender, dob, address, profilePicture } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET name=$1, gender=$2, dob=$3, address=$4, phone=$5, profile_picture=$6, is_verified=true
       WHERE email=$7`,
      [name, gender, dob, address, phone, profilePicture, email]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "User not found to update" });
    }

    res.json({ message: "Profile saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving profile" });
  }
});

app.get("/profile/:email", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, phone, dob, address, gender, profile_picture, is_verified FROM users WHERE email=$1",
      [req.params.email]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

