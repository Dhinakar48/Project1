const pool = require('../db');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  const email = 'dhinakar3616@gmail.com';
  const plainPassword = 'dhinakar3616';
  
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const result = await pool.query(
      "UPDATE sellers SET password = $1 WHERE email = $2 RETURNING seller_id",
      [hashedPassword, email]
    );
    
    if (result.rowCount > 0) {
      console.log(`✅ Password updated for ${email} (ID: ${result.rows[0].seller_id})`);
    } else {
      console.log(`❌ Seller with email ${email} not found.`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

updatePassword();
