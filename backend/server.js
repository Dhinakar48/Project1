const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// ✅ PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
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
      "SELECT * FROM customers WHERE email=$1",
      [email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate customer_id
    const countResult = await pool.query("SELECT COUNT(*) FROM customers");
    const count = parseInt(countResult.rows[0].count) + 1;
    const customerId = `CUS${count.toString().padStart(3, '0')}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO customers (email, password, customer_id) VALUES ($1, $2, $3)",
      [email, hashedPassword, customerId]
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
      "SELECT * FROM customers WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      user: {
        customerId: user.customer_id,
        email: user.email,
        name: user.name,
        profilePicture: user.profile_image,
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
  const { email, phone, name, gender, dob, address, city, state, pincode, profilePicture } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Update customer table
    const result = await client.query(
      `UPDATE customers 
       SET name=$1, gender=$2, dob=$3, phone=$4, profile_image=$5, is_verified=true
       WHERE email=$6 RETURNING customer_id`,
      [name, gender, dob, phone, profilePicture, email]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "User not found to update" });
    }

    const cId = result.rows[0].customer_id;

    // 2. Insert/Update address table
    await client.query(
      `INSERT INTO addresses (customer_id, full_name, phone, address_line1, city, state, pincode, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (customer_id) 
       DO UPDATE SET 
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          address_line1 = EXCLUDED.address_line1,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          pincode = EXCLUDED.pincode,
          updated_at = CURRENT_TIMESTAMP`,
      [cId, name, phone, address, city, state, pincode, true]
    );

    await client.query('COMMIT');
    res.json({ message: "Profile and address saved" });

  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (client) client.release();
  }
});

app.post("/update-address", async (req, res) => {
  const { email, name, phone, address, city, state, pincode } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get customer_id
    const customer = await client.query("SELECT customer_id FROM customers WHERE email=$1", [email]);
    if (customer.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Customer not found" });
    }
    const cId = customer.rows[0].customer_id;

    // 2. Insert/Update address
    await client.query(
      `INSERT INTO addresses (customer_id, full_name, phone, address_line1, city, state, pincode, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (customer_id) 
       DO UPDATE SET 
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          address_line1 = EXCLUDED.address_line1,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          pincode = EXCLUDED.pincode,
          updated_at = CURRENT_TIMESTAMP`,
      [cId, name, phone, address, city, state, pincode, true]
    );

    await client.query('COMMIT');
    res.json({ message: "Address updated successfully" });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: "Error updating address" });
  } finally {
    client.release();
  }
});

app.post("/update-profile", async (req, res) => {
  const { email, name, phone, dob, address, city, state, pincode, image } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Update customers table
    const customerResult = await client.query(
      `UPDATE customers 
       SET name=$1, phone=$2, dob=$3, profile_image=$4
       WHERE email=$5 RETURNING customer_id`,
      [name, phone, dob, image, email]
    );

    if (customerResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Customer not found" });
    }
    const cId = customerResult.rows[0].customer_id;

    // 2. Update/Insert addresses table
    await client.query(
      `INSERT INTO addresses (customer_id, full_name, phone, address_line1, city, state, pincode, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (customer_id) 
       DO UPDATE SET 
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          address_line1 = EXCLUDED.address_line1,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          pincode = EXCLUDED.pincode,
          updated_at = CURRENT_TIMESTAMP`,
      [cId, name, phone, address, city, state, pincode, true]
    );

    await client.query('COMMIT');
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: "Error updating profile" });
  } finally {
    client.release();
  }
});

app.get("/profile/:email", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.customer_id, u.email, u.name, u.phone, u.dob, u.gender, u.profile_image, u.is_verified,
              a.full_name as shipping_name, a.phone as shipping_phone,
              a.address_line1 as address, a.city, a.state, a.pincode, a.country
       FROM customers u
       LEFT JOIN addresses a ON u.customer_id = a.customer_id
       WHERE u.email=$1`,
      [req.params.email]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- SELLER ROUTES ---

app.post("/seller-register", async (req, res) => {
  const { email, password, name, phone } = req.body;

  try {
    const check = await pool.query("SELECT * FROM sellers WHERE email=$1", [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate sellerid
    const countResult = await pool.query("SELECT COUNT(*) FROM sellers");
    const count = parseInt(countResult.rows[0].count) + 1;
    const sellerid = `SEL${count.toString().padStart(3, '0')}`;

    await pool.query(
      `INSERT INTO sellers (sellerid, email, password, full_name, phone, store_name) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [sellerid, email, hashedPassword, name, phone, name + "'s Store"]
    );

    res.json({ message: "Seller registered successfully", sellerid });
  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ message: "Server error during registration: " + err.message });
  }
});

app.post("/seller-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM sellers WHERE email=$1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Seller not found" });
    }

    const seller = result.rows[0];
    const isMatch = await bcrypt.compare(password, seller.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      seller: {
        id: seller.sellerid,
        sellerid: seller.sellerid,
        email: seller.email,
        name: seller.full_name,
        storeName: seller.store_name,
        isVerified: seller.is_verified,
        status: seller.is_active ? "Active" : "Inactive"
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

app.post("/seller-onboarding", async (req, res) => {
  const { email, storeName, gstin, pan, aadhar, description, logoUrl, bankDetails, addressDetails } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log("Onboarding request for email:", email);
    // 1. Update seller table
    const sellerResult = await client.query(
      `UPDATE sellers 
       SET store_name=$1, gstin=$2, pan=$3, aadhar=$4, store_description=$5, store_logo_url=$6, is_verified=true
       WHERE email=$7 RETURNING sellerid`,
      [storeName, gstin, pan, aadhar, description, logoUrl, email]
    );

    if (sellerResult.rowCount === 0) {
      console.log("Seller not found for email:", email);
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Seller account (${email}) not found. Please register again.` });
    }

    const sId = sellerResult.rows[0].sellerid;

    // 2. Insert/Update bank account
    if (bankDetails) {
      await client.query(
        `INSERT INTO bank_accounts (owner_id, owner_type, account_number, bank_name, ifsc_code, account_holder_name, account_type, is_primary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (owner_id, owner_type) 
         DO UPDATE SET 
            account_number = EXCLUDED.account_number,
            bank_name = EXCLUDED.bank_name,
            ifsc_code = EXCLUDED.ifsc_code,
            account_holder_name = EXCLUDED.account_holder_name,
            account_type = EXCLUDED.account_type,
            updated_at = CURRENT_TIMESTAMP`,
        [sId, 'seller', bankDetails.accNumber, bankDetails.bankName, bankDetails.ifsc, bankDetails.accHolder, bankDetails.accType, true]
      );
    }

    // 3. Insert/Update address
    if (addressDetails) {
      await client.query(
        `INSERT INTO addresses (sellerid, full_name, address_line1, city, state, pincode, country, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (sellerid) 
         DO UPDATE SET 
            full_name = EXCLUDED.full_name,
            address_line1 = EXCLUDED.address_line1,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            pincode = EXCLUDED.pincode,
            country = EXCLUDED.country,
            updated_at = CURRENT_TIMESTAMP`,
        [sId, addressDetails.fullName, addressDetails.address1, addressDetails.city, addressDetails.state, addressDetails.pincode, addressDetails.country, true]
      );
    }

    await client.query('COMMIT');
    res.json({ message: "Seller profile, bank, and address details saved" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: "Error saving seller profile" });
  } finally {
    client.release();
  }
});

app.get("/seller-profile/:email", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM sellers WHERE email=$1",
      [req.params.email]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Seller not found" });
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