import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCircleCheck, FaArrowLeftLong, FaUser, FaLocationDot, FaLock, FaShieldHalved, FaEnvelope, FaPhone, FaCreditCard, FaCcVisa, FaCcMastercard, FaCcApplePay, FaMobileScreenButton, FaMoneyBills, FaBuildingColumns, FaWallet, FaPlus, FaPencil } from 'react-icons/fa6';
import emailjs from '@emailjs/browser';
import axios from 'axios';
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
  const {
    cart,
    clearCart,
    finalTotal,
    appliedDiscount,
    rawSubtotal,
    productDiscountAmount,
    subtotal,
    couponDiscountAmount,
    applyDiscountCode,
    removeDiscount,
    userProfile
  } = useStore();
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [showPaymentOptions, setShowPaymentOptions] = useState(true);

  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    address1: userProfile?.address1 || "",
    address2: "", 
    city: userProfile?.city || "",
    state: userProfile?.state || "",
    pincode: userProfile?.pincode || "",
    country: userProfile?.country || "India",
    country: userProfile?.country || "India",
    paymentMethod: ""
  });
  const [previousFormData, setPreviousFormData] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editingField, setEditingField] = useState('all'); // 'address1', 'address2', or 'all'
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const fetchAddresses = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const email = storedUser.email || userProfile?.email;
    if (email) {
      setIsLoadingAddresses(true);
      try {
        const host = window.location.hostname === "localhost" ? "localhost" : "127.0.0.1";
        const res = await axios.get(`http://${host}:5000/addresses/${email}`);
        setSavedAddresses(res.data);
      } catch (err) {
        console.error("Error fetching addresses:", err);
      } finally {
        setIsLoadingAddresses(false);
      }
    }
  };

  const hasFetched = React.useRef(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const email = storedUser.email || userProfile?.email;

      if (email && !hasFetched.current) {
        hasFetched.current = true;
        try {
          const host = window.location.hostname === "localhost" ? "localhost" : "127.0.0.1";
          const res = await axios.get(`http://${host}:5000/profile/${email}`);
          if (res.data) {
            setFormData(prev => ({
              ...prev,
              name: res.data.shipping_name || res.data.name || prev.name,
              email: res.data.email || prev.email,
              phone: res.data.shipping_phone || res.data.phone || prev.phone,
              address1: res.data.address || prev.address1,
              address2: "", // Default to only showing the first line
              city: res.data.city || prev.city,
              state: res.data.state || prev.state,
              pincode: res.data.pincode || prev.pincode,
              country: res.data.country || prev.country
            }));
          }
          await fetchAddresses();
        } catch (err) {
          console.error("Error fetching shipping details:", err);
          hasFetched.current = false; // Allow retry on failure
        }
      }
    };
    fetchProfile();
  }, [userProfile?.email]);

  useEffect(() => {
    if (!isLoadingAddresses && !isEditingAddress && savedAddresses.length === 0 && userProfile?.email) {
      setIsAddingNewAddress(true);
      setIsEditingAddress(true);
    }
  }, [savedAddresses.length, isEditingAddress, userProfile?.email, isLoadingAddresses]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const platformFee = 15;
  const codFee = formData.paymentMethod === 'cod' ? 50 : 0;
  const totalPayable = finalTotal + platformFee + codFee;

  const finalizeOrder = async (paymentId = 'COD') => {
    const productNames = cart.map((item) => `${item.name} (x${item.quantity})`).join(', ');

    const baseParams = {
      user_name: formData.name,
      user_email: formData.email,
      products: productNames,
      total_amount: `₹${totalPayable.toLocaleString()}`,
      payment_method: formData.paymentMethod.toUpperCase(),
      payment_id: paymentId,
      shipping_address: `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}, ${formData.city}, ${formData.state}, ${formData.pincode}, ${formData.country}`
    };

    // Update local profile if it was edited
    if (userProfile && userProfile.email === formData.email) {
      // we don't strictly need to do this here if it's already in the DB, 
      // but it helps the UI keep sync if we didn't use setUserProfile in handleSaveAddress
    }

    // Using hardcoded keys as fallbacks because the Vite server was not restarted
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_k11zocm';
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_wz44bjr';
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'lqlnFNDxsieXbjeNn';

    try {
      // Send Confirmation Receipt only to Customer
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        ...baseParams,
        to_email: formData.email
      }, PUBLIC_KEY);

      console.log('ORDER CONFIRMATION SENT TO CUSTOMER!');
    } catch (err) {
      console.error('FAILED TO SEND EMAIL:', err);
    }

    // Save to Database
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const customerId = savedUser.customerId;
    
    if (customerId) {
        try {
            const host = window.location.hostname === "localhost" ? "localhost" : "127.0.0.1";
            await axios.post(`http://${host}:5000/order/place`, {
                customerId,
                addressId: editingAddressId || (savedAddresses.length > 0 ? savedAddresses[0].address_id : null),
                cartItems: cart,
                subtotal: subtotal,
                discountAmount: couponDiscountAmount,
                totalAmount: totalPayable,
                couponId: appliedDiscount?.code
            });
        } catch (err) {
            console.error("Failed to save order to database:", err);
        }
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
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
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
    if (!promoCode) return;
    const res = applyDiscountCode(promoCode, cart.length);
    setPromoMessage(res.message);
    if (res.success) setPromoCode('');
    setTimeout(() => setPromoMessage(''), 3000);
  };

  const handleSaveAddress = async () => {
    try {
      const host = window.location.hostname === "localhost" ? "localhost" : "127.0.0.1";
      // Use the verified email from profile to ensure we update the correct record
      const targetEmail = userProfile?.email || formData.email;

      await axios.post(`http://${host}:5000/update-address`, {
        address_id: editingAddressId,
        email: targetEmail,
        name: formData.name,
        phone: formData.phone,
        address: formData.address1,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country
      });
      await fetchAddresses();
      
      // Update summary to show the field that was just edited
      setFormData(prev => ({
        ...prev,
        address1: editingField === 'address2' ? prev.address2 : prev.address1,
        address2: ""
      }));

      setIsEditingAddress(false);
      setIsAddingNewAddress(false);
      setEditingAddressId(null);
      setEditingField('all');
      setPreviousFormData(null);
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Failed to save address changes.");
    }
  };

  const handleCancelAddress = () => {
    if (previousFormData) {
      setFormData(previousFormData);
    }
    setIsEditingAddress(false);
    setIsAddingNewAddress(false);
    setEditingAddressId(null);
    setPreviousFormData(null);
  };

  const startChangingAddress = () => {
    setPreviousFormData({ ...formData });
    setIsEditingAddress(true);
    setIsAddingNewAddress(false);
    setEditingAddressId(null);
  };

  const startEditingSpecificAddress = (addr, field = 'all') => {
    setPreviousFormData({ ...formData });
    setFormData(prev => ({
      ...prev,
      name: addr.full_name,
      phone: addr.phone,
      address1: addr.address1,
      address2: addr.address2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country
    }));
    setEditingAddressId(addr.address_id);
    setEditingField(field);
    setIsAddingNewAddress(true);
    setIsEditingAddress(true);
  };

  const selectSavedAddress = (addr) => {
    setFormData(prev => ({
      ...prev,
      name: addr.full_name,
      phone: addr.phone,
      address1: addr.address1,
      address2: addr.address2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country
    }));
    setIsEditingAddress(false);
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

            <h1 className="text-3xl md:text-5xl font-bold mb-12 tracking-tight text-stone-900">Order Details</h1>

            <form id="checkout-form" onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-5 gap-16">
              <div className="lg:col-span-3 space-y-12">
                {/* 📍 Shipping Address */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-stone-900">1. Shipping Address</h3>
                    {isEditingAddress ? (
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={handleCancelAddress}
                          className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-stone-600 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700 transition"
                        >
                          Save Address
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startChangingAddress}
                        className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700 transition"
                      >
                        Change Address
                      </button>
                    )}
                  </div>

                  {!isEditingAddress ? (
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-2">
                       <p className="text-sm font-bold text-stone-900">{formData.name}</p>
                       <p className="text-xs font-semibold text-stone-500">{formData.email} | {formData.phone}</p>
                       <p className="text-sm font-bold text-stone-900 mt-4">
                         {formData.address1}
                         {formData.address2 && (
                           <span className="block text-xs font-semibold text-stone-500 mt-1">{formData.address2}</span>
                         )}
                       </p>
                       <p className="text-xs font-semibold text-stone-500">{formData.city}, {formData.state} {formData.pincode}</p>
                       <p className="text-xs font-semibold text-stone-500">{formData.country}</p>
                    </div>
                  ) : isAddingNewAddress ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-colors"><FaUser size={14} /></div>
                          <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 pl-12 pr-4 outline-none border border-stone-200 focus:border-stone-400 transition-all" />
                        </div>
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 transition-colors"><FaEnvelope size={14} /></div>
                          <input type="email" name="email" value={formData.email} readOnly disabled placeholder="Email Address" className="w-full bg-stone-50/50 text-sm font-semibold text-stone-400 rounded-2xl py-4 pl-12 pr-4 outline-none border border-stone-100 cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-colors"><FaPhone size={14} /></div>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone Number" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 pl-12 pr-4 outline-none border border-stone-200 focus:border-stone-400 transition-all" />
                      </div>
                      {(editingField === 'address1' || editingField === 'all') && (
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-colors"><FaLocationDot size={14} /></div>
                          <input type="text" name="address1" value={formData.address1} onChange={handleChange} required placeholder="Address 1 (House No, Building, Area)" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 pl-12 pr-4 outline-none border border-stone-200 focus:border-stone-400 transition-all" />
                        </div>
                      )}
                      {(editingField === 'address2' || editingField === 'all') && (
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-colors"><FaBuildingColumns size={14} /></div>
                          <input type="text" name="address2" value={formData.address2} onChange={handleChange} placeholder="Address 2 (Appartment, Suite, etc.)" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 pl-12 pr-4 outline-none border border-stone-200 focus:border-stone-400 transition-all" />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="City" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 px-5 outline-none border border-stone-200 focus:border-stone-400 transition-all" />
                        <input type="text" name="state" value={formData.state} onChange={handleChange} required placeholder="State" className="w-full bg-white text-sm font-semibold text-stone-900 rounded-2xl py-4 px-5 outline-none border border-stone-200 focus:border-stone-400 transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required placeholder="Pincode" className="w-full bg-stone-50 text-sm font-semibold text-stone-900 rounded-2xl py-4 px-5 outline-none border border-stone-200 focus:border-stone-400 transition-all" />
                        <input type="text" name="country" value={formData.country} onChange={handleChange} required placeholder="Country" className="w-full bg-stone-50 text-sm font-semibold text-stone-900 rounded-2xl py-4 px-5 outline-none border border-stone-200 focus:border-stone-400 transition-all" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Virtualized Cards from the single DB record */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedAddresses.length > 0 && (
                          <>
                            {/* Card 1: uses address1 */}
                            <div 
                              onClick={() => {
                                const addr = savedAddresses[0];
                                setFormData(prev => ({ 
                                  ...prev, 
                                  address1: addr.address1, 
                                  address2: "", 
                                  name: addr.full_name, 
                                  phone: addr.phone,
                                  city: addr.city,
                                  state: addr.state,
                                  pincode: addr.pincode,
                                  country: addr.country
                                }));
                                setIsEditingAddress(false);
                              }}
                              className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md h-full flex flex-col justify-between ${formData.address1 === savedAddresses[0].address1 && !formData.address2 ? 'border-amber-500 bg-amber-50/30' : 'border-stone-100 bg-white'}`}
                            >
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); startEditingSpecificAddress(savedAddresses[0], 'address1'); }}
                                className="absolute top-4 right-4 text-amber-600 hover:text-amber-700 transition-colors p-2 bg-amber-50 rounded-lg shadow-sm z-10"
                              >
                                <FaPencil size={12} />
                              </button>
                              <div className="flex justify-between items-start mb-3">
                                <p className="text-sm font-bold text-stone-900 leading-none">Home Address</p>
                                {formData.address1 === savedAddresses[0].address1 && !formData.address2 && <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/30 shrink-0"><FaCircleCheck size={10} /></div>}
                              </div>
                              <div className="bg-stone-50/50 p-4 rounded-xl space-y-1 mt-2 text-left">
                                <p className="text-xs font-bold text-stone-900">{savedAddresses[0].full_name}</p>
                                <p className="text-[10px] font-semibold text-stone-500">{savedAddresses[0].phone}</p>
                                <div className="mt-2 text-[11px] font-medium text-stone-800 line-clamp-2">
                                  {savedAddresses[0].address1}
                                </div>
                                <p className="text-[10px] font-semibold text-stone-500 mt-1">{savedAddresses[0].city}, {savedAddresses[0].state} {savedAddresses[0].pincode}</p>
                              </div>
                            </div>

                            {/* Card 2 or Add New Button */}
                            {savedAddresses[0].address2 ? (
                              <div 
                                onClick={() => {
                                  const addr = savedAddresses[0];
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    address1: addr.address2, 
                                    address2: "", 
                                    name: addr.full_name, 
                                    phone: addr.phone,
                                    city: addr.city,
                                    state: addr.state,
                                    pincode: addr.pincode,
                                    country: addr.country
                                  }));
                                  setIsEditingAddress(false);
                                }}
                                className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md h-full flex flex-col justify-between ${formData.address1 === savedAddresses[0].address2 ? 'border-amber-500 bg-amber-50/30' : 'border-stone-100 bg-white'}`}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); startEditingSpecificAddress(savedAddresses[0], 'address2'); }}
                                  className="absolute top-4 right-4 text-amber-600 hover:text-amber-700 transition-colors p-2 bg-amber-50 rounded-lg shadow-sm z-10"
                                >
                                  <FaPencil size={12} />
                                </button>
                                <div className="flex justify-between items-start mb-3">
                                  <p className="text-sm font-bold text-stone-900 leading-none">Work Address</p>
                                  {formData.address1 === savedAddresses[0].address2 && <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/30 shrink-0"><FaCircleCheck size={10} /></div>}
                                </div>
                                <div className="bg-stone-50/50 p-4 rounded-xl space-y-1 mt-2 text-left">
                                  <p className="text-xs font-bold text-stone-900">{savedAddresses[0].full_name}</p>
                                  <p className="text-[10px] font-semibold text-stone-500">{savedAddresses[0].phone}</p>
                                  <div className="mt-2 text-[11px] font-medium text-stone-800 line-clamp-2">
                                    {savedAddresses[0].address2}
                                  </div>
                                  <p className="text-[10px] font-semibold text-stone-500 mt-1">{savedAddresses[0].city}, {savedAddresses[0].state} {savedAddresses[0].pincode}</p>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEditingSpecificAddress(savedAddresses[0], 'address2')}
                                className="p-6 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-amber-400 hover:text-amber-500 transition-all group h-full min-h-[160px] bg-stone-50/30 w-full"
                              >
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:bg-amber-50 transition-colors shadow-sm">
                                  <FaPlus />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Add Work Address</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 💳 Payment Method Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-stone-900 border-b border-stone-200 pb-3">2. Select Payment Method</h3>
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

                {/* 🔒 Trust Badges (Left Side) */}
                <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-6 opacity-60">
                  <div className="flex items-center gap-3">
                    <FaShieldHalved size={20} className="text-stone-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">100% Secure Transaction</span>
                      <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Bank-grade 256-bit SSL encryption</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-stone-300 grayscale grayscale-[0.8]">
                    <FaCcVisa size={28} />
                    <FaCcMastercard size={28} />
                    <FaCcApplePay size={28} />
                  </div>
                </div>
              </div>

              {/* Order Summary Section */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow-sm border border-stone-200 text-black p-8 w-full h-full flex flex-col rounded-2xl">
                  <h3 className="text-2xl font-bold border-b border-stone-500/20 pb-4 tracking-tight text-stone-900 mb-6">Order Summary</h3>
                  <div className="space-y-4 mb-4">
                    <div className="flex justify-between text-stone-800 text-sm font-semibold">
                      <span>Bag Total</span>
                      <span className="text-stone-400 line-through">₹{rawSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-700 text-sm font-bold">
                      <span>Discount</span>
                      <span>−₹{productDiscountAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-900 text-sm font-bold pt-2 border-t border-stone-100">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between text-green-900 text-sm font-bold">
                        <div className="flex items-center gap-2">
                          <span>Coupon ({appliedDiscount.code})</span>
                          <button type="button" onClick={removeDiscount} className="text-[9px] border border-green-900 px-1.5 py-0.5 rounded-md hover:bg-green-900 hover:text-white transition-colors">REMOVE</button>
                        </div>
                        <span>− ₹{couponDiscountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-800 text-sm font-semibold">
                      <span>Platform Fee</span>
                      <span className="text-stone-900 font-bold">
                        ₹{platformFee}
                      </span>
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
                    <button
                      type="submit"
                      disabled={isProcessing || !formData.paymentMethod}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-sm flex justify-center items-center gap-3 ${isProcessing || !formData.paymentMethod ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-black border border-stone-200 text-amber-500 active:scale-[0.98]'}`}
                    >
                      {isProcessing ? (
                        <span className="w-5 h-5 border-2 border-stone-400 border-t-amber-500 rounded-full animate-spin"></span>
                      ) : !formData.paymentMethod ? (
                        "Select Payment Method"
                      ) : (
                        <><FaCircleCheck size={14} /> Confirm Order</>
                      )}
                    </button>
                    <p className="text-center text-[9px] uppercase font-bold text-amber-900 tracking-widest mt-4 opacity-70  py-1.5 rounded-lg w-max mx-auto px-3">
                      {formData.paymentMethod === 'cod' ? 'Cash on Delivery Pending' : formData.paymentMethod ? 'Secure Encrypted Payment' : 'Selection Required'}
                    </p>
                  </div>
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
            <p className="text-stone-500 font-medium leading-relaxed mb-8 text-sm">
              Thank you for choosing ElectroShop. Your order has been successfully placed
              and is currently being processed.
            </p>

            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 text-left mb-10 overflow-hidden relative">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3 block">Shipping Details</h3>
              <p className="text-sm font-bold text-stone-900">{formData.name}</p>
              <p className="text-xs font-semibold text-stone-500 mt-1 leading-relaxed">
                {formData.address1}
                {formData.address2 && (
                  <span className="block text-[11px] text-stone-400 mt-0.5">{formData.address2}</span>
                )}
                <br />
                {formData.city}, {formData.state} {formData.pincode}<br />
                {formData.country}
              </p>
              <p className="text-[10px] font-bold text-stone-400 mt-4 uppercase tracking-widest">Contact: {formData.phone}</p>
              <FaLocationDot className="absolute -bottom-4 -right-4 text-stone-200/40" size={80} />
            </div>

            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-3 mx-auto w-full bg-stone-900 text-amber-500 px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all duration-300 group shadow-xl active:scale-95"
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