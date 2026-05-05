const express = require('express');
const router = express.Router();
const { generateOTP, verifyOTP } = require('../utils/otp');
const pool = require('../db');

// Request OTP (Send to Email)
router.post('/request', async (req, res) => {
    const { contact, type, purpose } = req.body; // type: 'customer', 'seller', 'admin'
    
    try {
        // Check if user exists
        let userRes;
        if (type === 'customer') {
            userRes = await pool.query("SELECT customer_id FROM customers WHERE email = $1", [contact]);
        } else if (type === 'seller') {
            userRes = await pool.query("SELECT seller_id FROM sellers WHERE email = $1", [contact]);
        } else if (type === 'admin') {
            userRes = await pool.query("SELECT admin_id FROM admins WHERE email = $1", [contact]);
        }

        if (!userRes || userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No user found with this contact." });
        }

        const userId = userRes.rows[0].customer_id || userRes.rows[0].seller_id || userRes.rows[0].admin_id;
        const otp = await generateOTP(type, userId, contact, purpose || 'login');

        // Log OTP in console (since we don't have a real mailer yet)
        console.log(`[OTP SENT] To: ${contact} | OTP: ${otp} | Purpose: ${purpose || 'login'}`);

        res.json({ success: true, message: "OTP sent successfully to your contact." });
    } catch (err) {
        console.error("[OTP REQUEST ROUTE ERROR]:", err.message);
        res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
});

// Record Successful Verification (e.g. from Firebase)
router.post('/record-verification', async (req, res) => {
    const { contact, type, userId, purpose } = req.body;
    
    try {
        const otpId = `FB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        await pool.query(`
            INSERT INTO otp_verifications 
            (otp_id, user_type, user_ref_id, contact, otp_hash, purpose, is_used, expires_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            otpId, 
            type || 'customer', 
            userId || 'GUEST', 
            contact, 
            'FIREBASE_VERIFIED', 
            purpose || 'login', 
            true, // Mark as used immediately
            new Date() // Expired now since it's already used
        ]);

        console.log(`[OTP RECORDED] Firebase verification for ${contact} stored.`);
        res.json({ success: true, message: "Verification recorded in database." });
    } catch (err) {
        console.error("[OTP RECORD ROUTE ERROR]:", err.message);
        res.status(500).json({ success: false, message: "Failed to record verification." });
    }
});

module.exports = router;
