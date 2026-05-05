const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get("/cart/:customerId", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ci.*, p.name, p.price as base_price, p.mrp as base_mrp, p.images, p.brand, p.discount, 
             pv.price as variant_price, pv.mrp as variant_mrp, pv.variant_name, pv.variant_value
      FROM cart_items ci 
      JOIN carts c ON ci.cart_id = c.cart_id 
      LEFT JOIN products p ON ci.product_id = p.product_id 
      LEFT JOIN product_variants pv ON ci.variant_id = pv.variant_id
      WHERE c.customer_id = $1 ORDER BY ci.added_at ASC
    `, [req.params.customerId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Fetch cart error" }); }
});

router.post("/cart/add", async (req, res) => {
  let { customerId, productId, quantity, variantId } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Find or Create Cart
    let cartRes = await client.query("SELECT cart_id FROM carts WHERE customer_id = $1", [customerId]);
    let cartId;
    if (cartRes.rows.length === 0) {
      const maxCart = await client.query("SELECT cart_id FROM carts ORDER BY cart_id DESC LIMIT 1");
      let nextCartNum = 1;
      if (maxCart.rows.length > 0) {
        nextCartNum = (parseInt(maxCart.rows[0].cart_id.replace('CRT-', '')) || 0) + 1;
      }
      cartId = `CRT-${nextCartNum.toString().padStart(3, '0')}`;
      await client.query("INSERT INTO carts (cart_id, customer_id) VALUES ($1, $2)", [cartId, customerId]);
    } else { 
      cartId = cartRes.rows[0].cart_id; 
    }

    // Check if item exists in cart
    const check = await client.query(
      "SELECT * FROM cart_items WHERE cart_id=$1 AND product_id=$2 AND (variant_id IS NOT DISTINCT FROM $3)", 
      [cartId, productId, variantId || null]
    );

    if (check.rows.length > 0) {
      await client.query("UPDATE cart_items SET quantity=quantity+$1, updated_at=CURRENT_TIMESTAMP WHERE cart_item_id=$2", [quantity || 1, check.rows[0].cart_item_id]);
    } else {
      // Fix: Sequential cart_item_id
      const maxItem = await client.query("SELECT cart_item_id FROM cart_items ORDER BY cart_item_id DESC LIMIT 1");
      let nextItemNum = 1;
      if (maxItem.rows.length > 0) {
        nextItemNum = (parseInt(maxItem.rows[0].cart_item_id.replace('CRT-IT-', '')) || 0) + 1;
      }
      const itemId = `CRT-IT-${nextItemNum.toString().padStart(4, '0')}`;
      
      await client.query(
        "INSERT INTO cart_items (cart_item_id, cart_id, product_id, variant_id, quantity) VALUES ($1, $2, $3, $4, $5)", 
        [itemId, cartId, productId, variantId || null, quantity || 1]
      );
    }
    
    await client.query('COMMIT'); 
    res.json({ success: true });
  } catch (err) { 
    await client.query('ROLLBACK'); 
    console.error("Add to Cart Error:", err);
    res.status(500).json({ message: err.message }); 
  }
  finally { client.release(); }
});

router.post("/cart/update", async (req, res) => {
  let { customerId, productId, quantity, variantId } = req.body;
  try {
    await pool.query(
      "UPDATE cart_items ci SET quantity = $4, updated_at = CURRENT_TIMESTAMP FROM carts c WHERE ci.cart_id = c.cart_id AND c.customer_id = $1 AND ci.product_id = $2 AND (ci.variant_id IS NOT DISTINCT FROM $3)", 
      [customerId, productId, variantId || null, quantity]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: "Update error" }); }
});

router.post("/cart/remove", async (req, res) => {
  let { customerId, productId, variantId } = req.body;
  try {
    await pool.query(
      "DELETE FROM cart_items ci USING carts c WHERE ci.cart_id = c.cart_id AND c.customer_id = $1 AND ci.product_id = $2 AND (ci.variant_id IS NOT DISTINCT FROM $3)", 
      [customerId, productId, variantId || null]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: "Remove error" }); }
});

router.post("/wishlist/toggle", async (req, res) => {
  const { customerId, productId } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let wRes = await client.query("SELECT wishlist_id FROM wishlists WHERE customer_id=$1", [customerId]);
    let wId;
    if (wRes.rows.length === 0) {
      const maxW = await client.query("SELECT wishlist_id FROM wishlists ORDER BY wishlist_id DESC LIMIT 1");
      let nextWNum = 1;
      if (maxW.rows.length > 0) {
        nextWNum = (parseInt(maxW.rows[0].wishlist_id.replace('WIS-', '')) || 0) + 1;
      }
      wId = `WIS-${nextWNum.toString().padStart(3, '0')}`;
      await client.query("INSERT INTO wishlists (wishlist_id, customer_id) VALUES ($1, $2)", [wId, customerId]);
    } else { wId = wRes.rows[0].wishlist_id; }
    
    const check = await client.query("SELECT * FROM wishlist_items WHERE wishlist_id=$1 AND product_id=$2", [wId, productId]);
    if (check.rows.length > 0) {
      await client.query("DELETE FROM wishlist_items WHERE wishlist_id=$1 AND product_id=$2", [wId, productId]);
      await client.query('COMMIT'); return res.json({ status: 'removed' });
    } else {
      const maxIt = await client.query("SELECT wishlist_item_id FROM wishlist_items ORDER BY wishlist_item_id DESC LIMIT 1");
      let nextItNum = 1;
      if (maxIt.rows.length > 0) {
        nextItNum = (parseInt(maxIt.rows[0].wishlist_item_id.replace('WIS-IT-', '')) || 0) + 1;
      }
      const itId = `WIS-IT-${nextItNum.toString().padStart(4, '0')}`;
      await client.query("INSERT INTO wishlist_items (wishlist_item_id, wishlist_id, product_id) VALUES ($1, $2, $3)", [itId, wId, productId]);
      await client.query('COMMIT'); return res.json({ status: 'added' });
    }
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ message: err.message }); }
  finally { client.release(); }
});

router.get("/wishlist/:customerId", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT wi.*, p.name, p.price, p.mrp, p.images, p.brand, p.discount
      FROM wishlist_items wi 
      JOIN wishlists w ON wi.wishlist_id = w.wishlist_id 
      LEFT JOIN products p ON wi.product_id = p.product_id 
      WHERE w.customer_id = $1
    `, [req.params.customerId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: "Fetch wishlist error" }); }
});

module.exports = router;
