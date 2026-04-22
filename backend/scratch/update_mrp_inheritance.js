const fs = require('fs');
const path = 'c:/Users/MAKESH/my-app/electronics-store/backend/server.js';
let content = fs.readFileSync(path, 'utf8');

// The replacement for variant insertion
// We want to useparseFloat(mrp) || parseFloat(price) || 0 for the mrp column
// and NOT use spec.mrp

const replacement = (mrpVar, priceVar) => `await client.query(
              "INSERT INTO product_variants (variant_id, product_id, sku, variant_name, variant_value, price, mrp, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
              [
                vId, 
                pId, 
                spec.sku || sku || null, 
                spec.key, 
                spec.value, 
                parseFloat(spec.price) || parseFloat(${priceVar}) || 0, 
                parseFloat(${mrpVar}) || parseFloat(${priceVar}) || 0,
                parseInt(spec.stock) || parseInt(stock) || 0
              ]
            );`;

// For POST (uses pId)
const postRegex = /await client\.query\(\s*"INSERT INTO product_variants \(variant_id, product_id, sku, variant_name, variant_value, price, mrp, stock_quantity\) VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8\)",\s*\[\s*vId,\s*pId,\s*spec\.sku \|\| sku \|\| null,\s*spec\.key,\s*spec\.value,\s*parseFloat\(spec\.price\) \|\| parseFloat\(price\) \|\| 0,\s*parseFloat\(spec\.mrp\) \|\| parseFloat\(mrp\) \|\| parseFloat\(spec\.price\) \|\| parseFloat\(price\) \|\| 0,\s*parseInt\(spec\.stock\) \|\| parseInt\(stock\) \|\| 0\s*\]\s*\);/g;

const postReplacement = (match) => {
    return `await client.query(
              "INSERT INTO product_variants (variant_id, product_id, sku, variant_name, variant_value, price, mrp, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
              [
                vId, 
                pId, 
                spec.sku || sku || null, 
                spec.key, 
                spec.value, 
                parseFloat(spec.price) || parseFloat(price) || 0, 
                parseFloat(mrp) || parseFloat(price) || 0,
                parseInt(spec.stock) || parseInt(stock) || 0
              ]
            );`;
};

// For PUT (uses product_id)
const putRegex = /await client\.query\(\s*"INSERT INTO product_variants \(variant_id, product_id, sku, variant_name, variant_value, price, mrp, stock_quantity\) VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8\)",\s*\[\s*vId,\s*product_id,\s*spec\.sku \|\| sku \|\| null,\s*spec\.key,\s*spec\.value,\s*parseFloat\(spec\.price\) \|\| parseFloat\(price\) \|\| 0,\s*parseFloat\(spec\.mrp\) \|\| parseFloat\(mrp\) \|\| parseFloat\(spec\.price\) \|\| parseFloat\(price\) \|\| 0,\s*parseInt\(spec\.stock\) \|\| parseInt\(stock\) \|\| 0\s*\]\s*\);/g;

const putReplacement = (match) => {
    return `await client.query(
              "INSERT INTO product_variants (variant_id, product_id, sku, variant_name, variant_value, price, mrp, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
              [
                vId, 
                product_id, 
                spec.sku || sku || null, 
                spec.key, 
                spec.value, 
                parseFloat(spec.price) || parseFloat(price) || 0, 
                parseFloat(mrp) || parseFloat(price) || 0,
                parseInt(spec.stock) || parseInt(stock) || 0
              ]
            );`;
};

let modified = false;
if (postRegex.test(content)) {
    content = content.replace(postRegex, postReplacement);
    modified = true;
}
if (putRegex.test(content)) {
    content = content.replace(putRegex, putReplacement);
    modified = true;
}

if (modified) {
    fs.writeFileSync(path, content);
    console.log("Successfully updated server.js to use main product MRP for variants.");
} else {
    console.log("Regex match failed for MRP inheritance update.");
}
