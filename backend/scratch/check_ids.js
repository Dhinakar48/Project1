const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "3616",
  port: 5432,
});

async function checkSequence() {
  try {
    const res = await pool.query("SELECT pg_get_serial_sequence('product_images', 'image_id') as seq");
    const seq = res.rows[0].seq;
    const res2 = await pool.query(`SELECT last_value, is_called FROM ${seq}`);
    console.log(`Sequence ${seq} status:`);
    console.table(res2.rows);

    const productCount = await pool.query("SELECT count(*) FROM products");
    const imageCount = await pool.query("SELECT count(*) FROM product_images");
    console.log(`Product count: ${productCount.rows[0].count}`);
    console.log(`Image count: ${imageCount.rows[0].count}`);
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit();
  }
}

checkSequence();
