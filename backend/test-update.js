const { Client } = require('pg');

async function testUpdate() {
  const client = new Client({
    user: 'postgres', host: 'localhost', password: '3616', port: 5432, database: 'local_db'
  });
  try {
    await client.connect();
    console.log("Attempting manual update of PRD001...");
    const res = await client.query(
      "UPDATE products SET name = 'Samsung s26 Ultra UPDATED' WHERE product_id = 'PRD001' RETURNING *;"
    );
    console.log("Updated rows:", res.rowCount);
    if (res.rowCount > 0) {
      console.log("New name:", res.rows[0].name);
    }
  } finally {
    await client.end();
  }
}
testUpdate();
