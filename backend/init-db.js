const { Client } = require('pg');

async function setup() {
  // First, check/create database local_db by connecting to default postgres db
  const client0 = new Client({
    user: 'postgres',
    host: 'localhost',
    password: '3616',
    port: 5432,
    database: 'postgres'
  });

  try {
    await client0.connect();
    const res = await client0.query("SELECT 1 FROM pg_database WHERE datname='local_db'");
    if (res.rowCount === 0) {
      await client0.query('CREATE DATABASE "local_db"');
      console.log("Database local_db created.");
    } else {
      console.log("Database local_db already exists.");
    }
  } catch (e) {
    console.error("Error creating database:", e.message);
  } finally {
    await client0.end();
  }

  // Next, connect to local_db and create tables
  const client1 = new Client({
    user: 'postgres',
    host: 'localhost',
    password: '3616',
    port: 5432,
    database: 'local_db'
  });

  try {
    await client1.connect();

    await client1.query(`
  CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password TEXT NOT NULL,
    dob DATE,
    gender VARCHAR(20),
    profile_image TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);
    console.log("Table 'customers' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id SERIAL PRIMARY KEY,
        phone TEXT,
        otp TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'otp_verifications' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS sellers (
        seller_id VARCHAR(20) PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(15),
        password TEXT NOT NULL,
        store_name VARCHAR(150) NOT NULL,
        gstin VARCHAR(20),
        pan VARCHAR(20),
        aadhar VARCHAR(20),
        store_logo_url TEXT,
        store_description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);
    console.log("Table 'sellers' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        bank_account_id SERIAL PRIMARY KEY,
        owner_id VARCHAR(50) NOT NULL,
        owner_type VARCHAR(20) NOT NULL,
        account_number VARCHAR(30),
        upi_id VARCHAR(100),
        bank_name VARCHAR(100),
        ifsc_code VARCHAR(20),
        account_type VARCHAR(20),
        account_holder_name VARCHAR(100) NOT NULL,
        verification_status VARCHAR(20) DEFAULT 'pending',
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (owner_id, owner_type)
      );
    `);
    console.log("Table 'bank_accounts' initialized successfully.");

    await client1.query(`
  CREATE TABLE IF NOT EXISTS addresses (
    address_id SERIAL PRIMARY KEY,
    customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE CASCADE,
    seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    address1 TEXT NOT NULL,
    address2 TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    country VARCHAR(50) DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT unique_customer_address UNIQUE (customer_id),
    CONSTRAINT unique_seller_address UNIQUE (seller_id)
);
    `);
    console.log("Table 'addresses' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id VARCHAR(20) PRIMARY KEY,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        brand VARCHAR(100),
        sku VARCHAR(100) UNIQUE,
        price DECIMAL(10, 2) NOT NULL,
        mrp DECIMAL(10, 2),
        stock_quantity INT DEFAULT 0,
        images TEXT[],
        weight DECIMAL(10, 2),
        height DECIMAL(10, 2),
        width DECIMAL(10, 2),
        breadth DECIMAL(10, 2),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);
    console.log("Table 'products' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        variant_id VARCHAR(20) PRIMARY KEY,
        product_id VARCHAR(20) REFERENCES products(product_id) ON DELETE CASCADE,
        sku VARCHAR(100),
        variant_name VARCHAR(100),
        variant_value VARCHAR(100),
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INT DEFAULT 0,
        weight DECIMAL(10, 2),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'product_variants' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        image_id VARCHAR(20) PRIMARY KEY,
        product_id VARCHAR(20) REFERENCES products(product_id) ON DELETE CASCADE,
        image TEXT NOT NULL,
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'product_images' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id SERIAL PRIMARY KEY,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE SET NULL,
        address_id INT REFERENCES addresses(address_id) ON DELETE SET NULL,
        coupon_id VARCHAR(50),
        subtotal DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        shipping_charge DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        order_status VARCHAR(50) DEFAULT 'Pending',
        payment_status VARCHAR(50) DEFAULT 'Pending',
        cancellation_reason TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'orders' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        order_item_id VARCHAR(30) PRIMARY KEY,
        order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
        product_id VARCHAR(20) REFERENCES products(product_id) ON DELETE SET NULL,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE SET NULL,
        variant_id VARCHAR(20) REFERENCES product_variants(variant_id) ON DELETE SET NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        item_status VARCHAR(50) DEFAULT 'Processing',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'order_items' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS carts (
        cart_id VARCHAR(20) PRIMARY KEY,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_customer_cart UNIQUE (customer_id)
      );
    `);
    console.log("Table 'carts' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        cart_item_id VARCHAR(30) PRIMARY KEY,
        cart_id VARCHAR(20) REFERENCES carts(cart_id) ON DELETE CASCADE,
        product_id VARCHAR(50), 
        variant_id VARCHAR(50),
        quantity INT NOT NULL DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (cart_id, product_id, variant_id)
      );
    `);
    console.log("Table 'cart_items' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        wishlist_id VARCHAR(20) PRIMARY KEY,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_customer_wishlist UNIQUE (customer_id)
      );
    `);
    console.log("Table 'wishlists' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        wishlist_item_id VARCHAR(30) PRIMARY KEY,
        wishlist_id VARCHAR(20) REFERENCES wishlists(wishlist_id) ON DELETE CASCADE,
        product_id VARCHAR(20) REFERENCES products(product_id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (wishlist_id, product_id)
      );
    `);
    console.log("Table 'wishlist_items' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS payments (
        payment_id SERIAL PRIMARY KEY,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE SET NULL,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE SET NULL,
        order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
        payment_method VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_id VARCHAR(100) UNIQUE,
        payment_status VARCHAR(50) DEFAULT 'Pending',
        paid_at TIMESTAMP,
        gateway_name VARCHAR(100),
        gateway_response_code VARCHAR(50),
        failure_reason_code VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'payments' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS order_sellers (
        order_seller_id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        seller_subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'order_sellers' initialized successfully.");

  } catch (e) {
    console.error("Error creating tables:", e.message);
  } finally {
    await client1.end();
  }
}

setup();