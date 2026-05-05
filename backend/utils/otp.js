const pool = require('../db');
const bcrypt = require('bcryptjs');

/**
 * Generate and store OTP
 * @param {string} userType - 'customer', 'seller', 'admin'
 * @param {string} userRefId - ID of the user
 * @param {string} contact - Email or Phone
 * @param {string} purpose - 'login', 'register', 'password_reset'
 * @returns {string} - The raw OTP
 */
const generateOTP = async (userType, userRefId, contact, purpose = 'login') => {
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes expiry

    const otpId = `OTP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await pool.query(`
        INSERT INTO otp_verifications 
        (otp_id, user_type, user_ref_id, contact, otp_hash, purpose, expires_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [otpId, userType, userRefId, contact, otpHash, purpose, expiresAt]);

    return otp;
};

/**
 * Verify OTP
 * @param {string} contact - Email or Phone
 * @param {string} otp - The raw OTP to check
 * @param {string} purpose - 'login', 'register', etc.
 * @returns {object} - { success: boolean, message: string }
 */
const verifyOTP = async (contact, otp, purpose = 'login') => {
    try {
        const res = await pool.query(`
            SELECT * FROM otp_verifications 
            WHERE contact = $1 AND purpose = $2 AND is_used = false 
            ORDER BY created_at DESC LIMIT 1
        `, [contact, purpose]);

        if (res.rows.length === 0) {
            return { success: false, message: "No active OTP found." };
        }

        const record = res.rows[0];

        // Check expiry
        if (new Date() > new Date(record.expires_at)) {
            return { success: false, message: "OTP has expired." };
        }

        // Check attempts
        if (record.attempts >= 5) {
            return { success: false, message: "Too many failed attempts. Please request a new OTP." };
        }

        // Verify hash
        const isMatch = await bcrypt.compare(otp, record.otp_hash);
        if (!isMatch) {
            await pool.query("UPDATE otp_verifications SET attempts = attempts + 1 WHERE otp_id = $1", [record.otp_id]);
            return { success: false, message: "Invalid OTP." };
        }

        // Mark as used
        await pool.query("UPDATE otp_verifications SET is_used = true WHERE otp_id = $1", [record.otp_id]);
        
        return { success: true, message: "OTP verified successfully.", userRefId: record.user_ref_id };
    } catch (err) {
        console.error("[OTP VERIFY ERROR]:", err.message);
        return { success: false, message: "Internal server error during verification." };
    }
};

module.exports = { generateOTP, verifyOTP };
