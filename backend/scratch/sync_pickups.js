const pool = require('../db');

async function syncAllPickups() {
    try {
        console.log('🔄 Starting full sync from addresses to seller_pickup_locations...');
        
        const res = await pool.query(`
            SELECT a.*, s.full_name as seller_name, s.phone as seller_phone
            FROM addresses a
            LEFT JOIN sellers s ON a.seller_id = s.seller_id
            WHERE a.seller_id IS NOT NULL OR a.customer_id IS NULL -- Potential admin too
        `);

        console.log(`Found ${res.rows.length} relevant addresses.`);

        for (const addr of res.rows) {
            console.log(`Syncing for Seller ID: ${addr.seller_id || 'Admin'}`);
            
            await pool.query(`
                INSERT INTO seller_pickup_locations (
                    seller_id, location_name, contact_name, contact_phone, 
                    address_line_1, address_line_2, city, state, pincode, is_default
                ) VALUES ($1, 'Primary', $2, $3, $4, $5, $6, $7, $8, true)
                ON CONFLICT (seller_id) WHERE is_default = true DO UPDATE SET
                    contact_name = EXCLUDED.contact_name,
                    contact_phone = EXCLUDED.contact_phone,
                    address_line_1 = EXCLUDED.address_line_1,
                    address_line_2 = EXCLUDED.address_line_2,
                    city = EXCLUDED.city,
                    state = EXCLUDED.state,
                    pincode = EXCLUDED.pincode,
                    updated_at = NOW()
            `, [
                addr.seller_id, 
                addr.full_name || addr.seller_name || 'Admin', 
                addr.phone || addr.seller_phone || '9876543210',
                addr.address1,
                addr.address2,
                addr.city,
                addr.state,
                addr.pincode
            ]);
        }

        console.log('✅ All pickup locations synced successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync Failed:', err.message);
        process.exit(1);
    }
}

syncAllPickups();
