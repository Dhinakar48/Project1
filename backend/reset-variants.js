const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: '3616',
  port: 5432,
});

async function run() {
  try {
    const res = await pool.query("SELECT * FROM product_variants ORDER BY created_at ASC, variant_id ASC");
    const rows = res.rows;
    console.log(`Found ${rows.length} variants. Starting reset...`);

    for (let i = 0; i < rows.length; i++) {
        const newId = `VAR-${(i + 1).toString().padStart(3, '0')}`;
        const oldId = rows[i].variant_id;
        
        await pool.query("UPDATE product_variants SET variant_id = $1 WHERE variant_id = $2", [`REMAP-${newId}`, oldId]);
        console.log(`Mapped ${oldId} -> ${newId}`);
    }

    await pool.query("UPDATE product_variants SET variant_id = REPLACE(variant_id, 'REMAP-', '')");
    console.log("Successfully reset all variant IDs to start from VAR-001!");

  } catch (err) {
    console.error("Reset failed:", err);
  } finally {
    await pool.end();
  }
}
run();
