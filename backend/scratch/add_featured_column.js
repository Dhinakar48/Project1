const { Client } = require('pg');
const client = new Client({
  user: 'postgres', host: 'localhost', database: 'local_db', password: '3616', port: 5432,
});
async function run() {
  await client.connect();
  try {
    // Check if column exists
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'is_featured';
    `);
    
    if (res.rows.length === 0) {
      console.log("Adding is_featured column to products table...");
      await client.query("ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;");
      console.log("Column added successfully.");
    } else {
      console.log("Column is_featured already exists.");
    }
  } catch (e) {
    console.error(e);
  }
  await client.end();
}
run();
