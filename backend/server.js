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

// ✅ PostgreSQL connection check
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('✅ Successfully connected to PostgreSQL Database');
  }
});

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
  const { email, phone, name, gender, dob, address, address2, city, state, pincode, profilePicture } = req.body;
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
    const checkAddress = await client.query("SELECT * FROM addresses WHERE customer_id=$1", [cId]);
    
    if (checkAddress.rows.length > 0) {
      await client.query(
        `UPDATE addresses SET 
            full_name = $1, phone = $2, address1 = $3, address2 = $4,
            city = $5, state = $6, pincode = $7, updated_at = CURRENT_TIMESTAMP
         WHERE customer_id = $8`,
        [name, phone, address, address2, city, state, pincode, cId]
      );
    } else {
      await client.query(
        `INSERT INTO addresses (customer_id, full_name, phone, address1, address2, city, state, pincode, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [cId, name, phone, address, address2, city, state, pincode, true]
      );
    }

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
  const { email, name, phone, address, address2, city, state, pincode } = req.body;
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
    const { address_id, address_type } = req.body;
    console.log(`Updating address for ${email} (${cId}). AddressID: ${address_id || 'New'}`);

    if (address_id) {
      await client.query(
        `UPDATE addresses SET 
            full_name = $1, phone = $2, address1 = $3, address2 = $4,
            city = $5, state = $6, pincode = $7, country = $8, updated_at = CURRENT_TIMESTAMP
         WHERE address_id = $9 AND customer_id = $10`,
        [name, phone, address, address2, city, state, pincode, req.body.country || 'India', address_id, cId]
      );
    } else {
      // Check if this is the first address for the user
      const checkFirst = await client.query("SELECT COUNT(*) FROM addresses WHERE customer_id=$1", [cId]);
      const isDefault = parseInt(checkFirst.rows[0].count) === 0;

      await client.query(
        `INSERT INTO addresses (customer_id, full_name, phone, address1, address2, city, state, pincode, country, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (customer_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            address1 = EXCLUDED.address1,
            address2 = EXCLUDED.address2,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            pincode = EXCLUDED.pincode,
            country = EXCLUDED.country,
            updated_at = CURRENT_TIMESTAMP`,
        [cId, name, phone, address, address2, city, state, pincode, req.body.country || 'India', isDefault]
      );
    }

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
  const { email, name, phone, dob, address, address2, city, state, pincode, image } = req.body;
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
    const checkAddress = await client.query("SELECT * FROM addresses WHERE customer_id=$1", [cId]);
    
    if (checkAddress.rows.length > 0) {
      await client.query(
        `UPDATE addresses SET 
            full_name = $1, phone = $2, address1 = $3, address2 = $4,
            city = $5, state = $6, pincode = $7, updated_at = CURRENT_TIMESTAMP
         WHERE customer_id = $8`,
        [name, phone, address, address2, city, state, pincode, cId]
      );
    } else {
      await client.query(
        `INSERT INTO addresses (customer_id, full_name, phone, address1, address2, city, state, pincode, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [cId, name, phone, address, address2, city, state, pincode, true]
      );
    }

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
      `SELECT customer_id, email, name, phone, dob, gender, profile_image, is_verified 
       FROM customers 
       WHERE email=$1`,
      [req.params.email]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
    
    // Fetch default address or first address to maintain backward compatibility
    const addrResult = await pool.query(
      `SELECT full_name as shipping_name, phone as shipping_phone,
              address1 as address, address2 as address2, city, state, pincode, country
       FROM addresses 
       WHERE customer_id=$1 ORDER BY is_default DESC, created_at DESC LIMIT 1`,
      [result.rows[0].customer_id]
    );
    
    const profile = { ...result.rows[0], ...addrResult.rows[0] };
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/addresses/:email", async (req, res) => {
  try {
    console.log(`Fetching addresses for email: ${req.params.email}`);
    const customer = await pool.query("SELECT customer_id FROM customers WHERE email=$1", [req.params.email]);
    if (customer.rowCount === 0) {
      console.log(`Customer not found for ${req.params.email}`);
      return res.status(404).json({ message: "Customer not found" });
    }
    
    const addresses = await pool.query(
      "SELECT * FROM addresses WHERE customer_id=$1 ORDER BY is_default DESC, created_at DESC", 
      [customer.rows[0].customer_id]
    );
    console.log(`Found ${addresses.rowCount} addresses for ${req.params.email}`);
    res.json(addresses.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching addresses" });
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

    // Generate seller_id
    const countResult = await pool.query("SELECT COUNT(*) FROM sellers");
    const count = parseInt(countResult.rows[0].count) + 1;
    const seller_id = `SEL${count.toString().padStart(3, '0')}`;

    await pool.query(
      `INSERT INTO sellers (seller_id, email, password, full_name, phone, store_name) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [seller_id, email, hashedPassword, name, phone, name + "'s Store"]
    );

    // Initial address entry
    const checkAddress = await pool.query("SELECT * FROM addresses WHERE seller_id=$1", [seller_id]);
    if (checkAddress.rows.length === 0) {
      await pool.query(
        `INSERT INTO addresses (seller_id, full_name, phone, address1, city, state, pincode, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [seller_id, name, phone, 'Address Pending', 'City Pending', 'State Pending', '000000', true]
      );
    }

    res.json({ message: "Seller registered successfully", seller_id });
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
        id: seller.seller_id,
        seller_id: seller.seller_id,
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
       WHERE email=$7 RETURNING seller_id`,
      [storeName, gstin, pan, aadhar, description, logoUrl, email]
    );

    if (sellerResult.rowCount === 0) {
      console.log("Seller not found for email:", email);
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Seller account (${email}) not found. Please register again.` });
    }

    const sId = sellerResult.rows[0].seller_id;

    // 1.5. Get seller phone to store in addresses
    const sellerInfo = await client.query("SELECT phone FROM sellers WHERE seller_id=$1", [sId]);
    const sellerPhone = sellerInfo.rows[0]?.phone || null;

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
      const checkAddr = await client.query("SELECT * FROM addresses WHERE seller_id=$1", [sId]);
      if (checkAddr.rows.length > 0) {
        await client.query(
          `UPDATE addresses SET 
              full_name = $1, phone = $2, address1 = $3, address2 = $4,
              city = $5, state = $6, pincode = $7, country = $8, updated_at = CURRENT_TIMESTAMP
           WHERE seller_id = $9`,
          [addressDetails.fullName, sellerPhone, addressDetails.address1, addressDetails.address2, addressDetails.city, addressDetails.state, addressDetails.pincode, addressDetails.country, sId]
        );
      } else {
        await client.query(
          `INSERT INTO addresses (seller_id, full_name, phone, address1, address2, city, state, pincode, country, is_default)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [sId, addressDetails.fullName, sellerPhone, addressDetails.address1, addressDetails.address2, addressDetails.city, addressDetails.state, addressDetails.pincode, addressDetails.country, true]
        );
      }
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

app.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching categories" });
  }
});

app.post("/categories", async (req, res) => {
  const { name } = req.body;
  try {
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const result = await pool.query(
      "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *",
      [name, slug]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating category" });
  }
});

app.post("/seller-add-product", async (req, res) => {
  const { seller_id, category_id, new_category_name, name, description, price, stock, images } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let final_category_id = category_id;

    // Handle new category creation if provided
    if (new_category_name && new_category_name.trim() !== "") {
      const slug = new_category_name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const catResult = await client.query(
        "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING category_id",
        [new_category_name.trim(), slug]
      );
      final_category_id = catResult.rows[0].category_id;
    }

    // Generate semantic product_id safely
    const maxIdResult = await client.query("SELECT product_id FROM products WHERE product_id LIKE 'PRD%' ORDER BY product_id DESC LIMIT 1");
    let nextNum = 1;
    if (maxIdResult.rows.length > 0) {
      const lastId = maxIdResult.rows[0].product_id;
      const lastNum = parseInt(lastId.replace('PRD', ''));
      nextNum = lastNum + 1;
    }
    const pId = `PRD${nextNum.toString().padStart(3, '0')}`;

    // 1. Insert into products
    const productResult = await client.query(
      `INSERT INTO products (product_id, seller_id, category_id, name, description, price, stock_quantity, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING product_id`,
      [pId, seller_id, final_category_id, name, description, price, stock, images]
    );


    await client.query('COMMIT');
    res.json({ message: "Product added successfully", product_id: pId });

  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: "Error adding product: " + err.message });
  } finally {
    if (client) client.release();
  }
});

app.put("/seller-update-product/:product_id", async (req, res) => {
  const { product_id } = req.params;
  const { category_id, new_category_name, name, description, price, stock, images } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let final_category_id = category_id;

    if (new_category_name && new_category_name.trim() !== "") {
      const slug = new_category_name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const catResult = await client.query(
        "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING category_id",
        [new_category_name.trim(), slug]
      );
      final_category_id = catResult.rows[0].category_id;
    }

    // 1. Update product
    console.log("Updating product ID:", product_id, "with data:", { name, price, stock });
    const updateResult = await client.query(
      `UPDATE products SET 
       category_id = $1, name = $2, description = $3, price = $4, stock_quantity = $5, images = $6, updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $7`,
      [final_category_id, name, description, price, stock, images, product_id]
    );
    console.log("Update result rows affected:", updateResult.rowCount);


    if (updateResult.rowCount === 0) {
      throw new Error(`Product with ID ${product_id} not found`);
    }

    await client.query('COMMIT');
    res.json({ message: "Product updated successfully" });

  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("Update error:", err.message);
    res.status(500).json({ message: "Error updating product: " + err.message });
  } finally {
    if (client) client.release();
  }
});

app.delete("/seller-delete-product/:product_id", async (req, res) => {
  const { product_id } = req.params;
  try {
    await pool.query("DELETE FROM products WHERE product_id = $1", [product_id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting product" });
  }
});

app.get("/seller-products/:seller_id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, 
       p.images[1] as main_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.seller_id = $1
       ORDER BY p.created_at DESC`,
      [req.params.seller_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, 
       p.images[1] as main_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching all products" });
  }
});

app.get("/products/category/:categoryName", async (req, res) => {
  const { categoryName } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, 
       p.images[1] as main_image
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       WHERE LOWER(c.name) = LOWER($1) OR LOWER(c.slug) = LOWER($1)
       ORDER BY p.created_at DESC`,
      [categoryName]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products by category" });
  }
});

app.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const productResult = await pool.query(
      `SELECT p.*, c.name as category_name, s.store_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN sellers s ON p.seller_id = s.seller_id
       WHERE p.product_id = $1`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const imagesResult = await pool.query(
      "SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC",
      [id]
    );

    const product = {
      ...productResult.rows[0],
      gallery: imagesResult.rows
    };

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching product details" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});