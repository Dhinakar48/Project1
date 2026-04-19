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
        sellerid VARCHAR(20) PRIMARY KEY,
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
    sellerid VARCHAR(20) REFERENCES sellers(sellerid) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    country VARCHAR(50) DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT unique_customer_address UNIQUE (customer_id),
    CONSTRAINT unique_seller_address UNIQUE (sellerid)
);
    `);
    console.log("Table 'addresses' initialized successfully.");

  } catch (e) {
    console.error("Error creating tables:", e.message);
  } finally {
    await client1.end();
  }
}

setup();