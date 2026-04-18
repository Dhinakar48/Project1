const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});
async function diagnostic() {
    const client = await pool.connect();
    try {
        console.log("Checking if a test user exists...");
        let userResult = await client.query("SELECT * FROM users LIMIT 1");
        if (userResult.rowCount === 0) {
            console.log("No users found. Creating a test user...");
            await client.query("INSERT INTO users (name, email, password) VALUES ('Test User', 'test@test.com', 'pass')");
            userResult = await client.query("SELECT * FROM users LIMIT 1");
        }
        const email = userResult.rows[0].email;
        console.log(`Using email: ${email}`);

        const payload = {
            name: "Test User",
            gender: "male",
            dob: "1990-01-01",
            address: "123 Street",
            city: "Mumbai",
            state: "MH",
            pincode: "400001",
            phone: "9876543210",
            profilePicture: ""
        };

        console.log("Starting mock onboarding transaction...");
        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE users 
             SET name=$1, gender=$2, dob=$3, address=$4, city=$5, state=$6, zip=$7, phone=$8, profile_image=$9, is_verified=true
             WHERE email=$10 RETURNING id`,
            [payload.name, payload.gender, payload.dob, payload.address, payload.city, payload.state, payload.pincode, payload.phone, payload.profilePicture, email]
        );

        console.log("User update successful. Rows:", result.rowCount);
        const userId = result.rows[0].id;

        await client.query(
            `INSERT INTO addresses (owner_id, owner_type, full_name, phone, address_line1, city, state, pincode, is_default)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (owner_id, owner_type) 
             DO UPDATE SET 
                full_name = EXCLUDED.full_name,
                phone = EXCLUDED.phone,
                address_line1 = EXCLUDED.address_line1,
                city = EXCLUDED.city,
                state = EXCLUDED.state,
                pincode = EXCLUDED.pincode,
                updated_at = CURRENT_TIMESTAMP`,
            [userId, 'customer', payload.name, payload.phone, payload.address, payload.city, payload.state, payload.pincode, true]
        );
        console.log("Address insert successful.");

        await client.query('COMMIT');
        console.log("Transaction Committed Successfully ✅");

    } catch (e) {
        console.error("\n❌ ERROR DETECTED:", e.message);
        if (client) await client.query('ROLLBACK');
    } finally {
        client.release();
        pool.end();
    }
}
diagnostic();
