const fs = require('fs');
const path = 'c:/Users/MAKESH/my-app/electronics-store/backend/server.js';
const content = fs.readFileSync(path, 'utf8').split('\n');

const startIndex = 553; // Line 554 (0-indexed is 553)
const endIndex = 660; // Line 661

const newCode = `app.post("/seller-add-product", async (req, res) => {
  console.log("--- SELLER ADD PRODUCT REQUEST ---");
  const { 
    seller_id, category_id, new_category_name, name, description, 
    price, mrp, stock, images, sku, brand, 
    weight, height, width, breadth, specifications, is_featured 
  } = req.body;

  if (!seller_id || !name) {
    return res.status(400).json({ message: "Missing required fields: seller_id or name" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let final_category_id = category_id;
    if (new_category_name && new_category_name.trim() !== "") {
      const slug = new_category_name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const catResult = await client.query(
        "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING category_id",
        [new_category_name.trim(), slug]
      );
      final_category_id = catResult.rows[0].category_id;
    }

    const maxIdResult = await client.query("SELECT product_id FROM products WHERE product_id LIKE 'PRD%' ORDER BY product_id DESC LIMIT 1");
    let nextNum = 1;
    if (maxIdResult.rows.length > 0) {
      const lastId = maxIdResult.rows[0].product_id;
      const lastNum = parseInt(lastId.replace('PRD', ''));
      nextNum = lastNum + 1;
    }
    const pId = \`PRD\${nextNum.toString().padStart(3, '0')}\`;

    const productResult = await client.query(
      \`INSERT INTO products (
        product_id, seller_id, category_id, name, description, 
        price, mrp, stock_quantity, images, sku, brand, 
        weight, height, width, breadth, is_featured, is_active
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING product_id\`,
      [
        pId, seller_id, final_category_id || null, name, description || "", 
        parseFloat(price) || 0, parseFloat(mrp) || parseFloat(price) || 0, 
        parseInt(stock) || 0, images || [], sku || null, brand || "", 
        parseFloat(weight) || 0, parseFloat(height) || 0, parseFloat(width) || 0, parseFloat(breadth) || 0, 
        is_featured || false, true
      ]
    );

    if (images && Array.isArray(images)) {
      for (const [idx, imgUrl] of images.entries()) {
        const lastImgResult = await client.query("SELECT image_id FROM product_images ORDER BY image_id DESC LIMIT 1");
        let nextImgNum = 1;
        if (lastImgResult.rows.length > 0) {
          const lastImgId = lastImgResult.rows[0].image_id;
          const match = lastImgId.match(/\\d+/);
          nextImgNum = (match ? parseInt(match[0]) : 0) + 1;
        }
        const imgId = \`IMG-\${nextImgNum.toString().padStart(3, '0')}\`;
        await client.query(
          "INSERT INTO product_images (image_id, product_id, image, sort_order) VALUES ($1, $2, $3, $4)",
          [imgId, pId, imgUrl, idx]
        );
      }
    }

    if (specifications && Array.isArray(specifications)) {
      for (const spec of specifications) {
        if (spec.key && spec.value) {
          const maxVarIdResult = await client.query("SELECT variant_id FROM product_variants ORDER BY variant_id DESC LIMIT 1");
          let nextVarNum = 1;
          if (maxVarIdResult.rows.length > 0) {
            const lastVarId = maxVarIdResult.rows[0].variant_id;
            const match = lastVarId.match(/\\d+/);
            nextVarNum = (match ? parseInt(match[0]) : 0) + 1;
          }
          const vId = \`VAR-\${nextVarNum.toString().padStart(3, '0')}\`;
          await client.query(
            "INSERT INTO product_variants (variant_id, product_id, sku, variant_name, variant_value, price, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [
              vId, pId, spec.sku || sku || null, spec.key, spec.value, 
              parseFloat(spec.price) || parseFloat(price) || 0, 
              parseInt(spec.stock) || parseInt(stock) || 0
            ]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({ message: "Product added successfully", product_id: pId });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("Backend Error in seller-add-product:", err);
    res.status(500).json({ message: "Error adding product: " + err.message });
  } finally {
    if (client) client.release();
  }
});`;

content.splice(startIndex, endIndex - startIndex + 1, newCode);
fs.writeFileSync(path, content.join('\n'));
console.log("Successfully updated seller-add-product logic.");
