const pool = require('../db');
async function check() {
  try {
    const res = await pool.query("SELECT review_id, product_id, image_url FROM reviews ORDER BY created_at DESC LIMIT 5");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
check();
