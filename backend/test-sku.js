const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/seller-add-product', {
      seller_id: 'SEL001',
      category_id: 1,
      name: 'Test SKU Product',
      description: 'Testing if SKU is saved',
      price: 100,
      mrp: 120,
      stock: 10,
      images: [],
      sku: 'TEST-SKU-123',
      brand: 'TestBrand',
      weight: 100,
      height: 10,
      length: 10,
      breadth: 10
    });
    console.log("Response:", res.data);
    
    const check = await axios.get(`http://localhost:5000/product/${res.data.product_id}`);
    console.log("Saved Product SKU:", check.data.sku);
    
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}

test();
