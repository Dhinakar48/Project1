const fs = require('fs');
const path = 'c:/Users/MAKESH/my-app/electronics-store/backend/server.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /await client\.query\(\s*"INSERT INTO product_variants \(variant_id, product_id, sku, variant_name, variant_value, price, stock_quantity\) VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7\)",\s*\[vId, product_id, sku \|\| null, spec\.key, spec\.value, spec\.price \|\| price, spec\.stock \|\| stock\]\s*\);/g;

const replacement = `await client.query(
              "INSERT INTO product_variants (variant_id, product_id, sku, variant_name, variant_value, price, mrp, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
              [
                vId, 
                product_id, 
                spec.sku || sku || null, 
                spec.key, 
                spec.value, 
                parseFloat(spec.price) || parseFloat(price) || 0, 
                parseFloat(spec.mrp) || parseFloat(mrp) || parseFloat(spec.price) || parseFloat(price) || 0,
                parseInt(spec.stock) || parseInt(stock) || 0
              ]
            );`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
    console.log("Successfully updated server.js using regex.");
} else {
    console.log("Regex match failed. Dumping snippet for comparison:");
}
