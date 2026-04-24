const express = require('express');
const router = express.Router();
const pool = require('../db');

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
      
      if (admin.password_hash !== password) {
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
      
      const recentActRes = await pool.query("SELECT order_id as detail, placed_at as time, 'New Order Placed' as action FROM orders ORDER BY placed_at DESC LIMIT 4");
      
      const topProdRes = await pool.query(`
         SELECT p.name, p.product_id, SUM(oi.quantity) as sales, SUM(oi.unit_price * oi.quantity) as rev 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.product_id 
         GROUP BY p.product_id, p.name 
         ORDER BY rev DESC LIMIT 3
      `);

      res.json({
         success: true,
         stats: {
            volume: volRes.rows[0].vol,
            sellers: sellRes.rows[0].sellers,
            customers: custRes.rows[0].customers,
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
      images, discount, is_featured 
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
         (product_id, name, description, price, mrp, stock_quantity, category_id, brand, sku, images, discount, is_featured, seller_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
         RETURNING *`,
         [productId, name, description, price, mrp, stock_quantity, final_category_id, brand, sku, images || [], discount || 0, is_featured || false, sellerId]
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
      images, discount, is_featured, is_active 
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
         discount = $10, is_featured = $11, is_active = $12, updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $13`,
         [name, description, price, mrp, stock_quantity, final_category_id, brand, sku, images || [], discount || 0, is_featured || false, is_active !== undefined ? is_active : true, id]
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
   try {
      await pool.query("UPDATE products SET deleted_at = CURRENT_TIMESTAMP, is_active = false WHERE product_id = $1", [req.params.id]);
      res.json({ success: true });
   } catch (err) {
      console.error('[admin-delete-product] Error:', err);
      res.status(500).json({ success: false });
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
         await pool.query("UPDATE customers SET is_active = $1 WHERE customer_id = $2", [isActive, userId]);
      } else {
         await pool.query("UPDATE sellers SET is_active = $1 WHERE seller_id = $2", [isActive, userId]);
      }
      res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully.` });
   } catch (err) {
      console.error('[toggle-user-status] Error:', err);
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
         WHERE o.order_status IN ('Cancelled', 'Returned', 'Refunded')
         ORDER BY o.updated_at DESC
      `);
      res.json({ success: true, returns: result.rows });
   } catch (err) {
      console.error('[admin-returns] Error:', err);
      res.status(500).json({ success: false });
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

module.exports = router;



