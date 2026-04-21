const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, JSON.stringify(req.body).substring(0, 500));
  }
  next();
});

// ✅ PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
  max: 20, // Limit connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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
  console.log("Add Product Request:", req.body);
  const { 
    seller_id, category_id, new_category_name, name, description, 
    price, mrp, stock, images, sku, brand, 
    weight, height, width, breadth, specifications 
  } = req.body;
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
      `INSERT INTO products (
        product_id, seller_id, category_id, name, description, 
        price, mrp, stock_quantity, images, sku, brand, 
        weight, height, width, breadth
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING product_id`,
      [
        pId, seller_id, final_category_id, name, description, 
        price, mrp || price, stock, images, sku || null, brand, 
        weight, height, width, breadth
      ]
    );

    // 1.5. Sync into product_images
    if (images && Array.isArray(images)) {
      for (const [idx, imgUrl] of images.entries()) {
        const lastImgResult = await client.query("SELECT image_id FROM product_images ORDER BY image_id DESC LIMIT 1");
        let nextImgNum = 1;
        if (lastImgResult.rows.length > 0) {
          const lastImgId = lastImgResult.rows[0].image_id;
          nextImgNum = (parseInt(lastImgId.split('-')[1]) || 0) + 1;
        }
        const imgId = `IMG-${nextImgNum.toString().padStart(3, '0')}`;
        await client.query(
          "INSERT INTO product_images (image_id, product_id, image, sort_order) VALUES ($1, $2, $3, $4)",
          [imgId, pId, imgUrl, idx]
        );
      }
    }

    // 2. Insert into product_variants (Specifications)
    console.log("Adding specifications for product:", pId, specifications);
    if (specifications && Array.isArray(specifications)) {
      for (const spec of specifications) {
        if (spec.key && spec.value) {
          try {
            // Generate semantic variant_id (VAR-001 format)
            const maxVarIdResult = await client.query("SELECT variant_id FROM product_variants ORDER BY variant_id DESC LIMIT 1");
            let nextVarNum = 1;
            if (maxVarIdResult.rows.length > 0) {
              const lastVarId = maxVarIdResult.rows[0].variant_id;
              // Extract number from VAR-001 or VAR001
              const match = lastVarId.match(/\d+/);
              const lastVarNum = match ? parseInt(match[0]) : 0;
              nextVarNum = lastVarNum + 1;
            }
            const vId = `VAR-${nextVarNum.toString().padStart(3, '0')}`;

            console.log("Inserting spec:", spec, "with ID:", vId);
            await client.query(
              "INSERT INTO product_variants (variant_id, product_id, sku, variant_name, variant_value, price, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7)",
              [vId, pId, sku || null, spec.key, spec.value, spec.price || price, spec.stock || stock]
            );
          } catch (loopErr) {
            console.error("Error inserting specific variant:", spec, loopErr.message);
            throw loopErr;
          }
        }
      }
    }

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
  const { 
    category_id, new_category_name, name, description, 
    price, mrp, stock, images, sku, brand,
    weight, height, width, breadth, is_active, specifications
  } = req.body;
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
    const sql = `UPDATE products SET 
       category_id = $1, name = $2, description = $3, price = $4, mrp = $5, 
       stock_quantity = $6, images = $7, sku = $8, brand = $9, 
       weight = $10, height = $11, width = $12, breadth = $13, 
       is_active = $14, updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $15`;
    console.log("Executing SQL:", sql);
    const updateResult = await client.query(sql, [
        final_category_id, name, description, price, mrp, 
        stock, images, sku || null, brand, 
        weight, height, width, breadth, 
        is_active !== undefined ? is_active : true, product_id
      ]
    );
    console.log("Update result rows affected:", updateResult.rowCount);


    if (updateResult.rowCount === 0) {
      throw new Error(`Product with ID ${product_id} not found`);
    }

    // 1.5. Sync into product_images
    await client.query("DELETE FROM product_images WHERE product_id = $1", [product_id]);
    if (images && Array.isArray(images)) {
      for (const [idx, imgUrl] of images.entries()) {
        const lastImgResult = await client.query("SELECT image_id FROM product_images ORDER BY image_id DESC LIMIT 1");
        let nextImgNum = 1;
        if (lastImgResult.rows.length > 0) {
          const lastImgId = lastImgResult.rows[0].image_id;
          nextImgNum = (parseInt(lastImgId.split('-')[1]) || 0) + 1;
        }
        const imgId = `IMG-${nextImgNum.toString().padStart(3, '0')}`;
        await client.query(
          "INSERT INTO product_images (image_id, product_id, image, sort_order) VALUES ($1, $2, $3, $4)",
          [imgId, product_id, imgUrl, idx]
        );
      }
    }

    // 2. Sync product_variants (Specifications)
    // For simplicity, we drop existing ones and re-insert
    console.log("Syncing specifications for product:", product_id, specifications);
    await client.query("DELETE FROM product_variants WHERE product_id = $1", [product_id]);
    if (specifications && Array.isArray(specifications)) {
      for (const spec of specifications) {
        if (spec.key && spec.value) {
          try {
            // Generate semantic variant_id (VAR-001 format)
            const maxVarIdResult = await client.query("SELECT variant_id FROM product_variants ORDER BY variant_id DESC LIMIT 1");
            let nextVarNum = 1;
            if (maxVarIdResult.rows.length > 0) {
              const lastVarId = maxVarIdResult.rows[0].variant_id;
              // Extract number from VAR-001 or VAR001
              const match = lastVarId.match(/\d+/);
              const lastVarNum = match ? parseInt(match[0]) : 0;
              nextVarNum = lastVarNum + 1;
            }
            const vId = `VAR-${nextVarNum.toString().padStart(3, '0')}`;

            console.log("Inserting spec:", spec, "with ID:", vId);
            await client.query(
              "INSERT INTO product_variants (variant_id, product_id, sku, variant_name, variant_value, price, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7)",
              [vId, product_id, sku || null, spec.key, spec.value, spec.price || price, spec.stock || stock]
            );
          } catch (loopErr) {
            console.error("Error inserting specific variant:", spec, loopErr.message);
            throw loopErr; // Re-throw to trigger transaction rollback
          }
        }
      }
    }

    await client.query('COMMIT');
    res.json({ message: "Product updated successfully" });

  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("Update error full stack:", err);
    res.status(500).json({ message: "Error updating product: " + err.message });
  } finally {
    if (client) client.release();
  }
});

app.delete("/seller-delete-product/:product_id", async (req, res) => {
  const { product_id } = req.params;
  try {
    // Soft delete: set deleted_at and is_active = false
    await pool.query(
      "UPDATE products SET deleted_at = CURRENT_TIMESTAMP, is_active = false WHERE product_id = $1", 
      [product_id]
    );
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
       WHERE p.seller_id = $1 AND p.deleted_at IS NULL
       ORDER BY p.created_at DESC`,
      [req.params.seller_id]
    );
    const products = result.rows;
    for (const p of products) {
      const variants = await pool.query(
        "SELECT variant_id, variant_name as key, variant_value as value, price, mrp, stock_quantity as stock, sku FROM product_variants WHERE product_id = $1 ORDER BY variant_id ASC",
        [p.product_id]
      );
      p.specifications = variants.rows;
    }
    res.json(products);
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
       WHERE p.deleted_at IS NULL
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
       WHERE (LOWER(c.name) = LOWER($1) OR LOWER(c.slug) = LOWER($1)) AND p.deleted_at IS NULL
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
       WHERE p.product_id = $1 AND p.deleted_at IS NULL`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const imagesResult = await pool.query(
      "SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC",
      [id]
    );

    const variantsResult = await pool.query(
      "SELECT variant_id, variant_name as key, variant_value as value, price, mrp, stock_quantity as stock, sku FROM product_variants WHERE product_id = $1 ORDER BY variant_id ASC",
      [id]
    );

    const product = {
      ...productResult.rows[0],
      gallery: imagesResult.rows,
      specifications: variantsResult.rows
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


app.post("/wishlist/toggle", async (req, res) => {
  const { customerId, productId } = req.body;
  console.log("Wishlist toggle request received:", { customerId, productId });
  if (!customerId || !productId) {
    console.error("Missing fields in wishlist toggle:", { customerId, productId });
    return res.status(400).json({ message: "Missing data" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Ensure wishlist exists for customer
    let wishlistResult = await client.query("SELECT wishlist_id FROM wishlists WHERE customer_id = $1", [customerId]);
    let wishlistId;
    
    if (wishlistResult.rows.length === 0) {
      console.log("Creating new wishlist for customer:", customerId);
      // Generate semantic WIS ID
      const countRes = await client.query("SELECT COUNT(*) FROM wishlists");
      const nextNum = parseInt(countRes.rows[0].count) + 1;
      wishlistId = `WIS-${nextNum.toString().padStart(3, '0')}`;
      
      await client.query("INSERT INTO wishlists (wishlist_id, customer_id) VALUES ($1, $2)", [wishlistId, customerId]);
      console.log("New wishlist created:", wishlistId);
    } else {
      wishlistId = wishlistResult.rows[0].wishlist_id;
      console.log("Existing wishlist found:", wishlistId);
    }

    // 2. Check if item already exists
    const itemCheck = await client.query("SELECT * FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2", [wishlistId, productId]);
    console.log("Item check status for product:", productId, "found count:", itemCheck.rowCount);
    
    if (itemCheck.rows.length > 0) {
      // Remove it
      await client.query("DELETE FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2", [wishlistId, productId]);
      await client.query('COMMIT');
      console.log("Item removed from wishlist:", productId);
      return res.json({ status: 'removed' });
    } else {
      // Add it
      const countRes = await client.query("SELECT COUNT(*) FROM wishlist_items");
      const nextNum = parseInt(countRes.rows[0].count) + 1;
      const itemId = `WIS-IT-${nextNum.toString().padStart(3, '0')}`;
      
      await client.query("INSERT INTO wishlist_items (wishlist_item_id, wishlist_id, product_id) VALUES ($1, $2, $3)", [itemId, wishlistId, productId]);
      await client.query('COMMIT');
      console.log("Item added to wishlist:", productId, "with ID:", itemId);
      return res.json({ status: 'added' });
    }
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("Wishlist toggle error:", err);
    res.status(500).json({ message: "Wishlist error" });
  } finally {
    if (client) client.release();
  }
});

app.get("/wishlist/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const result = await pool.query(`
      SELECT p.* 
      FROM products p
      JOIN wishlist_items wi ON p.product_id = wi.product_id
      JOIN wishlists w ON wi.wishlist_id = w.wishlist_id
      WHERE w.customer_id = $1
    `, [customerId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch wishlist error:", err);
    res.status(500).json({ message: "Error fetching wishlist" });
  }
});


app.post("/cart/add", async (req, res) => {
  console.log("Cart add request:", req.body);
  const { customerId, productId, variantId, quantity } = req.body;
  if (!customerId || !productId) {
    console.warn("Cart add failed: Missing required fields", { customerId, productId });
    return res.status(400).json({ message: "Missing data" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Ensure cart exists
    let cartRes = await client.query("SELECT cart_id FROM carts WHERE customer_id = $1", [customerId]);
    let cartId;
    if (cartRes.rows.length === 0) {
      const countCartsRes = await client.query("SELECT COUNT(*) FROM carts");
      const nextCartNum = parseInt(countCartsRes.rows[0].count) + 1;
      cartId = `CRT-${nextCartNum.toString().padStart(3, '0')}`;
      
      await client.query("INSERT INTO carts (cart_id, customer_id) VALUES ($1, $2)", [cartId, customerId]);
    } else {
      cartId = cartRes.rows[0].cart_id;
    }

    // 2. Add or Update
    const itemCheck = await client.query(
      "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 AND variant_id IS NOT DISTINCT FROM $3", 
      [cartId, productId, variantId || null]
    );

    if (itemCheck.rows.length > 0) {
      await client.query(
        "UPDATE cart_items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2 AND product_id = $3 AND variant_id IS NOT DISTINCT FROM $4",
        [quantity || 1, cartId, productId, variantId || null]
      );
    } else {
      const maxIdRes = await client.query("SELECT cart_item_id FROM cart_items ORDER BY cart_item_id DESC LIMIT 1");
      let nextNum = 1;
      if (maxIdRes.rows.length > 0) {
        const lastId = maxIdRes.rows[0].cart_item_id;
        const match = lastId.match(/\d+/);
        nextNum = (match ? parseInt(match[0]) : 0) + 1;
      }
      const itemId = `CRT-IT-${nextNum.toString().padStart(4, '0')}`;
      
      await client.query(
        "INSERT INTO cart_items (cart_item_id, cart_id, product_id, variant_id, quantity) VALUES ($1, $2, $3, $4, $5)",
        [itemId, cartId, productId, variantId || null, quantity || 1]
      );
    }
    
    await client.query('COMMIT');
    res.json({ message: "Cart updated" });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("Cart add error:", err);
    res.status(500).json({ message: "Cart error" });
  } finally {
    if (client) client.release();
  }
});

app.post("/cart/update", async (req, res) => {
  const { customerId, productId, variantId, quantity } = req.body;
  try {
    await pool.query(`
      UPDATE cart_items ci
      SET quantity = $4, updated_at = CURRENT_TIMESTAMP
      FROM carts c
      WHERE ci.cart_id = c.cart_id AND c.customer_id = $1 
      AND ci.product_id = $2 AND ci.variant_id IS NOT DISTINCT FROM $3
    `, [customerId, productId, variantId || null, quantity]);
    res.json({ message: "Quantity updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update quantity error" });
  }
});

app.post("/cart/remove", async (req, res) => {
  const { customerId, productId, variantId } = req.body;
  try {
    await pool.query(`
      DELETE FROM cart_items ci
      USING carts c
      WHERE ci.cart_id = c.cart_id AND c.customer_id = $1 
      AND ci.product_id = $2 AND ci.variant_id IS NOT DISTINCT FROM $3
    `, [customerId, productId, variantId || null]);
    res.json({ message: "Item removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Remove item error" });
  }
});

app.post("/order/place", async (req, res) => {
  console.log("--- ORDER PLACE REQUEST RECEIVED ---", req.body);
  const { customerId, addressId, cartItems, subtotal, discountAmount, totalAmount, couponId, shippingCharge } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Generate Order ID
    const maxOrderRes = await client.query("SELECT order_id FROM orders ORDER BY order_id DESC LIMIT 1");
    let nextNum = 1;
    if (maxOrderRes.rows.length > 0) {
      const lastId = maxOrderRes.rows[0].order_id;
      const match = lastId.match(/\d+/);
      nextNum = (match ? parseInt(match[0]) : 0) + 1;
    }
    const orderId = `ORD-${nextNum.toString().padStart(3, '0')}`;

    // Insert Order
    await client.query(
      `INSERT INTO orders (order_id, customer_id, address_id, coupon_id, subtotal, discount_amount, shipping_charge, total_amount, order_status, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [orderId, customerId, addressId || null, couponId || null, subtotal, discountAmount || 0, shippingCharge || 0, totalAmount, 'Confirmed', 'Paid']
    );

    // Insert Items
    for (const item of cartItems) {
       // Robust price extraction: prefer variant price, then item price, then base price
       const rawPrice = item.variant?.price || item.price || 0;
       const uPrice = parseFloat(String(rawPrice).replace(/[^\d.]/g, ''));
       const tPrice = uPrice * item.quantity;
       
       // Get seller_id for this product
       const prodRes = await client.query("SELECT seller_id FROM products WHERE product_id = $1", [item.product_id]);
       const sellerId = prodRes.rows.length > 0 ? prodRes.rows[0].seller_id : null;

       const maxItemRes = await client.query("SELECT order_item_id FROM order_items ORDER BY order_item_id DESC LIMIT 1");
       let nextItemNum = 1;
       if (maxItemRes.rows.length > 0) {
         const lastItemId = maxItemRes.rows[0].order_item_id;
         const matchItem = lastItemId.match(/\d+/);
         nextItemNum = (matchItem ? parseInt(matchItem[0]) : 0) + 1;
       }
       const orderItemId = `ORD-IT-${nextItemNum.toString().padStart(4, '0')}`;

       await client.query(
         `INSERT INTO order_items (order_item_id, order_id, product_id, seller_id, variant_id, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
         [orderItemId, orderId, item.product_id, sellerId, item.variantId || null, item.quantity, uPrice, tPrice]
       );
    }

    // Clear Cart
    await client.query(`
      DELETE FROM cart_items ci
      USING carts c
      WHERE ci.cart_id = c.cart_id AND c.customer_id = $1
    `, [customerId]);

    await client.query("COMMIT");
    console.log("Order placed successfully:", orderId);
    res.json({ success: true, orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Order placement crash:", err);
    res.status(500).json({ message: "Order placement error" });
  } finally {
    client.release();
  }
});

app.get("/cart/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const result = await pool.query(`
      SELECT ci.*, p.name, p.price as base_price, p.mrp as base_mrp, p.images, p.brand, p.discount, 
             pv.price as variant_price, pv.mrp as variant_mrp, pv.variant_name, pv.variant_value
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.cart_id
      JOIN products p ON ci.product_id = p.product_id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.variant_id
      WHERE c.customer_id = $1
    `, [customerId]);
    console.log("Fetched cart data for", customerId, ":", result.rows.length, "items");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch cart error" });
  }
});
 


app.get("/products/category/:categoryName", async (req, res) => {
  const { categoryName } = req.params;
  try {
    const result = await pool.query(`
      SELECT p.* 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE LOWER(c.name) = LOWER($1) OR LOWER(p.category) = LOWER($1)
    `, [categoryName]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products by category" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products" });
  }
});
 
app.get("/seller-orders/:sellerId", async (req, res) => {
  const { sellerId } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        oi.*, 
        o.placed_at, o.order_status, o.payment_status,
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
    `, [sellerId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch seller orders error" });
  }
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});