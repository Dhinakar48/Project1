const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get All Products
router.get("/products", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, p.images[1] as main_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.deleted_at IS NULL
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Get Featured Products
router.get("/featured-products", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, p.images[1] as main_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.deleted_at IS NULL AND p.is_featured = true
       ORDER BY p.created_at DESC
       LIMIT 6`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching featured products" });
  }
});

// Get Products by Category
router.get("/products/category/:categoryName", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, p.images[1] as main_image
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       WHERE (LOWER(c.name) = LOWER($1) OR LOWER(c.slug) = LOWER($1)) AND p.deleted_at IS NULL
       ORDER BY p.created_at DESC`,
      [req.params.categoryName]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching category products" });
  }
});

// Get Single Product Details
router.get("/product/:id", async (req, res) => {
  try {
    const productResult = await pool.query(
      `SELECT p.*, c.name as category_name, s.store_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN sellers s ON p.seller_id = s.seller_id
       WHERE p.product_id = $1 AND p.deleted_at IS NULL`,
      [req.params.id]
    );
    if (productResult.rows.length === 0) return res.status(404).json({ message: "Product not found" });

    const imagesResult = await pool.query("SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC", [req.params.id]);
    const variantsResult = await pool.query(
      "SELECT variant_id, variant_name as key, variant_value as value, price, mrp, stock_quantity as stock, sku FROM product_variants WHERE product_id = $1 ORDER BY variant_id ASC",
      [req.params.id]
    );

    res.json({
      ...productResult.rows[0],
      gallery: imagesResult.rows,
      specifications: variantsResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching product details" });
  }
});

// Get Seller Products
router.get("/seller-products/:seller_id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, p.images[1] as main_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.seller_id = $1 AND p.deleted_at IS NULL AND p.product_id LIKE 'PRD%'
       ORDER BY p.created_at DESC`,
      [req.params.seller_id]
    );
    console.log(`[seller-products] Found ${result.rows.length} PRD products for ${req.params.seller_id}`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching seller products" });
  }
});

// Seller Add Product
router.post("/seller-add-product", async (req, res) => {
  const { 
    seller_id, category_id, new_category_name, name, description, 
    price, mrp, stock, images, sku, brand, 
    weight, height, width, breadth, specifications, is_featured 
  } = req.body;

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
      const lastNum = parseInt(lastId.replace('PRD', '')) || 0;
      nextNum = lastNum + 1;
    }
    const pId = `PRD${nextNum.toString().padStart(3, '0')}`;

    await client.query(
      `INSERT INTO products (
        product_id, seller_id, category_id, name, description, 
        price, mrp, stock_quantity, images, sku, brand, 
        weight, height, width, breadth, is_featured, is_active, specifications
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        pId, seller_id, final_category_id || null, name, description || "", 
        parseFloat(price) || 0, parseFloat(mrp) || parseFloat(price) || 0, 
        parseInt(stock) || 0, images || [], sku || null, brand || "", 
        parseFloat(weight) || 0, parseFloat(height) || 0, parseFloat(width) || 0, parseFloat(breadth) || 0, 
        is_featured || false, true, JSON.stringify(specifications || [])
      ]
    );

    if (images && Array.isArray(images)) {
      for (const [idx, imgUrl] of images.entries()) {
        const lastImgRes = await client.query("SELECT image_id FROM product_images ORDER BY image_id DESC LIMIT 1");
        const nextImgNum = (lastImgRes.rows.length ? (parseInt(lastImgRes.rows[0].image_id.split('-')[1]) || 0) : 0) + 1;
        const imgId = `IMG-${nextImgNum.toString().padStart(3, '0')}`;
        await client.query("INSERT INTO product_images (image_id, product_id, image, sort_order) VALUES ($1, $2, $3, $4)", [imgId, pId, imgUrl, idx]);
      }
    }

    if (specifications && Array.isArray(specifications)) {
      for (const spec of specifications) {
        if (spec.key && spec.value) {
          const maxVarRes = await client.query("SELECT variant_id FROM product_variants ORDER BY variant_id DESC LIMIT 1");
          const nextVarNum = (maxVarRes.rows.length ? (parseInt(maxVarRes.rows[0].variant_id.split('-')[1]) || 0) : 0) + 1;
          const vId = `VAR-${nextVarNum.toString().padStart(3, '0')}`;
          await client.query(
            "INSERT INTO product_variants (variant_id, product_id, sku, variant_name, variant_value, price, mrp, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            [vId, pId, spec.sku || sku || null, spec.key, spec.value, parseFloat(spec.price) || parseFloat(price) || 0, parseFloat(spec.mrp) || parseFloat(mrp) || parseFloat(price) || 0, parseInt(spec.stock) || parseInt(stock) || 0]
          );
        }
      }
    }

    // ✅ FIX: Shorten notification_id (max 20)
    const adminNotifId = `NP${pId.replace('PRD', '')}${Date.now().toString(36)}`;
    await client.query(
      "INSERT INTO notifications (notification_id, type, message) VALUES ($1, $2, $3)",
      [adminNotifId.substring(0, 20), 'New Product', `Merchant added a new asset: ${name} (ID: ${pId})`]
    );

    await client.query('COMMIT');
    res.json({ message: "Product added successfully", product_id: pId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: "Error adding product: " + err.message });
  } finally {
    client.release();
  }
});

// Seller Update Product
router.put("/seller-update-product/:id", async (req, res) => {
  const { id: product_id } = req.params;
  const { 
    category_id, new_category_name, name, description, 
    price, mrp, stock, images, sku, brand, 
    weight, height, width, breadth, is_active, specifications, is_featured
  } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let final_category_id = category_id;
    if (new_category_name && new_category_name.trim() !== "") {
      const slug = new_category_name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const catRes = await client.query(
        "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING category_id",
        [new_category_name.trim(), slug]
      );
      final_category_id = catRes.rows[0].category_id;
    }

    await client.query(
      `UPDATE products SET 
       category_id = $1, name = $2, description = $3, price = $4, mrp = $5, 
       stock_quantity = $6, images = $7, sku = $8, brand = $9, 
       weight = $10, height = $11, width = $12, breadth = $13, 
       is_active = $14, is_featured = $15, specifications = $16, updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $17`,
      [
        final_category_id, name, description, parseFloat(price), parseFloat(mrp), 
        parseInt(stock), images, sku || null, brand, 
        parseFloat(weight), parseFloat(height), parseFloat(width), parseFloat(breadth), 
        is_active !== undefined ? is_active : true, 
        is_featured !== undefined ? is_featured : false,
        JSON.stringify(specifications || []),
        product_id
      ]
    );

    await client.query("DELETE FROM product_images WHERE product_id = $1", [product_id]);
    if (images && Array.isArray(images)) {
      for (const [idx, imgUrl] of images.entries()) {
        const lastImgRes = await client.query("SELECT image_id FROM product_images ORDER BY image_id DESC LIMIT 1");
        const nextImgNum = (lastImgRes.rows.length ? (parseInt(lastImgRes.rows[0].image_id.split('-')[1]) || 0) : 0) + 1;
        const imgId = `IMG-${nextImgNum.toString().padStart(3, '0')}`;
        await client.query("INSERT INTO product_images (image_id, product_id, image, sort_order) VALUES ($1, $2, $3, $4)", [imgId, product_id, imgUrl, idx]);
      }
    }

    await client.query("DELETE FROM product_variants WHERE product_id = $1", [product_id]);
    if (specifications && Array.isArray(specifications)) {
      for (const spec of specifications) {
        if (spec.key && spec.value) {
          const maxVarRes = await client.query("SELECT variant_id FROM product_variants ORDER BY variant_id DESC LIMIT 1");
          const nextVarNum = (maxVarRes.rows.length ? (parseInt(maxVarRes.rows[0].variant_id.split('-')[1]) || 0) : 0) + 1;
          const vId = `VAR-${nextVarNum.toString().padStart(3, '0')}`;
          await client.query(
            "INSERT INTO product_variants (variant_id, product_id, sku, variant_name, variant_value, price, mrp, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            [vId, product_id, spec.sku || sku || null, spec.key, spec.value, parseFloat(spec.price) || parseFloat(price) || 0, parseFloat(spec.mrp) || parseFloat(mrp) || parseFloat(price) || 0, parseInt(spec.stock) || parseInt(stock) || 0]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: "Error updating product" });
  } finally {
    client.release();
  }
});

// Delete Product
router.delete("/seller-delete-product/:product_id", async (req, res) => {
  try {
    await pool.query("UPDATE products SET deleted_at = CURRENT_TIMESTAMP, is_active = false WHERE product_id = $1", [req.params.product_id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting product" });
  }
});

module.exports = router;
