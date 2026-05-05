const pool = require('../db');

async function fixAuditConstraints() {
    try {
        // Drop the FK constraint so we can log 'System' or other non-admin actions if needed
        await pool.query('ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_admin_id_fkey');
        console.log('✅ Audit logs constraint relaxed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

fixAuditConstraints();
