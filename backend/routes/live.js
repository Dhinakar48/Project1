const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all active live sessions
router.get('/admin/live-sessions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.session_id, s.user_ref_id as user_id, s.user_type, s.ip_address, s.device_info as user_agent, s.created_at as login_at,
                   COALESCE(c.name, sel.full_name, adm.name) as user_name,
                   COALESCE(c.email, sel.email, adm.email) as user_email,
                   COALESCE(c.profile_image, sel.store_logo_url) as user_image
            FROM auth_sessions s
            LEFT JOIN customers c ON s.user_ref_id = c.customer_id AND s.user_type = 'customer'
            LEFT JOIN sellers sel ON s.user_ref_id = sel.seller_id AND s.user_type = 'seller'
            LEFT JOIN admins adm ON s.user_ref_id = adm.admin_id AND s.user_type = 'admin'
            WHERE s.is_blacklisted = false
            ORDER BY s.created_at DESC
        `);
        res.json({ success: true, sessions: result.rows });
    } catch (err) {
        console.error('[live-sessions] Error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch live sessions' });
    }
});

// Terminate a session (by Admin)
router.post('/admin/terminate-session', async (req, res) => {
    const { sessionId } = req.body;
    try {
        await pool.query("UPDATE auth_sessions SET is_blacklisted = true WHERE session_id = $1", [sessionId]);
        res.json({ success: true, message: 'Session terminated successfully.' });
    } catch (err) {
        console.error('[terminate-session] Error:', err);
        res.status(500).json({ success: false });
    }
});

// Logout (by User)
router.post('/logout', async (req, res) => {
    const { userId, userType } = req.body;
    try {
        await pool.query(
            "UPDATE auth_sessions SET is_blacklisted = true WHERE user_ref_id = $1 AND user_type = $2 AND is_blacklisted = false",
            [userId, userType]
        );
        res.json({ success: true, message: 'Logged out successfully.' });
    } catch (err) {
        console.error('[logout] Error:', err);
        res.status(500).json({ success: false });
    }
});

// Helper function to record a session
async function recordSession(userId, userType, req) {
    console.log(`[SESSION-DEBUG] Recording session for ${userId} (${userType})`);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    try {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

        await pool.query(
            `INSERT INTO auth_sessions (user_ref_id, user_type, ip_address, device_info, is_blacklisted, token_hash, expires_at)
             VALUES ($1, $2, $3, $4, false, $5, $6)`,
            [userId, userType, ip, ua, 'live_session_active', expiresAt]
        );
    } catch (err) {
        console.error('[record-session] Error:', err);
    }
}

module.exports = { router, recordSession };
