import React from "react";
import emailjs from "emailjs-com";

export default function Payment() {

    // ✅ Send Email
    const sendOrderEmail = async (order) => {
        try {
            const res = await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    user_name: order.name,
                    user_email: order.email,
                    product_name: order.product,
                    amount: order.amount,
                },
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            console.log("Email Sent ✅", res);
            alert("Order Email Sent 📧");
        } catch (err) {
            console.error("Email Error ❌", err);
            alert("Email Failed ❌");
        }
    };

    // ✅ Razorpay Payment
    const handlePayment = () => {

        // 🔥 CHECK: Razorpay loaded or not
        if (!window.Razorpay) {
            alert("Razorpay SDK not loaded ❌");
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: 50000, // ₹500
            currency: "INR",
            name: "My Store",
            description: "Order Payment",

            handler: async function (response) {
                console.log("Payment Response:", response);
                alert("Payment Successful ✅");

                const order = {
                    name: "Dhinakar",
                    email: "dhinakargmd@gmail.com",
                    product: "iPhone 13",
                    amount: 500,
                };

                // 👉 Wait for email send
                await sendOrderEmail(order);
            },

            prefill: {
                name: "Dhinakar",
                email: "dhinakargmd@gmail.com",
            },

            theme: {
                color: "#3399cc",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <button
                onClick={handlePayment}
                className="bg-green-500 text-white px-6 py-3 rounded-lg"
            >
                Pay Now
            </button>
        </div>
    );
}