const { Client } = require('pg');
const { encrypt } = require('./utils/encryption');

async function encryptExistingBankAccounts() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: '3616',
    port: 5432,
    database: 'local_db'
  });

  try {
    await client.connect();
    
    // Fetch all bank accounts
    const res = await client.query('SELECT bank_account_id, account_number, ifsc_code FROM bank_accounts');
    
    for (const row of res.rows) {
      // Check if it's already encrypted (i.e. contains a colon and is quite long)
      const isEncrypted = (str) => typeof str === 'string' && str.includes(':') && str.length > 30;
      
      let updated = false;
      let newAccNum = row.account_number;
      let newIfsc = row.ifsc_code;
      
      if (row.account_number && !isEncrypted(row.account_number)) {
        newAccNum = encrypt(row.account_number);
        updated = true;
      }
      
      if (row.ifsc_code && !isEncrypted(row.ifsc_code)) {
        newIfsc = encrypt(row.ifsc_code);
        updated = true;
      }
      
      if (updated) {
        await client.query(
          'UPDATE bank_accounts SET account_number = $1, ifsc_code = $2 WHERE bank_account_id = $3',
          [newAccNum, newIfsc, row.bank_account_id]
        );
        console.log(`Updated bank_account_id ${row.bank_account_id}`);
      }
    }
    
    console.log("Finished encrypting existing bank accounts.");
  } catch (err) {
    console.error("Error encrypting bank accounts:", err);
  } finally {
    await client.end();
  }
}

encryptExistingBankAccounts();
