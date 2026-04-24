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
        discount INT DEFAULT 0,
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
        order_id VARCHAR(20) PRIMARY KEY,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE SET NULL,
        address_id INT REFERENCES addresses(address_id) ON DELETE SET NULL,
        coupon_id VARCHAR(50),
        subtotal DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        shipping_charge DECIMAL(10, 2) DEFAULT 0,
        platform_fee DECIMAL(10, 2) DEFAULT 0,
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
        order_id VARCHAR(20) REFERENCES orders(order_id) ON DELETE CASCADE,
        product_id VARCHAR(50),
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE SET NULL,
        variant_id VARCHAR(50),
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
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
        wishlist_id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_customer_wishlist UNIQUE (customer_id)
      );
    `);
    console.log("Table 'wishlists' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        wishlist_item_id VARCHAR(50) PRIMARY KEY,
        wishlist_id VARCHAR(50) REFERENCES wishlists(wishlist_id) ON DELETE CASCADE,
        product_id VARCHAR(50) REFERENCES products(product_id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (wishlist_id, product_id)
      );
    `);
    console.log("Table 'wishlist_items' initialized successfully.");

    await client1.query(`CREATE SEQUENCE IF NOT EXISTS payment_id_seq START 1;`);
    await client1.query(`
      CREATE TABLE IF NOT EXISTS payments (
        payment_id VARCHAR(20) PRIMARY KEY,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE SET NULL,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE SET NULL,
        order_id VARCHAR(20) REFERENCES orders(order_id) ON DELETE CASCADE,
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
    await client1.query(`
      CREATE OR REPLACE FUNCTION generate_payment_id()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.payment_id IS NULL THEN
            NEW.payment_id := 'PMT-' || LPAD(nextval('payment_id_seq')::text, 3, '0');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client1.query(`
      DROP TRIGGER IF EXISTS trigger_generate_payment_id ON payments;
      CREATE TRIGGER trigger_generate_payment_id
      BEFORE INSERT ON payments
      FOR EACH ROW
      EXECUTE FUNCTION generate_payment_id();
    `);
    console.log("Table 'payments' with semantic ID initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS order_sellers (
        order_seller_id SERIAL PRIMARY KEY,
        order_id VARCHAR(20) REFERENCES orders(order_id) ON DELETE CASCADE,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        seller_subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'order_sellers' initialized successfully.");

    // Reviews table with semantic ID generation
    await client1.query(`CREATE SEQUENCE IF NOT EXISTS review_id_seq START 1;`);
    await client1.query(`CREATE SEQUENCE IF NOT EXISTS notification_id_seq START 1;`);
    await client1.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id VARCHAR(20) PRIMARY KEY,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE CASCADE,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        order_id VARCHAR(20) REFERENCES orders(order_id) ON DELETE CASCADE,
        type VARCHAR(50),
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );
    `);
    await client1.query(`
      CREATE OR REPLACE FUNCTION generate_notification_id()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.notification_id IS NULL THEN
            NEW.notification_id := 'NOT-' || LPAD(nextval('notification_id_seq')::text, 3, '0');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client1.query(`
      DROP TRIGGER IF EXISTS trigger_generate_notification_id ON notifications;
      CREATE TRIGGER trigger_generate_notification_id
      BEFORE INSERT ON notifications
      FOR EACH ROW
      EXECUTE FUNCTION generate_notification_id();
    `);
    console.log("Table 'notifications' initialized successfully.");

    await client1.query(`CREATE SEQUENCE IF NOT EXISTS order_status_history_id_seq START 1;`);
    await client1.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        history_id VARCHAR(20) PRIMARY KEY,
        order_id VARCHAR(20) REFERENCES orders(order_id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        changed_by VARCHAR(50),
        notes TEXT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client1.query(`
      CREATE OR REPLACE FUNCTION generate_history_id()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.history_id IS NULL THEN
            NEW.history_id := 'HST-' || LPAD(nextval('order_status_history_id_seq')::text, 3, '0');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client1.query(`
      DROP TRIGGER IF EXISTS trigger_generate_history_id ON order_status_history;
      CREATE TRIGGER trigger_generate_history_id
      BEFORE INSERT ON order_status_history
      FOR EACH ROW
      EXECUTE FUNCTION generate_history_id();
    `);
    console.log("Table 'order_status_history' initialized successfully.");

    await client1.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        review_id VARCHAR(20) PRIMARY KEY,
        order_item_id VARCHAR(30) REFERENCES order_items(order_item_id) ON DELETE CASCADE,
        customer_id VARCHAR(20) REFERENCES customers(customer_id) ON DELETE CASCADE,
        product_id VARCHAR(50) REFERENCES products(product_id) ON DELETE CASCADE,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        body TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client1.query(`
      CREATE OR REPLACE FUNCTION generate_review_id()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.review_id IS NULL THEN
            NEW.review_id := 'rev-' || LPAD(nextval('review_id_seq')::text, 3, '0');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client1.query(`
      DROP TRIGGER IF EXISTS trigger_generate_review_id ON reviews;
      CREATE TRIGGER trigger_generate_review_id
      BEFORE INSERT ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION generate_review_id();
    `);
    console.log("Table 'reviews' with ID trigger initialized successfully.");

    // Annual Finances table
    await client1.query(`CREATE SEQUENCE IF NOT EXISTS annual_finance_id_seq START 1;`);
    await client1.query(`
      CREATE TABLE IF NOT EXISTS annual_finances (
        annual_finance_id VARCHAR(20) PRIMARY KEY,
        half_yearly_finances_id VARCHAR(20), -- FK added later due to circular dependency
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        year INT NOT NULL,
        total_revenue DECIMAL(15, 2) DEFAULT 0.00,
        platform_commission DECIMAL(15, 2) DEFAULT 0.00,
        net_seller_earnings DECIMAL(15, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client1.query(`
      CREATE OR REPLACE FUNCTION generate_annual_finance_id()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.annual_finance_id IS NULL THEN
            NEW.annual_finance_id := 'AFN-' || LPAD(nextval('annual_finance_id_seq')::text, 3, '0');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client1.query(`
      DROP TRIGGER IF EXISTS trigger_generate_annual_finance_id ON annual_finances;
      CREATE TRIGGER trigger_generate_annual_finance_id
      BEFORE INSERT ON annual_finances
      FOR EACH ROW
      EXECUTE FUNCTION generate_annual_finance_id();
    `);
    console.log("Table 'annual_finances' initialized successfully.");

    // Half-Yearly Finances table
    await client1.query(`CREATE SEQUENCE IF NOT EXISTS half_yearly_finance_id_seq START 1;`);
    await client1.query(`
      CREATE TABLE IF NOT EXISTS half_yearly_finances (
        half_yearly_finances_id VARCHAR(20) PRIMARY KEY,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        half_number INT NOT NULL CHECK (half_number BETWEEN 1 AND 2),
        year INT NOT NULL,
        annual_finance_id VARCHAR(20) REFERENCES annual_finances(annual_finance_id) ON DELETE SET NULL,
        total_revenue DECIMAL(15, 2) DEFAULT 0.00,
        platform_commission DECIMAL(15, 2) DEFAULT 0.00,
        net_seller_earnings DECIMAL(15, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client1.query(`
      CREATE OR REPLACE FUNCTION generate_half_yearly_finance_id()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.half_yearly_finances_id IS NULL THEN
            NEW.half_yearly_finances_id := 'HFN-' || LPAD(nextval('half_yearly_finance_id_seq')::text, 3, '0');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client1.query(`
      DROP TRIGGER IF EXISTS trigger_generate_half_yearly_finance_id ON half_yearly_finances;
      CREATE TRIGGER trigger_generate_half_yearly_finance_id
      BEFORE INSERT ON half_yearly_finances
      FOR EACH ROW
      EXECUTE FUNCTION generate_half_yearly_finance_id();
    `);
    console.log("Table 'half_yearly_finances' initialized successfully.");

    // Add circular FK to annual_finances
    await client1.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_annual_half') THEN
          ALTER TABLE annual_finances 
          ADD CONSTRAINT fk_annual_half 
          FOREIGN KEY (half_yearly_finances_id) REFERENCES half_yearly_finances(half_yearly_finances_id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Quarterly Finances table
    await client1.query(`CREATE SEQUENCE IF NOT EXISTS quarterly_finance_id_seq START 1;`);
    await client1.query(`
      CREATE TABLE IF NOT EXISTS quarterly_finances (
        quarterly_finance_id VARCHAR(20) PRIMARY KEY,
        monthly_finance_id VARCHAR(20), -- FK added later due to circular dependency
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        quarter_number INT NOT NULL CHECK (quarter_number BETWEEN 1 AND 4),
        year INT NOT NULL,
        half_yearly_finances_id VARCHAR(20) REFERENCES half_yearly_finances(half_yearly_finances_id) ON DELETE SET NULL,
        total_revenue DECIMAL(15, 2) DEFAULT 0.00,
        platform_commission DECIMAL(15, 2) DEFAULT 0.00,
        net_seller_earnings DECIMAL(15, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client1.query(`
      CREATE OR REPLACE FUNCTION generate_quarterly_finance_id()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.quarterly_finance_id IS NULL THEN
            NEW.quarterly_finance_id := 'QFN-' || LPAD(nextval('quarterly_finance_id_seq')::text, 3, '0');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client1.query(`
      DROP TRIGGER IF EXISTS trigger_generate_quarterly_finance_id ON quarterly_finances;
      CREATE TRIGGER trigger_generate_quarterly_finance_id
      BEFORE INSERT ON quarterly_finances
      FOR EACH ROW
      EXECUTE FUNCTION generate_quarterly_finance_id();
    `);
    console.log("Table 'quarterly_finances' initialized successfully.");

    // Monthly Finances table
    await client1.query(`CREATE SEQUENCE IF NOT EXISTS monthly_finance_id_seq START 1;`);
    await client1.query(`
      CREATE TABLE IF NOT EXISTS monthly_finances (
        monthly_finance_id VARCHAR(20) PRIMARY KEY,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        month_number INT NOT NULL CHECK (month_number BETWEEN 1 AND 12),
        year INT NOT NULL,
        quarterly_finance_id VARCHAR(20) REFERENCES quarterly_finances(quarterly_finance_id) ON DELETE SET NULL,
        total_revenue DECIMAL(15, 2) DEFAULT 0.00,
        platform_commission DECIMAL(15, 2) DEFAULT 0.00,
        net_seller_earnings DECIMAL(15, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client1.query(`
      CREATE OR REPLACE FUNCTION generate_monthly_finance_id()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.monthly_finance_id IS NULL THEN
            NEW.monthly_finance_id := 'MFN-' || LPAD(nextval('monthly_finance_id_seq')::text, 3, '0');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client1.query(`
      DROP TRIGGER IF EXISTS trigger_generate_monthly_finance_id ON monthly_finances;
      CREATE TRIGGER trigger_generate_monthly_finance_id
      BEFORE INSERT ON monthly_finances
      FOR EACH ROW
      EXECUTE FUNCTION generate_monthly_finance_id();
    `);
    console.log("Table 'monthly_finances' initialized successfully.");

    // Add circular FK to quarterly_finances
    await client1.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_quarterly_monthly') THEN
          ALTER TABLE quarterly_finances 
          ADD CONSTRAINT fk_quarterly_monthly 
          FOREIGN KEY (monthly_finance_id) REFERENCES monthly_finances(monthly_finance_id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Daily Finances table
    await client1.query(`CREATE SEQUENCE IF NOT EXISTS daily_finance_id_seq START 1;`);
    await client1.query(`
      CREATE TABLE IF NOT EXISTS daily_finances (
        daily_finance_id VARCHAR(20) PRIMARY KEY,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        finance_date DATE NOT NULL,
        weekly_finance_id VARCHAR(20), -- FK added later due to circular dependency
        monthly_finance_id VARCHAR(20) REFERENCES monthly_finances(monthly_finance_id) ON DELETE SET NULL,
        total_revenue DECIMAL(15, 2) DEFAULT 0.00,
        platform_commissions DECIMAL(15, 2) DEFAULT 0.00,
        net_seller_earnings DECIMAL(15, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client1.query(`
      CREATE OR REPLACE FUNCTION generate_daily_finance_id()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.daily_finance_id IS NULL THEN
            NEW.daily_finance_id := 'DFN-' || LPAD(nextval('daily_finance_id_seq')::text, 3, '0');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client1.query(`
      DROP TRIGGER IF EXISTS trigger_generate_daily_finance_id ON daily_finances;
      CREATE TRIGGER trigger_generate_daily_finance_id
      BEFORE INSERT ON daily_finances
      FOR EACH ROW
      EXECUTE FUNCTION generate_daily_finance_id();
    `);
    console.log("Table 'daily_finances' initialized successfully.");

    // Weekly Finances table
    await client1.query(`CREATE SEQUENCE IF NOT EXISTS weekly_finance_id_seq START 1;`);
    await client1.query(`
      CREATE TABLE IF NOT EXISTS weekly_finances (
        weekly_finance_id VARCHAR(20) PRIMARY KEY,
        daily_finance_id VARCHAR(20) REFERENCES daily_finances(daily_finance_id) ON DELETE SET NULL,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        week_number INT NOT NULL,
        year INT NOT NULL,
        total_revenue DECIMAL(15, 2) DEFAULT 0.00,
        platform_commission DECIMAL(15, 2) DEFAULT 0.00,
        net_seller_earnings DECIMAL(15, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client1.query(`
      CREATE OR REPLACE FUNCTION generate_weekly_finance_id()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.weekly_finance_id IS NULL THEN
            NEW.weekly_finance_id := 'WFN-' || LPAD(nextval('weekly_finance_id_seq')::text, 3, '0');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client1.query(`
      DROP TRIGGER IF EXISTS trigger_generate_weekly_finance_id ON weekly_finances;
      CREATE TRIGGER trigger_generate_weekly_finance_id
      BEFORE INSERT ON weekly_finances
      FOR EACH ROW
      EXECUTE FUNCTION generate_weekly_finance_id();
    `);
    console.log("Table 'weekly_finances' initialized successfully.");

    // Add circular FK to daily_finances
    await client1.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_daily_weekly') THEN
          ALTER TABLE daily_finances 
          ADD CONSTRAINT fk_daily_weekly 
          FOREIGN KEY (weekly_finance_id) REFERENCES weekly_finances(weekly_finance_id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Seller Commissions table
    await client1.query(`
      CREATE TABLE IF NOT EXISTS seller_commissions (
        commission_id VARCHAR(30) PRIMARY KEY,
        order_item_id VARCHAR(30) REFERENCES order_items(order_item_id) ON DELETE CASCADE,
        seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
        order_id VARCHAR(20) REFERENCES orders(order_id) ON DELETE CASCADE,
        sale_amount DECIMAL(15, 2) NOT NULL,
        commission_rate DECIMAL(5, 2) NOT NULL,
        commission_amount DECIMAL(15, 2) NOT NULL,
        seller_earnings DECIMAL(15, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'seller_commissions' initialized successfully.");

    // Finance Transactions table
    await client1.query(`
      CREATE TABLE IF NOT EXISTS finance_transactions (
        finance_transaction_id VARCHAR(30) PRIMARY KEY,
        daily_finance_id VARCHAR(30) REFERENCES daily_finances(daily_finance_id) ON DELETE SET NULL,
        order_id VARCHAR(20) REFERENCES orders(order_id) ON DELETE SET NULL,
        payment_id VARCHAR(30),
        seller_payout_id VARCHAR(30),
        transaction_type VARCHAR(50) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'finance_transactions' initialized successfully.");

  } catch (e) {
    console.error("Error creating tables:", e.message);
  } finally {
    await client1.end();
  }
}

setup();