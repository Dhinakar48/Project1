const express = require('express');
const router = express.Router();
const pool = require('../db');
const { recordAuditLog } = require('../utils/audit');

// --- ADMIN COUPONS ---
// Get all coupons for Admin
router.get('/admin/coupons', async (req, res) => {
   try {
      const result = await pool.query(`
         SELECT c.*, a.name as admin_name, s.store_name as seller_name
         FROM coupons c
         LEFT JOIN admins a ON c.admin_id = a.admin_id
         LEFT JOIN sellers s ON c.seller_id = s.seller_id
         ORDER BY c.created_at DESC
      `);
      res.json({ success: true, coupons: result.rows });
   } catch (err) {
      console.error('[admin-coupons-get] Error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
   }
});

// Create a coupon (Admin)
router.post('/admin/coupons', async (req, res) => {
   const { admin_id, title, description, code, type, discount_percent, max_discount, min_order_value, max_usage, valid_until } = req.body;
   
   try {
      // Generate coupon_id
      const countRes = await pool.query("SELECT COUNT(*) FROM coupons");
      const nextNum = parseInt(countRes.rows[0].count) + 1;
      const coupon_id = `CUP${nextNum.toString().padStart(3, '0')}`;

      const result = await pool.query(
         `INSERT INTO coupons 
         (coupon_id, admin_id, title, description, code, type, discount_percent, max_discount, min_order_value, max_usage, valid_until) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
         [coupon_id, admin_id, title, description, code, type, discount_percent, max_discount, min_order_value || 0, max_usage, valid_until || null]
      );

      // Audit Log
      await recordAuditLog(admin_id, 'coupons', coupon_id, 'CREATE_COUPON', null, result.rows[0], req);

      res.json({ success: true, coupon: result.rows[0] });
   } catch (err) {
      console.error('[admin-coupons-post] Error:', err);
      res.status(500).json({ success: false, message: err.message });
   }
});

// Update coupon status (Admin)
router.patch('/admin/coupons/:id', async (req, res) => {
   const { is_active } = req.body;
   try {
      await pool.query("UPDATE coupons SET is_active = $1 WHERE coupon_id = $2", [is_active, req.params.id]);
      
      // Audit Log
      await recordAuditLog(req.body.admin_id || 'System', 'coupons', req.params.id, 'UPDATE_COUPON_STATUS', null, { is_active }, req);

      res.json({ success: true });
   } catch (err) {
      console.error('[admin-coupons-patch] Error:', err);
      res.status(500).json({ success: false });
   }
});

// Delete coupon (Admin)
router.delete('/admin/coupons/:id', async (req, res) => {
   try {
      // Check if coupon is used in any orders
      const usageCheck = await pool.query("SELECT COUNT(*) FROM order_coupons WHERE coupon_id = $1", [req.params.id]);
      if (parseInt(usageCheck.rows[0].count) > 0) {
         return res.status(400).json({ 
            success: false, 
            message: 'This coupon cannot be deleted because it has already been used in existing orders. Please deactivate it instead.' 
         });
      }

      const result = await pool.query("DELETE FROM coupons WHERE coupon_id = $1 RETURNING *", [req.params.id]);
      if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Coupon not found' });
      
      // Audit Log
      await recordAuditLog(req.body.admin_id || 'System', 'coupons', req.params.id, 'DELETE_COUPON', result.rows[0], null, req);

      res.json({ success: true });
   } catch (err) {
      console.error('[admin-coupons-delete] Error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete coupon' });
   }
});

// --- SELLER COUPONS ---
// Get all coupons for a specific seller
router.get('/seller/coupons/:sellerId', async (req, res) => {
   try {
      const result = await pool.query(`
         SELECT * FROM coupons 
         WHERE seller_id = $1
         ORDER BY created_at DESC
      `, [req.params.sellerId]);
      res.json({ success: true, coupons: result.rows });
   } catch (err) {
      console.error('[seller-coupons-get] Error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch seller coupons' });
   }
});

// Create a coupon (Seller)
router.post('/seller/coupons', async (req, res) => {
   const { seller_id, title, description, code, type, discount_percent, max_discount, min_order_value, max_usage, valid_until } = req.body;
   
   try {
      // Generate coupon_id
      const countRes = await pool.query("SELECT COUNT(*) FROM coupons");
      const nextNum = parseInt(countRes.rows[0].count) + 1;
      const coupon_id = `CUP${nextNum.toString().padStart(3, '0')}`;

      const result = await pool.query(
         `INSERT INTO coupons 
         (coupon_id, seller_id, title, description, code, type, discount_percent, max_discount, min_order_value, max_usage, valid_until) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
         [coupon_id, seller_id, title, description, code, type, discount_percent, max_discount, min_order_value || 0, max_usage, valid_until || null]
      );
      res.json({ success: true, coupon: result.rows[0] });
   } catch (err) {
      console.error('[seller-coupons-post] Error:', err);
      res.status(500).json({ success: false, message: err.message });
   }
});

// Update coupon status (Seller)
router.patch('/seller/coupons/:id', async (req, res) => {
   const { is_active, seller_id } = req.body;
   try {
      // Ensure the seller owns the coupon
      const result = await pool.query("UPDATE coupons SET is_active = $1 WHERE coupon_id = $2 AND seller_id = $3 RETURNING *", [is_active, req.params.id, seller_id]);
      if (result.rowCount === 0) return res.status(403).json({ success: false, message: 'Unauthorized or not found' });
      res.json({ success: true });
   } catch (err) {
      console.error('[seller-coupons-patch] Error:', err);
      res.status(500).json({ success: false });
   }
});

// Delete coupon (Seller)
router.delete('/seller/coupons/:id', async (req, res) => {
   const { seller_id } = req.body;
   try {
      // Ensure the seller owns the coupon
      const result = await pool.query("DELETE FROM coupons WHERE coupon_id = $1 AND seller_id = $2 RETURNING *", [req.params.id, seller_id]);
      if (result.rowCount === 0) return res.status(403).json({ success: false, message: 'Unauthorized or not found' });
      res.json({ success: true });
   } catch (err) {
      console.error('[seller-coupons-delete] Error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete coupon' });
   }
});

// --- PUBLIC COUPON VALIDATION ---
router.post('/validate', async (req, res) => {
   const { code, cartTotal } = req.body;
   
   try {
      const result = await pool.query(`
         SELECT * FROM coupons 
         WHERE code = $1 AND is_active = true
      `, [code.toUpperCase()]);

      if (result.rowCount === 0) {
         return res.json({ success: false, message: 'Invalid or inactive coupon code.' });
      }

      const coupon = result.rows[0];

      // Check expiry
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
         return res.json({ success: false, message: 'This coupon has expired.' });
      }

      // Check minimum order value
      if (coupon.min_order_value && cartTotal < coupon.min_order_value) {
         return res.json({ success: false, message: `This coupon requires a minimum order of ₹${coupon.min_order_value}.` });
      }

      // Check usage limits
      if (coupon.max_usage && coupon.used_count >= coupon.max_usage) {
         return res.json({ success: false, message: 'This coupon has reached its usage limit.' });
      }

      // Valid coupon
      res.json({ 
         success: true, 
         coupon: {
            code: coupon.code,
            type: coupon.type,
            discount_percent: coupon.discount_percent,
            max_discount: coupon.max_discount
         }
      });
   } catch (err) {
      console.error('[coupon-validate] Error:', err);
      res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
   }
});

module.exports = router;
