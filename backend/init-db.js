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
  } catch(e) {
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
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT,
        password TEXT,
        name TEXT,
        gender TEXT,
        dob DATE,
        address TEXT,
        phone TEXT,
        is_verified BOOLEAN DEFAULT false
      );
    `);
    console.log("Table 'users' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id SERIAL PRIMARY KEY,
        phone TEXT,
        otp TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'otp_verifications' initialized successfully.");
    
  } catch(e) {
    console.error("Error creating tables:", e.message);
  } finally {
    await client1.end();
  }
}

setup();
