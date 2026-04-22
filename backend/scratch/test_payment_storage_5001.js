const axios = require('axios');

async function testOrderWithPayment() {
  const host = "localhost";
  const payload = {
    customerId: "CUS001",
    addressId: 1,
    cartItems: [
      { product_id: "PRD001", name: "Samsung s26 Ultra", price: 139999, quantity: 1 }
    ],
    subtotal: 139999,
    discountAmount: 0,
    platformFee: 15,
    shippingCharge: 0,
    totalAmount: 140014,
    paymentMethod: "UPI",
    transactionId: "pay_test_56789"
  };

  try {
    const res = await axios.post(`http://${host}:5001/order/place`, payload);
    console.log("Order placed successfully:", res.data);
  } catch (err) {
    console.error("Error placing order:", err.response ? err.response.data : err.message);
  }
}

testOrderWithPayment();
