const pool = require('../db');

/**
 * Record an administrative action in the audit_logs table
 * @param {string} adminId 
 * @param {string} tableName 
 * @param {string} recordId 
 * @param {string} action - 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', etc.
 * @param {object} oldValues 
 * @param {object} newValues 
 * @param {object} req - Express request object for IP and User-Agent
 */
const recordAuditLog = async (adminId, tableName, recordId, action, oldValues = null, newValues = null, req = null) => {
    try {
        const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;
        const userAgent = req ? req.headers['user-agent'] : null;

        await pool.query(`
            INSERT INTO audit_logs (
                admin_id, table_name, record_id, action, old_values, new_values, ip_address, user_agent
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            adminId, 
            tableName, 
            recordId, 
            action, 
            oldValues ? JSON.stringify(oldValues) : null, 
            newValues ? JSON.stringify(newValues) : null, 
            ipAddress, 
            userAgent
        ]);
        console.log(`[AUDIT] Recorded ${action} on ${tableName} by Admin ${adminId}`);
    } catch (err) {
        console.error(`[AUDIT ERROR]:`, err.message);
    }
};

module.exports = { recordAuditLog };
