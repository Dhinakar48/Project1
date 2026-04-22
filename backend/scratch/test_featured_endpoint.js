const axios = require('axios');

async function testFetch() {
  try {
    const res = await axios.get('http://localhost:5000/featured-products');
    console.log('Response from /featured-products:', res.data);
  } catch (err) {
    console.error('Error fetching /featured-products:', err.message);
  }
}

testFetch();
