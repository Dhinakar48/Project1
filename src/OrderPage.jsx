import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCircleCheck, FaArrowLeftLong, FaUser, FaLocationDot, FaLock, FaEnvelope, FaPhone, FaCreditCard, FaCcVisa, FaCcMastercard, FaCcApplePay, FaMobileScreenButton, FaMoneyBills, FaBuildingColumns, FaWallet } from 'react-icons/fa6';
import emailjs from '@emailjs/browser';
import { useStore } from './StoreContext';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function OrderPage() {
  const navigate = useNavigate();
  const { cart, clearCart, finalTotal, appliedDiscount, subtotal, discountAmount, applyDiscountCode, removeDiscount } = useStore();
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: '', paymentMethod: 'card'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinuePayment = () => {
    const form = document.getElementById('checkout-form');
    if (form && form.checkValidity()) {
      setShowPaymentOptions(true);
    } else {
      form?.reportValidity();
    }
  };

  const shippingFee = appliedDiscount?.type === 'shipping' ? 0 : 150;
  const gstAmount = Math.round(finalTotal * 0.06);
  const codFee = formData.paymentMethod === 'cod' ? 50 : 0;
  const totalPayable = finalTotal + shippingFee + gstAmount + codFee;

  const finalizeOrder = async (paymentId = 'COD') => {
    const productNames = cart.map((item) => `${item.name} (x${item.quantity})`).join(', ');

    const templateParams = {
      to_email: 'dhinakargmd@gmail.com', // Strict routing to site owner
      user_name: formData.name,
      user_email: formData.email,
      products: productNames,
      total_amount: `₹${totalPayable.toLocaleString()}`,
      payment_method: formData.paymentMethod.toUpperCase(),
      payment_id: paymentId,
      shipping_address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zip}, ${formData.country}`
    };

    // Using hardcoded keys as fallbacks because the Vite server was not restarted
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_k11zocm';
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_wz44bjr';
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'lqlnFNDxsieXbjeNn';

    try {
      const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      console.log('EMAIL SENT SUCCESSFULLY!', response.status, response.text);
    } catch (err) {
      console.error('FAILED TO SEND EMAIL:', err);
      alert(`EmailJS Error: ${err?.text || err?.message}`);
    }

    clearCart();
    setIsProcessing(false);
    setIsOrderPlaced(true);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Your cart is empty! Cannot proceed to checkout.");
      return;
    }
    setIsProcessing(true);

    try {
      if (formData.paymentMethod !== 'cod') {
        const res = await loadRazorpayScript();
        if (!res) {
          alert('Razorpay SDK failed to load. Are you online?');
          setIsProcessing(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ScsgT2nkDnp7s8', 
          amount: totalPayable * 100, // paise
          currency: 'INR',
          name: 'Electronics Store',
          description: 'Order Payment',
          config: {
            display: {
              blocks: {
                preferred: {
                  name: "All Payment Methods",
                  instruments: [
                    { method: "card" },
                    { method: "upi" },
                    { method: "netbanking" },
                    { method: "wallet" }
                  ],
                },
              },
              sequence: ["block.preferred"],
              preferences: {
                show_default_blocks: true,
              },
            },
          },
          handler: function (response) {
            finalizeOrder(response.razorpay_payment_id).catch(err => {
              alert(`Critical handler execution error: ${err.message}`);
              setIsProcessing(false);
            });
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: '#d97706' // amber-600
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
          alert(`Payment Error: ${response.error.description || 'Transaction Failed.'}`);
          setIsProcessing(false);
        });
        paymentObject.open();
      } else {
        // Cash on Delivery
        await finalizeOrder('COD');
      }
    } catch (err) {
      alert(`Checkout Boot Error: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleApplyPromo = () => {
    if(!promoCode) return;
    const res = applyDiscountCode(promoCode, cart.length);
    setPromoMessage(res.message);
    if(res.success) setPromoCode('');
    setTimeout(() => setPromoMessage(''), 3000);
  };

  return (
    <div className={`min-h-screen bg-white text-stone-900 overflow-hidden ${!isOrderPlaced ? 'py-12 px-6 md:px-16 lg:px-24' : 'flex items-center justify-center p-6 relative'}`}>
      
      {/* Background Decor only on success page */}
      {isOrderPlaced && (
        <>
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      <AnimatePresence mode="wait">
        {!isOrderPlaced ? (
          <motion.div
            key="checkout-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto w-full"
          >
            <button
              type="button" 
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition mb-10 group"
            >
              <FaArrowLeftLong className="group-hover:-translate-x-1 transition" />
              <span className="font-medium tracking-wide">Back to Cart</span>
            </button>

            <h1 className="text-3xl md:text-5xl font-black mb-12 tracking-tighter">Order Details</h1>

            <form id="checkout-form" onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-5 gap-16">
              <div className="lg:col-span-3 space-y-12">
                {/* Contact Info */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-stone-900 border-b border-stone-200 pb-3">1. Contact Information</h3>
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-colors"><FaUser size={14} /></div>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 pl-12 pr-4 outline-none border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-colors"><FaEnvelope size={14} /></div>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email Address" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 pl-12 pr-4 outline-none border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                      </div>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-colors"><FaPhone size={14} /></div>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone Number" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 pl-12 pr-4 outline-none border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-stone-900 border-b border-stone-200 pb-3">2. Shipping Details</h3>
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-colors"><FaLocationDot size={14} /></div>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Street Address" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 pl-12 pr-4 outline-none border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="City" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 px-5 outline-none border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                      <input type="text" name="state" value={formData.state} onChange={handleChange} required placeholder="State" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 px-5 outline-none border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="zip" value={formData.zip} onChange={handleChange} required placeholder="ZIP Code" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 px-5 outline-none border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                      <input type="text" name="country" value={formData.country} onChange={handleChange} required placeholder="Country" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 px-5 outline-none border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                    </div>
                  </div>
                </div>

                {/* Payment Method Section */}
                {showPaymentOptions && (
                  <div className="space-y-6 pt-6 border-t border-stone-200">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-stone-900 pb-3">3. Payment Method</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <label className={`relative border p-3 rounded-2xl cursor-pointer transition-all flex flex-col justify-center items-center h-24 ${formData.paymentMethod === 'card' ? 'border-amber-600 bg-amber-50 shadow-md ring-1 ring-amber-600' : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'}`}>
                        <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} className="sr-only" />
                        <div className="flex flex-col gap-2 items-center text-center">
                          <FaCreditCard size={20} className={formData.paymentMethod === 'card' ? 'text-amber-600' : 'text-stone-400'} />
                          <span className={`text-[10px] uppercase tracking-widest font-bold ${formData.paymentMethod === 'card' ? 'text-amber-900' : 'text-stone-600'}`}>Card</span>
                        </div>
                      </label>
                      <label className={`relative border p-3 rounded-2xl cursor-pointer transition-all flex flex-col justify-center items-center h-24 ${formData.paymentMethod === 'upi' ? 'border-amber-600 bg-amber-50 shadow-md ring-1 ring-amber-600' : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'}`}>
                        <input type="radio" name="paymentMethod" value="upi" checked={formData.paymentMethod === 'upi'} onChange={handleChange} className="sr-only" />
                        <div className="flex flex-col gap-2 items-center text-center">
                          <FaMobileScreenButton size={20} className={formData.paymentMethod === 'upi' ? 'text-amber-600' : 'text-stone-400'} />
                          <span className={`text-[10px] uppercase tracking-widest font-bold ${formData.paymentMethod === 'upi' ? 'text-amber-900' : 'text-stone-600'}`}>UPI</span>
                        </div>
                      </label>
                      <label className={`relative border p-3 rounded-2xl cursor-pointer transition-all flex flex-col justify-center items-center h-24 ${formData.paymentMethod === 'netbanking' ? 'border-amber-600 bg-amber-50 shadow-md ring-1 ring-amber-600' : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'}`}>
                        <input type="radio" name="paymentMethod" value="netbanking" checked={formData.paymentMethod === 'netbanking'} onChange={handleChange} className="sr-only" />
                        <div className="flex flex-col gap-2 items-center text-center">
                          <FaBuildingColumns size={20} className={formData.paymentMethod === 'netbanking' ? 'text-amber-600' : 'text-stone-400'} />
                          <span className={`text-[10px] uppercase tracking-widest font-bold ${formData.paymentMethod === 'netbanking' ? 'text-amber-900' : 'text-stone-600'}`}>Net Banking</span>
                        </div>
                      </label>
                      <label className={`relative border p-3 rounded-2xl cursor-pointer transition-all flex flex-col justify-center items-center h-24 ${formData.paymentMethod === 'wallet' ? 'border-amber-600 bg-amber-50 shadow-md ring-1 ring-amber-600' : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'}`}>
                        <input type="radio" name="paymentMethod" value="wallet" checked={formData.paymentMethod === 'wallet'} onChange={handleChange} className="sr-only" />
                        <div className="flex flex-col gap-2 items-center text-center">
                          <FaWallet size={20} className={formData.paymentMethod === 'wallet' ? 'text-amber-600' : 'text-stone-400'} />
                          <span className={`text-[10px] uppercase tracking-widest font-bold ${formData.paymentMethod === 'wallet' ? 'text-amber-900' : 'text-stone-600'}`}>Wallet</span>
                        </div>
                      </label>
                      <label className={`relative border p-3 rounded-2xl cursor-pointer transition-all flex flex-col justify-center items-center h-24 ${formData.paymentMethod === 'cod' ? 'border-amber-600 bg-amber-50 shadow-md ring-1 ring-amber-600' : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'}`}>
                        <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="sr-only" />
                        <div className="flex flex-col gap-2 items-center text-center">
                          <FaMoneyBills size={20} className={formData.paymentMethod === 'cod' ? 'text-amber-600' : 'text-stone-400'} />
                          <span className={`text-[10px] uppercase tracking-widest font-bold ${formData.paymentMethod === 'cod' ? 'text-amber-900' : 'text-stone-600'}`}>COD</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary Section */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow-sm border border-stone-200 text-black p-8 w-full h-full flex flex-col rounded-2xl">
                  <h3 className="text-2xl font-black border-b border-stone-500/20 pb-4 tracking-tight uppercase italic mb-6">Order Summary</h3>
                  <div className="space-y-4 mb-4">
                    <div className="flex justify-between text-stone-800 text-sm font-semibold">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between text-green-900 text-sm font-bold">
                        <div className="flex items-center gap-2">
                          <span>Discount ({appliedDiscount.code})</span>
                          <button type="button" onClick={removeDiscount} className="text-[9px] border border-green-900 px-1.5 py-0.5 rounded-md hover:bg-green-900 hover:text-white transition-colors">REMOVE</button>
                        </div>
                        <span>- ₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-800 text-sm font-semibold">
                      <span>Shipping</span>
                      <span className={appliedDiscount?.type === 'shipping' ? 'text-green-900 font-bold' : 'text-stone-900 font-semibold'}>
                        {appliedDiscount?.type === 'shipping' ? 'FREE' : '₹150'}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-800 text-sm font-semibold">
                      <span>Tax (6% GST)</span>
                      <span>₹{gstAmount.toLocaleString()}</span>
                    </div>
                    {codFee > 0 && (
                      <div className="flex justify-between text-stone-800 text-sm font-semibold">
                        <span>Extra Charge on COD</span>
                        <span>₹{codFee.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Promo Code Input */}
                  {!appliedDiscount && (
                    <div className="space-y-2 border-t border-stone-500/20 pt-6 mb-8">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-800 block">Gift Card or Discount Code</span>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={promoCode} 
                          onChange={(e) => setPromoCode(e.target.value)} 
                          placeholder="Summer20..." 
                          className="flex-1 bg-white border border-stone-200 text-sm font-bold text-stone-900 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-stone-400 shadow-sm"
                        />
                        <button 
                          type="button" 
                          onClick={handleApplyPromo}
                          className="bg-stone-900 text-amber-500 font-bold text-xs uppercase px-5 rounded-xl hover:bg-stone-800 transition shadow-lg active:scale-95"
                        >
                          Apply
                        </button>
                      </div>
                      {promoMessage && <p className={`text-xs font-bold ${promoMessage.includes('Invalid') ? 'text-red-800' : 'text-green-900'}`}>{promoMessage}</p>}
                    </div>
                  )}

                  <div className="border-t border-stone-500/20 pt-2">
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-800 block">Total Amount</span>
                      <span className="text-3xl font-black text-stone-900 block">₹{totalPayable.toLocaleString()}</span>
                    </div>
                    {!showPaymentOptions ? (
                      <button 
                        type="button" 
                        onClick={handleContinuePayment}
                        className="w-full bg-stone-900 text-amber-500 hover:text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl active:scale-[0.98] flex justify-center items-center gap-3"
                      >
                        Continue to Payment
                      </button>
                    ) : (
                      <>
                        <button 
                          type="submit" 
                          disabled={isProcessing}
                          className="w-full bg-black border border-stone-200 text-amber-500 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-sm active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border rounded-full animate-spin"></span>
                              Processing...
                            </span>
                          ) : (
                            <><FaCircleCheck size={14} /> Confirm Order</>
                          )}
                        </button>
                        <p className="text-center text-[9px] uppercase font-bold text-amber-900 tracking-widest mt-4 opacity-70  py-1.5 rounded-lg w-max mx-auto px-3">
                          {formData.paymentMethod === 'cod' ? 'Cash on Delivery Pending' : 'Secure Encrypted Payment'}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Trust Badges - Only visible when payment options are shown */}
                  {showPaymentOptions && (
                    <div className="mt-8 pt-8 border-t border-amber-500/30 flex flex-col gap-4">
                      <div className="flex items-center gap-3 text-stone-900">
                        <FaLock size={12} className="opacity-70" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">100% Secure Transaction</span>
                      </div>
                      <p className="text-[9px] text-stone-800/80 font-bold uppercase tracking-widest leading-relaxed">
                        Your personal and payment data is encrypted and secure.
                      </p>
                      <div className="flex gap-2 opacity-80">
                        <div className="bg-white/40 px-2 py-1.5 rounded-lg shadow-sm text-stone-900 border border-white/20"><FaCcVisa size={18} /></div>
                        <div className="bg-white/40 px-2 py-1.5 rounded-lg shadow-sm text-stone-900 border border-white/20"><FaCcMastercard size={18} /></div>
                        <div className="bg-white/40 px-2 py-1.5 rounded-lg shadow-sm text-stone-900 border border-white/20"><FaCcApplePay size={18} /></div>
                        <div className="bg-white/40 px-2 py-1.5 rounded-lg shadow-sm text-stone-900 border border-white/20"><FaCreditCard size={18} /></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-14 text-center border border-stone-100 relative z-10"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-green-500/10 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20"
            >
              <FaCircleCheck size={48} />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-stone-900 mb-4">
              Order Placed!
            </h1>
            <p className="text-stone-500 font-medium leading-relaxed mb-10 text-sm">
              Thank you for choosing ElectroShop. Your order has been successfully placed 
              and is currently being processed. You will receive an email confirmation 
              shortly with tracking details.
            </p>

            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-3 mx-auto bg-stone-900 text-amber-500 px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all duration-300 group shadow-xl active:scale-95"
            >
              <FaArrowLeftLong className="group-hover:-translate-x-1.5 transition-transform duration-300" />
              <span>Return to Store</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
