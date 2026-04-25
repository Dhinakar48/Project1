const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function hashAdminPasswords() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: '3616',
    port: 5432,
    database: 'local_db'
  });

  try {
    await client.connect();
    
    // Fetch all admins
    const res = await client.query('SELECT admin_id, password_hash FROM admins');
    
    for (const row of res.rows) {
      // Check if it is not a bcrypt hash (bcrypt hashes usually start with $2a$, $2b$, or $2y$ and are 60 chars long)
      if (!row.password_hash.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(row.password_hash, 10);
        await client.query(
          'UPDATE admins SET password_hash = $1 WHERE admin_id = $2',
          [hashedPassword, row.admin_id]
        );
        console.log(`Hashed password for admin_id ${row.admin_id}`);
      }
    }
    
    console.log("Finished hashing admin passwords.");
  } catch (err) {
    console.error("Error hashing admin passwords:", err);
  } finally {
    await client.end();
  }
}

hashAdminPasswords();
