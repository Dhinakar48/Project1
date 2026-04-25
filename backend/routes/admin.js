const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const { decrypt } = require('../utils/encryption');

// Admin Login Route
router.post('/admin-login', async (req, res) => {
   const { email, password } = req.body;
   
   try {
      console.log(`[admin-login] Attempting login for: ${email}`);
      const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
      
      if (result.rows.length === 0) {
         return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
      }

      const admin = result.rows[0];
      
      const isMatch = await bcrypt.compare(password, admin.password_hash);
      
      if (!isMatch && admin.password_hash !== password) {
         return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
      }

      if (!admin.is_active) {
         return res.status(403).json({ success: false, message: 'Admin account is deactivated.' });
      }

      await pool.query('UPDATE admins SET last_login_at = NOW() WHERE admin_id = $1', [admin.admin_id]);

      res.json({
         success: true,
         admin: {
            id: admin.admin_id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions
         }
      });

   } catch (err) {
      console.error('[admin-login] Error:', err);
      res.status(500).json({ success: false, message: 'Server error during authentication.' });
   }
});

router.get('/admin/dashboard-stats', async (req, res) => {
   try {
      // Correct columns: total_amount, placed_at, unit_price
      const volRes = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as vol FROM orders");
      const sellRes = await pool.query("SELECT COUNT(*) as sellers FROM sellers");
      const custRes = await pool.query("SELECT COUNT(*) as customers FROM customers");
      const blockedRes = await pool.query("SELECT COUNT(*) as blocked FROM customers WHERE is_active = false");
      
      const recentActRes = await pool.query("SELECT order_id as detail, placed_at as time, 'New Order Placed' as action FROM orders ORDER BY placed_at DESC LIMIT 4");
      
      const topProdRes = await pool.query(`
         SELECT p.name, p.product_id, p.images, p.brand, c.name as category_name,
                SUM(oi.quantity) as sales, SUM(oi.unit_price * oi.quantity) as rev 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.product_id 
         LEFT JOIN categories c ON p.category_id = c.category_id
         WHERE p.deleted_at IS NULL
         GROUP BY p.product_id, p.name, p.images, p.brand, c.name
         ORDER BY rev DESC LIMIT 3
      `);

      res.json({
         success: true,
         stats: {
            volume: volRes.rows[0].vol,
            sellers: sellRes.rows[0].sellers,
            customers: custRes.rows[0].customers,
            blockedCustomers: blockedRes.rows[0].blocked,
            platformRevenue: Number(volRes.rows[0].vol) * 0.05,
         },
         recentActivity: recentActRes.rows.map(r => ({
             action: r.action,
             detail: `Order ${r.detail} processed successfully.`,
             time: new Date(r.time).toLocaleString()
         })),
         topProducts: topProdRes.rows
      });
   } catch (err) {
      console.error('[dashboard-stats] Error:', err);
      res.status(500).json({ success: false, error: err.message });
   }
});

// Get all products for Admin
router.get('/admin/products', async (req, res) => {
   try {
      const result = await pool.query(`
         SELECT p.*, s.store_name as seller_name 
         FROM products p 
         LEFT JOIN sellers s ON p.seller_id = s.seller_id 
         WHERE p.deleted_at IS NULL
         ORDER BY p.created_at DESC
      `);
      res.json({ success: true, products: result.rows });
   } catch (err) {
      console.error('[admin-products] Error:', err);
      res.status(500).json({ success: false });
   }
});

// Get all categories for dropdown
router.get('/admin/categories', async (req, res) => {
   try {
      const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
      res.json({ success: true, categories: result.rows });
   } catch (err) {
      console.error('[admin-categories] Error:', err);
      res.status(500).json({ success: false });
   }
});

// Add new product
router.post('/admin/add-product', async (req, res) => {
   const { 
      name, description, price, mrp, stock_quantity, 
      category_id, new_category_name, brand, sku, 
      images, discount, is_featured, product_type, specifications
   } = req.body;
   
   const client = await pool.connect();
   try {
      await client.query('BEGIN');

      let final_category_id = category_id;

      // Handle new category creation
      if (category_id === 'new' && new_category_name) {
         const slug = new_category_name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
         const catResult = await client.query(
            "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING category_id",
            [new_category_name.trim(), slug]
         );
         final_category_id = catResult.rows[0].category_id;
      }

      // Generate Product ID
      const countRes = await client.query("SELECT COUNT(*) FROM products");
      const nextNum = parseInt(countRes.rows[0].count) + 1;
      const productId = `PRD${nextNum.toString().padStart(3, '0')}`;

      const sellerId = 'SEL001'; // Default system seller

      const result = await client.query(
         `INSERT INTO products 
         (product_id, name, description, price, mrp, stock_quantity, category_id, brand, sku, images, discount, is_featured, seller_id, is_active, product_type, specifications)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14, $15)
         RETURNING *`,
         [
            productId, name, description, price, mrp, stock_quantity, final_category_id, brand, sku, 
            images || [], discount || 0, is_featured || false, sellerId, 
            product_type, JSON.stringify(specifications || [])
         ]
      );

      await client.query('COMMIT');
      res.json({ success: true, product: result.rows[0] });
   } catch (err) {
      await client.query('ROLLBACK');
      console.error('[admin-add-product] Error:', err);
      res.status(500).json({ success: false, message: err.message });
   } finally {
      client.release();
   }
});

// Update product (Admin)
router.put('/admin/update-product/:id', async (req, res) => {
   const { id } = req.params;
   const { 
      name, description, price, mrp, stock_quantity, 
      category_id, new_category_name, brand, sku, 
      images, discount, is_featured, is_active,
      product_type, specifications 
   } = req.body;
   
   const client = await pool.connect();
   try {
      await client.query('BEGIN');

      let final_category_id = category_id;
      if (category_id === 'new' && new_category_name) {
         const slug = new_category_name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
         const catResult = await client.query(
            "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING category_id",
            [new_category_name.trim(), slug]
         );
         final_category_id = catResult.rows[0].category_id;
      }

      await client.query(
         `UPDATE products SET 
         name = $1, description = $2, price = $3, mrp = $4, stock_quantity = $5, 
         category_id = $6, brand = $7, sku = $8, images = $9, 
         discount = $10, is_featured = $11, is_active = $12, 
         product_type = $13, specifications = $14, updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $15`,
         [
            name, description, price, mrp, stock_quantity, 
            final_category_id, brand, sku, images || [], 
            discount || 0, is_featured || false, is_active !== undefined ? is_active : true,
            product_type, JSON.stringify(specifications || []), id
         ]
      );

      await client.query('COMMIT');
      res.json({ success: true });
   } catch (err) {
      await client.query('ROLLBACK');
      console.error('[admin-update-product] Error:', err);
      res.status(500).json({ success: false, message: err.message });
   } finally {
      client.release();
   }
});

// Delete product (Admin)
router.delete('/admin/delete-product/:id', async (req, res) => {
   const client = await pool.connect();
   try {
      await client.query('BEGIN');
      
      // Try to hard delete first (physically remove if no constraints exist)
      // This satisfies the user's request for a "real" delete
      try {
         // Also delete associated images and variants first to avoid internal FK issues
         await client.query("DELETE FROM product_images WHERE product_id = $1", [req.params.id]);
         await client.query("DELETE FROM product_variants WHERE product_id = $1", [req.params.id]);
         
         const result = await client.query("DELETE FROM products WHERE product_id = $1", [req.params.id]);
         
         if (result.rowCount === 0) {
            throw new Error("Product not found");
         }
         
         await client.query('COMMIT');
         console.log(`[admin-delete] Hard deleted product: ${req.params.id}`);
         return res.json({ success: true, message: 'Product permanently removed.' });
      } catch (hardErr) {
         // If hard delete fails (likely due to order history/foreign keys in other tables), 
         // we fall back to a safe soft delete.
         await client.query('ROLLBACK');
         console.log(`[admin-delete] Hard delete failed for ${req.params.id}, falling back to soft delete. Reason: ${hardErr.message}`);
         
         await pool.query(
            "UPDATE products SET deleted_at = CURRENT_TIMESTAMP, is_active = false WHERE product_id = $1", 
            [req.params.id]
         );
         
         return res.json({ success: true, message: 'Product archived (soft-deleted) because it has existing order records.' });
      }
   } catch (err) {
      console.error('[admin-delete-product] Critical Error:', err);
      res.status(500).json({ success: false, message: 'Failed to process deletion.' });
   } finally {
      client.release();
   }
});

// Get all orders for Admin
router.get('/admin/orders', async (req, res) => {
   try {
      const result = await pool.query(`
         SELECT o.*, c.name as customer_name, c.email as customer_email,
                a.full_name as shipping_name, a.address1, a.address2, a.city, a.state, a.pincode, a.phone,
                p.payment_method, p.transaction_id
         FROM orders o 
         LEFT JOIN customers c ON o.customer_id = c.customer_id 
         LEFT JOIN addresses a ON o.address_id = a.address_id
         LEFT JOIN payments p ON o.order_id = p.order_id
         ORDER BY o.placed_at DESC
      `);
      res.json({ success: true, orders: result.rows });
   } catch (err) {
      console.error('[admin-orders] Error:', err);
      res.status(500).json({ success: false });
   }
});

// Get order details for Admin
router.get('/admin/order-details/:id', async (req, res) => {
   try {
      const orderRes = await pool.query(`
         SELECT o.*, c.name as customer_name, c.email as customer_email,
                a.full_name as shipping_name, a.address1, a.address2, a.city, a.state, a.pincode, a.phone,
                pay.payment_method, pay.transaction_id
         FROM orders o 
         LEFT JOIN customers c ON o.customer_id = c.customer_id 
         LEFT JOIN addresses a ON o.address_id = a.address_id
         LEFT JOIN payments pay ON o.order_id = pay.order_id
         WHERE o.order_id = $1
      `, [req.params.id]);

      if (orderRes.rows.length === 0) {
         return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const itemsRes = await pool.query(`
         SELECT oi.*, p.name as product_name, p.images as product_images, s.store_name as seller_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.product_id
         LEFT JOIN sellers s ON oi.seller_id = s.seller_id
         WHERE oi.order_id = $1
      `, [req.params.id]);

      const historyRes = await pool.query(`
         SELECT * FROM order_status_history 
         WHERE order_id = $1 
         ORDER BY changed_at DESC
      `, [req.params.id]);

      res.json({ 
         success: true, 
         order: orderRes.rows[0], 
         items: itemsRes.rows,
         history: historyRes.rows
      });
   } catch (err) {
      console.error('[admin-order-details] Error:', err);
      res.status(500).json({ success: false });
   }
});

// Get shipping stats for Admin
router.get('/admin/shipping-stats', async (req, res) => {
   try {
      const pending = await pool.query("SELECT COUNT(*) FROM orders WHERE order_status = 'Confirmed'");
      const shipped = await pool.query("SELECT COUNT(*) FROM orders WHERE order_status = 'Shipped'");
      const delivered = await pool.query("SELECT COUNT(*) FROM orders WHERE order_status = 'Delivered'");
      const transit = await pool.query("SELECT COUNT(*) FROM orders WHERE order_status = 'In Transit'");

      res.json({
         success: true,
         stats: {
            pending: pending.rows[0].count,
            shipped: shipped.rows[0].count,
            delivered: delivered.rows[0].count,
            inTransit: transit.rows[0].count
         }
      });
   } catch (err) {
      console.error('[admin-shipping-stats] Error:', err);
      res.status(500).json({ success: false });
   }
});

// Get all shipments for Admin
router.get('/admin/shipments', async (req, res) => {
   try {
      const result = await pool.query(`
         SELECT o.*, c.name as customer_name,
                a.full_name as shipping_name, a.city, a.state, a.pincode
         FROM orders o 
         LEFT JOIN customers c ON o.customer_id = c.customer_id 
         LEFT JOIN addresses a ON o.address_id = a.address_id
         WHERE o.order_status IN ('Confirmed', 'Shipped', 'In Transit', 'Delivered')
         ORDER BY o.placed_at DESC
      `);
      res.json({ success: true, shipments: result.rows });
   } catch (err) {
      console.error('[admin-shipments] Error:', err);
      res.status(500).json({ success: false });
   }
});

// --- USERS MANAGEMENT ---
router.get('/admin/all-users', async (req, res) => {
   try {
      const customers = await pool.query("SELECT customer_id as id, name, email, phone, profile_image as image, is_active, created_at, 'Customer' as type FROM customers ORDER BY created_at DESC");
      const sellers = await pool.query("SELECT seller_id as id, full_name as name, email, phone, store_logo_url as image, is_active, created_at, 'Seller' as type FROM sellers ORDER BY created_at DESC");
      
      res.json({
         success: true,
         users: [...customers.rows, ...sellers.rows]
      });
   } catch (err) {
      console.error('[admin-all-users] Error:', err);
      res.status(500).json({ success: false });
   }
});

router.patch('/admin/toggle-user-status', async (req, res) => {
   const { userId, type, isActive } = req.body;
   try {
      if (type === 'Customer') {
         await pool.query("UPDATE customers SET is_active = $1, is_blocked = $2 WHERE customer_id = $3", [isActive, !isActive, userId]);
      } else {
         await pool.query("UPDATE sellers SET is_active = $1, is_blocked = $2 WHERE seller_id = $3", [isActive, !isActive, userId]);
      }
      res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated/blocked'} successfully.` });
   } catch (err) {
      console.error('[toggle-user-status] Error:', err);
      res.status(500).json({ success: false });
   }
});

// GET full user detail (customer or seller)
router.get('/admin/user-detail/:type/:id', async (req, res) => {
   const { type, id } = req.params;
   try {
      let profile, orders = [], stats = {};

      if (type === 'Customer') {
         const p = await pool.query(
            `SELECT customer_id as id, name, email, phone, profile_image as image,
                    is_active, is_blocked, created_at, 'Customer' as type
             FROM customers WHERE customer_id = $1`, [id]);
         if (p.rows.length === 0) return res.status(404).json({ success: false });
         profile = p.rows[0];

         const o = await pool.query(
            `SELECT o.order_id, o.order_status, o.total_amount, o.placed_at,
                    p.payment_method
             FROM orders o
             LEFT JOIN payments p ON o.order_id = p.order_id
             WHERE o.customer_id = $1 ORDER BY o.placed_at DESC LIMIT 10`, [id]);
         orders = o.rows;

         const s = await pool.query(
            `SELECT COUNT(*) as total_orders,
                    COALESCE(SUM(total_amount),0) as total_spent,
                    COUNT(CASE WHEN order_status='Delivered' THEN 1 END) as delivered
             FROM orders WHERE customer_id = $1`, [id]);
         stats = s.rows[0];

      } else {
         const p = await pool.query(
            `SELECT s.seller_id as id, s.full_name as name, s.email, s.phone,
                    s.store_name, s.store_logo_url as image, s.gstin, s.pan, s.aadhar,
                    s.is_active, s.is_verified, s.created_at, s.store_description, 'Seller' as type,
                    ba.account_number, ba.bank_name, ba.ifsc_code, ba.account_holder_name, ba.verification_status as bank_verified,
                    addr.address1, addr.address2, addr.city, addr.state, addr.pincode
             FROM sellers s
             LEFT JOIN bank_accounts ba ON s.seller_id = ba.owner_id AND ba.owner_type = 'seller'
             LEFT JOIN addresses addr ON s.seller_id = addr.seller_id
             WHERE s.seller_id = $1`, [id]);
         if (p.rows.length === 0) return res.status(404).json({ success: false });
         
         const seller = p.rows[0];
         
         // Decrypt sensitive fields
         seller.pan = decrypt(seller.pan);
         seller.aadhar = decrypt(seller.aadhar);
         seller.account_number = decrypt(seller.account_number);
         seller.ifsc_code = decrypt(seller.ifsc_code);
         
         profile = seller;

         const o = await pool.query(
            `SELECT o.order_id, o.order_status, o.total_amount, o.placed_at
             FROM orders o
             JOIN order_items oi ON o.order_id = oi.order_id
             WHERE oi.seller_id = $1
             GROUP BY o.order_id, o.order_status, o.total_amount, o.placed_at
             ORDER BY o.placed_at DESC LIMIT 10`, [id]);
         orders = o.rows;

         const s = await pool.query(
            `SELECT COUNT(DISTINCT o.order_id) as total_orders,
                    COALESCE(SUM(oi.unit_price * oi.quantity), 0) as total_revenue,
                    COUNT(DISTINCT pr.product_id) as total_products
             FROM order_items oi
             LEFT JOIN orders o ON oi.order_id = o.order_id
             LEFT JOIN products pr ON oi.product_id = pr.product_id AND pr.deleted_at IS NULL
             WHERE oi.seller_id = $1`, [id]);
         stats = s.rows[0];
      }

      res.json({ success: true, profile, orders, stats });
   } catch (err) {
      console.error('[admin-user-detail] Error:', err);
      res.status(500).json({ success: false, message: err.message });
   }
});


// --- FINANCE STATS ---
router.get('/admin/finance-stats', async (req, res) => {
   try {
      const result = await pool.query(`
         SELECT 
            COALESCE(SUM(total_revenue), 0) as total_revenue,
            COALESCE(SUM(platform_commissions), 0) as total_commissions,
            COALESCE(SUM(net_seller_earnings), 0) as total_net
         FROM daily_finances
      `);
      res.json({ success: true, stats: result.rows[0] });
   } catch (err) {
      console.error('[admin-finance-stats] Error:', err);
      res.status(500).json({ success: false });
   }
});

// --- FINANCE TRANSACTIONS MANAGEMENT ---
router.get('/admin/finance-transactions', async (req, res) => {
   try {
      const result = await pool.query(`
         SELECT ft.*, o.total_amount, c.name as customer_name, s.store_name as seller_name
         FROM finance_transactions ft
         LEFT JOIN orders o ON ft.order_id = o.order_id
         LEFT JOIN customers c ON o.customer_id = c.customer_id
         LEFT JOIN daily_finances df ON ft.daily_finance_id = df.daily_finance_id
         LEFT JOIN sellers s ON df.seller_id = s.seller_id
         ORDER BY ft.created_at DESC
      `);
      res.json({ success: true, transactions: result.rows });
   } catch (err) {
      console.error('[admin-finance-transactions] Error:', err);
      res.status(500).json({ success: false });
   }
});

// --- PAYMENTS MANAGEMENT ---
router.get('/admin/transactions', async (req, res) => {
   try {
      const result = await pool.query(`
         SELECT p.*, c.name as customer_name, o.total_amount as order_total
         FROM payments p
         LEFT JOIN customers c ON p.customer_id = c.customer_id
         LEFT JOIN orders o ON p.order_id = o.order_id
         ORDER BY p.created_at DESC
      `);
      res.json({ success: true, transactions: result.rows });
   } catch (err) {
      console.error('[admin-transactions] Error:', err);
      res.status(500).json({ success: false });
   }
});

// --- RETURNS MANAGEMENT ---
router.get('/admin/returns', async (req, res) => {
   try {
      const result = await pool.query(`
         SELECT o.*, c.name as customer_name
         FROM orders o
         LEFT JOIN customers c ON o.customer_id = c.customer_id
         WHERE o.order_status IN ('Returned', 'Refunded')
         ORDER BY o.updated_at DESC
      `);
      res.json({ success: true, returns: result.rows });
   } catch (err) {
      console.error('[admin-returns] Error:', err);
      res.status(500).json({ success: false });
   }
});

// Process a return/cancellation (update status + log history)
router.patch('/admin/returns/:id/process', async (req, res) => {
   const { id } = req.params;
   const { status, notes } = req.body;

   const allowed = ['Refunded', 'Returned', 'Cancelled'];
   if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
   }

   const client = await pool.connect();
   try {
      await client.query('BEGIN');

      await client.query(
         `UPDATE orders SET order_status = $1, updated_at = NOW() WHERE order_id = $2`,
         [status, id]
      );

      await client.query(
         `INSERT INTO order_status_history (order_id, status, notes, changed_by, changed_at)
          VALUES ($1, $2, $3, $4, NOW())`,
         [id, status, notes || `Status updated to ${status} by Admin.`, 'Administrator']
      );

      await client.query('COMMIT');
      res.json({ success: true, message: `Order ${id} marked as ${status}.` });
   } catch (err) {
      await client.query('ROLLBACK');
      console.error('[admin-returns-process] Error:', err);
      res.status(500).json({ success: false, message: err.message });
   } finally {
      client.release();
   }
});


// --- ANALYTICS DETAILED ---
router.get('/admin/analytics-detailed', async (req, res) => {
   try {
      // Monthly Revenue for last 6 months
      const revenueRes = await pool.query(`
         SELECT TO_CHAR(placed_at, 'Mon') as month, SUM(total_amount) as amount
         FROM orders
         WHERE placed_at > CURRENT_DATE - INTERVAL '6 months'
         GROUP BY month, TO_CHAR(placed_at, 'MM')
         ORDER BY TO_CHAR(placed_at, 'MM') ASC
      `);

      // Category Distribution
      const categoryRes = await pool.query(`
         SELECT c.name, COUNT(oi.order_item_id) as sales
         FROM order_items oi
         JOIN products p ON oi.product_id = p.product_id
         JOIN categories c ON p.category_id = c.category_id
         GROUP BY c.name
         ORDER BY sales DESC
      `);

      res.json({
         success: true,
         revenueTrend: revenueRes.rows,
         categoryDistribution: categoryRes.rows
      });
   } catch (err) {
      console.error('[admin-analytics-detailed] Error:', err);
      res.status(500).json({ success: false });
   }
});

// --- PROFILE ---
router.get('/admin/profile/:id', async (req, res) => {
   try {
      const result = await pool.query("SELECT admin_id, name, email, role, last_login_at, created_at FROM admins WHERE admin_id = $1", [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ success: false });
      res.json({ success: true, profile: result.rows[0] });
   } catch (err) {
      console.error('[admin-profile] Error:', err);
      res.status(500).json({ success: false });
   }
});

// --- AUDIT LOGS ---
// Get all audit logs
router.get('/admin/audit-logs', async (req, res) => {
   try {
      const result = await pool.query(`
         SELECT al.*, a.name as admin_name 
         FROM audit_logs al
         LEFT JOIN admins a ON al.admin_id = a.admin_id
         ORDER BY al.created_at DESC
      `);
      res.json({ success: true, logs: result.rows });
   } catch (err) {
      console.error('[admin-audit-logs-get] Error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
   }
});

// Create an audit log entry
router.post('/admin/audit-logs', async (req, res) => {
   const { admin_id, table_name, record_id, action, old_values, new_values } = req.body;
   const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
   const user_agent = req.headers['user-agent'];

   try {
      const result = await pool.query(
         `INSERT INTO audit_logs 
         (admin_id, table_name, record_id, action, old_values, new_values, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
         [admin_id, table_name, record_id, action, old_values ? JSON.stringify(old_values) : null, new_values ? JSON.stringify(new_values) : null, ip_address, user_agent]
      );
      res.json({ success: true, log: result.rows[0] });
   } catch (err) {
      console.error('[admin-audit-logs-post] Error:', err);
      res.status(500).json({ success: false, message: 'Failed to create audit log' });
   }
});

// --- NOTIFICATIONS MANAGEMENT ---
// Get all platform notifications for Admin
router.get('/admin/notifications', async (req, res) => {
   try {
      const result = await pool.query(`
         SELECT n.*, 
                c.name as customer_name, 
                s.store_name as seller_name,
                o.order_status,
                o.total_amount
         FROM notifications n
         LEFT JOIN customers c ON n.customer_id = c.customer_id
         LEFT JOIN sellers s ON n.seller_id = s.seller_id
         LEFT JOIN orders o ON n.order_id = o.order_id
         WHERE n.type IN ('Order Placed', 'Order Update', 'New Order', 'Order Cancelled', 'System Alert')
         ORDER BY n.created_at DESC
         LIMIT 50
      `);
      res.json({ success: true, notifications: result.rows });
   } catch (err) {
      console.error('[admin-notifications-get] Error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
   }
});

// Mark ALL notifications as read
router.patch('/admin/notifications/read-all', async (req, res) => {
   try {
      await pool.query("UPDATE notifications SET is_read = true WHERE type IN ('Order Placed', 'Order Update', 'New Order', 'Order Cancelled', 'System Alert')");
      res.json({ success: true });
   } catch (err) {
      console.error('[admin-notifications-read-all] Error:', err);
      res.status(500).json({ success: false });
   }
});

// Mark notification as read
router.patch('/admin/notifications/read/:id', async (req, res) => {
   try {
      await pool.query("UPDATE notifications SET is_read = true WHERE notification_id = $1", [req.params.id]);
      res.json({ success: true });
   } catch (err) {
      console.error('[admin-notifications-patch] Error:', err);
      res.status(500).json({ success: false });
   }
});

module.exports = router;



