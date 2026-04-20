const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: '3616',
    port: 5432,
    database: 'local_db'
  });

  try {
    await client.connect();
    console.log("Connected to database for migration...");

    // Add color_name column if it doesn't exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'product_images' AND COLUMN_NAME = 'color_name') THEN
          ALTER TABLE product_images ADD COLUMN color_name VARCHAR(50);
        END IF;
      END $$;
    `);
    console.log("Verified 'color_name' column.");

    // Add color_code column if it doesn't exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'product_images' AND COLUMN_NAME = 'color_code') THEN
          ALTER TABLE product_images ADD COLUMN color_code VARCHAR(20);
        END IF;
      END $$;
    `);
    console.log("Verified 'color_code' column.");

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

migrate();
