const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { encrypt, decrypt } = require('../utils/encryption');

// Register Customer
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const check = await pool.query("SELECT * FROM customers WHERE email=$1", [email]);
    if (check.rows.length > 0) return res.status(400).json({ message: "User already exists" });

    const countResult = await pool.query("SELECT COUNT(*) FROM customers");
    const count = parseInt(countResult.rows[0].count) + 1;
    const customerId = `CUS${count.toString().padStart(3, '0')}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO customers (email, password, customer_id) VALUES ($1, $2, $3)", [email, hashedPassword, customerId]);
    res.json({ message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Customer
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM customers WHERE email=$1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ message: "User not found" });

    const user = result.rows[0];
    
    console.log(`[AUTH-DEBUG] Attempt for: ${email}. active=${user.is_active} (${typeof user.is_active}), blocked=${user.is_blocked} (${typeof user.is_blocked})`);

    // Triple-enforcement check
    const isDeactivated = user.is_active === false || String(user.is_active) === 'false';
    const isRestricted = user.is_blocked === true || String(user.is_blocked) === 'true';

    if (isDeactivated || isRestricted) {
      console.warn(`[AUTH-SECURITY] BLOCKING LOGIN for ${email}. Reason: Account Suspended.`);
      return res.status(403).json({ 
        success: false,
        message: "ACCESS DENIED: Your account has been suspended by the Administrator due to policy violations. Please contact support.",
        isBlocked: true
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[AUTH-FAILURE] Invalid password for ${email}`);
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

// Verify User Status (For session checks)
router.get("/verify-user-status/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let result;
    if (id.startsWith('CUS')) {
      result = await pool.query("SELECT is_active FROM customers WHERE customer_id=$1", [id]);
    } else if (id.startsWith('SEL')) {
      result = await pool.query("SELECT is_active FROM sellers WHERE seller_id=$1", [id]);
    }

    if (!result || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, is_active: result.rows[0].is_active });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Seller Register
router.post("/seller-register", async (req, res) => {
  const { email, password, name, phone } = req.body;
  try {
    const check = await pool.query("SELECT * FROM sellers WHERE email=$1", [email]);
    if (check.rows.length > 0) return res.status(400).json({ message: "Seller already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const countResult = await pool.query("SELECT COUNT(*) FROM sellers");
    const count = parseInt(countResult.rows[0].count) + 1;
    const seller_id = `SEL${count.toString().padStart(3, '0')}`;

    await pool.query(
      "INSERT INTO sellers (seller_id, email, password, full_name, phone, store_name) VALUES ($1, $2, $3, $4, $5, $6)",
      [seller_id, email, hashedPassword, name, phone, name + "'s Store"]
    );

    // Initial address entry
    await pool.query(
      "INSERT INTO addresses (seller_id, full_name, phone, address1, city, state, pincode, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [seller_id, name, phone, 'Address Pending', 'City Pending', 'State Pending', '000000', true]
    );

    res.json({ message: "Seller registered successfully", seller_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Seller Login
router.post("/seller-login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM sellers WHERE email=$1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ message: "Seller not found" });

    const seller = result.rows[0];
    
    // Check if seller is blocked
    if (seller.is_active === false) {
      return res.status(403).json({ 
        message: "Your merchant account has been suspended by the Administrator. Please contact the platform support for reinstatement.",
        isBlocked: true
      });
    }

    console.log("Attempting login for seller:", seller.email, "ID:", seller.seller_id);
    const isMatch = await bcrypt.compare(password, seller.password);
    
    if (!isMatch) {
      console.warn("Password mismatch for:", email);
      return res.status(400).json({ message: "Invalid password" });
    }

    console.log("Login successful for:", seller.email);
    res.json({
      seller: {
        id: seller.seller_id,
        seller_id: seller.seller_id,
        email: seller.email,
        name: seller.full_name,
        phone: seller.phone,
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

// Onboarding
router.post("/onboarding", async (req, res) => {
  const { email, phone, name, gender, dob, address, address2, city, state, pincode, profilePicture } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      "UPDATE customers SET name=$1, gender=$2, dob=$3, phone=$4, profile_image=$5, is_verified=true WHERE email=$6 RETURNING customer_id",
      [name, gender, dob, phone, profilePicture, email]
    );
    if (result.rowCount === 0) throw new Error("User not found");
    const cId = result.rows[0].customer_id;

    await client.query(
      `INSERT INTO addresses (customer_id, full_name, phone, address1, address2, city, state, pincode, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (customer_id) DO UPDATE SET 
       full_name=EXCLUDED.full_name, phone=EXCLUDED.phone, address1=EXCLUDED.address1, address2=EXCLUDED.address2,
       city=EXCLUDED.city, state=EXCLUDED.state, pincode=EXCLUDED.pincode, updated_at=CURRENT_TIMESTAMP`,
      [cId, name, phone, address, address2, city, state, pincode, true]
    );

    await client.query('COMMIT');
    res.json({ message: "Profile and address saved" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// Seller Onboarding
router.post("/seller-onboarding", async (req, res) => {
  const { email, storeName, gstin, pan, aadhar, description, logoUrl, bankDetails, addressDetails } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sellerResult = await client.query(
      "UPDATE sellers SET store_name=$1, gstin=$2, pan=$3, aadhar=$4, store_description=$5, store_logo_url=$6, is_verified=true WHERE email=$7 RETURNING seller_id, phone",
      [storeName, gstin, pan, aadhar, description, logoUrl, email]
    );
    if (sellerResult.rowCount === 0) throw new Error("Seller not found");
    const { seller_id, phone } = sellerResult.rows[0];

    if (bankDetails) {
      const encryptedAcc = encrypt(bankDetails.accNumber);
      const encryptedIfsc = encrypt(bankDetails.ifsc);
      await client.query(
        `INSERT INTO bank_accounts (owner_id, owner_type, account_number, bank_name, ifsc_code, account_holder_name, account_type, is_primary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (owner_id, owner_type) DO UPDATE SET 
         account_number=EXCLUDED.account_number, bank_name=EXCLUDED.bank_name, ifsc_code=EXCLUDED.ifsc_code, updated_at=CURRENT_TIMESTAMP`,
        [seller_id, 'seller', encryptedAcc, bankDetails.bankName, encryptedIfsc, bankDetails.accHolder, bankDetails.accType, true]
      );
    }

    if (addressDetails) {
      await client.query(
        `INSERT INTO addresses (seller_id, full_name, phone, address1, address2, city, state, pincode, country, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (seller_id) DO UPDATE SET 
         full_name=EXCLUDED.full_name, address1=EXCLUDED.address1, city=EXCLUDED.city, state=EXCLUDED.state, updated_at=CURRENT_TIMESTAMP`,
        [seller_id, addressDetails.fullName, phone, addressDetails.address1, addressDetails.address2, addressDetails.city, addressDetails.state, addressDetails.pincode, addressDetails.country || 'India', true]
      );
    }
    await client.query('COMMIT');
    res.json({ message: "Seller onboarding completed" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// Get Seller Profile
router.get("/seller/profile/:sellerId", async (req, res) => {
  try {
    const seller = await pool.query('SELECT seller_id, email, full_name as name, store_name as "storeName", phone FROM sellers WHERE seller_id=$1', [req.params.sellerId]);
    if (seller.rows.length === 0) return res.status(404).json({ message: "Seller not found" });
    
    const addr = await pool.query("SELECT address1, address2, city, state, pincode, country FROM addresses WHERE seller_id=$1 LIMIT 1", [req.params.sellerId]);
    
    res.json({ ...seller.rows[0], address: addr.rows[0] || {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching seller profile" });
  }
});

// Update Seller Profile
router.post("/seller/update-profile", async (req, res) => {
  const { seller_id, name, email, phone, storeName, address } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      "UPDATE sellers SET full_name=COALESCE($1, full_name), email=COALESCE($2, email), phone=COALESCE($3, phone), store_name=COALESCE($4, store_name) WHERE seller_id=$5",
      [name || null, email || null, phone || null, storeName || null, seller_id]
    );
    
    if (address) {
      await client.query(
        `INSERT INTO addresses (seller_id, full_name, phone, address1, address2, city, state, pincode, country, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (seller_id) DO UPDATE SET 
         full_name=EXCLUDED.full_name, phone=EXCLUDED.phone, address1=EXCLUDED.address1, address2=EXCLUDED.address2, 
         city=EXCLUDED.city, state=EXCLUDED.state, pincode=EXCLUDED.pincode, country=EXCLUDED.country, updated_at=CURRENT_TIMESTAMP`,
        [seller_id, name, phone, address.address1, address.address2, address.city, address.state, address.pincode, address.country || 'India', true]
      );
    }
    
    await client.query('COMMIT');
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// Update Seller Password
router.post("/seller/update-password", async (req, res) => {
  const { seller_id, currentPassword, newPassword } = req.body;
  try {
    const result = await pool.query("SELECT password FROM sellers WHERE seller_id=$1", [seller_id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Seller not found" });

    const seller = result.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, seller.password);
    if (!isMatch) return res.status(400).json({ message: "Current password does not match" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE sellers SET password=$1 WHERE seller_id=$2", [hashedNewPassword, seller_id]);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get Seller Daily Finances
router.get("/seller/finances/daily/:sellerId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT daily_finance_id, seller_id, finance_date, total_revenue, platform_commissions as platform_commission, net_seller_earnings, created_at 
       FROM daily_finances 
       WHERE seller_id=$1 
       AND finance_date >= (
         SELECT COALESCE(MIN(finance_date), '1970-01-01') 
         FROM daily_finances 
         WHERE seller_id=$1 AND total_revenue > 0
       )
       ORDER BY finance_date DESC`,
      [req.params.sellerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching finance data" });
  }
});

// Get Seller Weekly Finances
router.get("/seller/finances/weekly/:sellerId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM weekly_finances 
       WHERE seller_id=$1 
       AND (year, week_number) >= (
         SELECT COALESCE(year, 0), COALESCE(week_number, 0)
         FROM weekly_finances 
         WHERE seller_id=$1 AND total_revenue > 0 
         ORDER BY year ASC, week_number ASC 
         LIMIT 1
       )
       ORDER BY year DESC, week_number DESC`,
      [req.params.sellerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching weekly finance data" });
  }
});

// Get Seller Monthly Finances
router.get("/seller/finances/monthly/:sellerId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM monthly_finances 
       WHERE seller_id=$1 
       AND (year, month_number) >= (
         SELECT COALESCE(year, 0), COALESCE(month_number, 0)
         FROM monthly_finances 
         WHERE seller_id=$1 AND total_revenue > 0 
         ORDER BY year ASC, month_number ASC 
         LIMIT 1
       )
       ORDER BY year DESC, month_number DESC`,
      [req.params.sellerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching monthly finance data" });
  }
});

// Get Seller Quarterly Finances
router.get("/seller/finances/quarterly/:sellerId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM quarterly_finances 
       WHERE seller_id=$1 
       AND (year, quarter_number) >= (
         SELECT COALESCE(year, 0), COALESCE(quarter_number, 0)
         FROM quarterly_finances 
         WHERE seller_id=$1 AND total_revenue > 0 
         ORDER BY year ASC, quarter_number ASC 
         LIMIT 1
       )
       ORDER BY year DESC, quarter_number DESC`,
      [req.params.sellerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching quarterly finance data" });
  }
});

// Get Seller Annual Finances
router.get("/seller/finances/annual/:sellerId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM annual_finances 
       WHERE seller_id=$1 
       AND year >= (
         SELECT COALESCE(MIN(year), 0)
         FROM annual_finances 
         WHERE seller_id=$1 AND total_revenue > 0
       )
       ORDER BY year DESC`,
      [req.params.sellerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching annual finance data" });
  }
});

// Get Seller Half-Yearly Finances
router.get("/seller/finances/half-yearly/:sellerId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM half_yearly_finances 
       WHERE seller_id=$1 
       AND (year, half_number) >= (
         SELECT COALESCE(year, 0), COALESCE(half_number, 0)
         FROM half_yearly_finances 
         WHERE seller_id=$1 AND total_revenue > 0 
         ORDER BY year ASC, half_number ASC 
         LIMIT 1
       )
       ORDER BY year DESC, half_number DESC`,
      [req.params.sellerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching half-yearly finance data" });
  }
});

// Get Profiles
router.get("/profile/:email", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers WHERE email=$1", [req.params.email]);
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
    const cId = result.rows[0].customer_id;
    const addr = await pool.query(
      `SELECT full_name as shipping_name, phone as shipping_phone,
              address1 as address, address2, city, state, pincode, country
       FROM addresses 
       WHERE customer_id=$1 ORDER BY is_default DESC, created_at DESC LIMIT 1`,
      [cId]
    );
    res.json({ ...result.rows[0], ...addr.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Profile fetch error" });
  }
});

router.post("/update-profile", async (req, res) => {
  const { email, name, phone, dob, address, address2, city, state, pincode, image } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      "UPDATE customers SET name=$1, phone=$2, dob=$3, profile_image=$4 WHERE email=$5 RETURNING customer_id",
      [name, phone, dob, image, email]
    );
    if (result.rowCount === 0) throw new Error("User not found");
    const cId = result.rows[0].customer_id;
    await client.query(
      `UPDATE addresses SET full_name=$1, phone=$2, address1=$3, address2=$4, city=$5, state=$6, pincode=$7, updated_at=CURRENT_TIMESTAMP WHERE customer_id=$8`,
      [name, phone, address, address2, city, state, pincode, cId]
    );
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// OTP Routes
router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  try {
    await pool.query("INSERT INTO otp_verifications (phone, otp) VALUES ($1, $2)", [phone, otp]);
    console.log("OTP for", phone, ":", otp);
    res.json({ message: "OTP sent", devOtp: otp });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const result = await pool.query("SELECT * FROM otp_verifications WHERE phone=$1 AND otp=$2 ORDER BY created_at DESC LIMIT 1", [phone, otp]);
    res.json({ success: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Address Management
router.get("/addresses/:email", async (req, res) => {
  try {
    const customer = await pool.query("SELECT customer_id FROM customers WHERE email=$1", [req.params.email]);
    if (customer.rowCount === 0) return res.status(404).json({ message: "Customer not found" });
    const addresses = await pool.query("SELECT * FROM addresses WHERE customer_id=$1 ORDER BY is_default DESC", [customer.rows[0].customer_id]);
    res.json(addresses.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching addresses" });
  }
});

router.post("/update-address", async (req, res) => {
  const { email, name, phone, address, address2, city, state, pincode, country, address_id } = req.body;
  try {
    const customer = await pool.query("SELECT customer_id FROM customers WHERE email=$1", [email]);
    if (customer.rowCount === 0) return res.status(404).json({ message: "Customer not found" });
    const cId = customer.rows[0].customer_id;

    if (address_id) {
      await pool.query(
        "UPDATE addresses SET full_name=$1, phone=$2, address1=$3, address2=$4, city=$5, state=$6, pincode=$7, country=$8, updated_at=CURRENT_TIMESTAMP WHERE address_id=$9 AND customer_id=$10",
        [name, phone, address, address2, city, state, pincode, country || 'India', address_id, cId]
      );
    } else {
      await pool.query(
        "INSERT INTO addresses (customer_id, full_name, phone, address1, address2, city, state, pincode, country) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [cId, name, phone, address, address2, city, state, pincode, country || 'India']
      );
    }
    res.json({ message: "Address updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating address" });
  }
});

module.exports = router;
