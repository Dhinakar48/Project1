import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser,
  FaBoxOpen,
  FaLocationDot,
  FaCreditCard,
  FaGear,
  FaBell,
  FaShieldHalved,
  FaMobileScreenButton,
  FaLaptop,
  FaCamera,
  FaArrowRightFromBracket,
  FaPencil,
  FaTrashCan,
  FaPlus,
  FaFileArrowDown,
  FaUserMinus,
  FaCcVisa,
  FaCcMastercard,
  FaLock,
  FaKey
} from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useStore } from './StoreContext';

export default function MyAccount() {
  const [activeTab, setActiveTab] = useState('profile');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const { cart, wishlist } = useStore();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const activeUser = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Local state to handle editing
  const [profileData, setProfileData] = useState({
    firstName: activeUser.name || "User",
    email: activeUser.email || "",
    phone: activeUser.phone || "",
    dob: activeUser.dob || "2000-01-01",
    address: "",
    city: "",
    state: "",
    pincode: "",
    image: null
  });

  useEffect(() => {
    if (activeUser.email) {
      axios.get(`http://127.0.0.1:5000/profile/${activeUser.email}`)
        .then(res => {
          setProfileData({
            firstName: res.data.name || "User",
            email: res.data.email,
            phone: res.data.phone || "",
            dob: res.data.dob ? res.data.dob.split('T')[0] : "2000-01-01",
            address: res.data.address || "",
            city: res.data.city || "",
            state: res.data.state || "",
            pincode: res.data.pincode || "",
            image: res.data.profile_image
          });
        })
        .catch(err => console.error("Error loading profile:", err));
    }
  }, [activeUser.email]);

  const profileImage = profileData.image;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/update-profile', {
        email: profileData.email,
        name: profileData.firstName,
        phone: profileData.phone,
        dob: profileData.dob,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        pincode: profileData.pincode,
        image: profileData.image
      });
      setIsEditingProfile(false);
      
      // Update local storage to reflect changes across app
      const updatedUser = {
        ...activeUser,
        name: profileData.firstName,
        phone: profileData.phone,
        profile_image: profileData.image
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  };


  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'orders', label: 'Orders', icon: FaBoxOpen },
    { id: 'addresses', label: 'Addresses', icon: FaLocationDot },
    { id: 'payment', label: 'Payment', icon: FaCreditCard },
    { id: 'settings', label: 'Settings', icon: FaGear },
  ];

  const orders = [
    {
      id: "ORD-2024-0847",
      date: "April 10, 2026",
      status: "Delivered",
      total: "₹1,09,999",
      items: [
        { name: "Sony WH-1000XM5 Wireless Headphones", quantity: 1, price: "₹29,999" },
        { name: "Samsung Galaxy S24 Ultra 256GB", quantity: 1, price: "₹80,000" }
      ],
      icon: FaMobileScreenButton
    },
    {
      id: "ORD-2024-0823",
      date: "March 28, 2026",
      status: "In Transit",
      total: "₹2,10,000",
      items: [
        { name: "MacBook Pro 14\" M3 Pro", quantity: 1, price: "₹2,10,000" }
      ],
      icon: FaLaptop
    },
    {
      id: "ORD-2024-0791",
      date: "March 15, 2026",
      status: "Delivered",
      total: "₹2,09,999",
      items: [
        { name: "Sony Alpha A7 IV Camera Body", quantity: 1, price: "₹2,09,999" }
      ],
      icon: FaCamera
    }
  ];

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "Home",
      name: "John Smith",
      street: "123 Tech Boulevard",
      city: "Mumbai, MH 400001",
      phone: "+91 98765 43210",
      isDefault: true
    },
    {
      id: 2,
      type: "Work",
      name: "John Smith",
      street: "456 Innovation Drive",
      city: "Bangalore, KA 560001",
      phone: "+91 91234 56789",
      isDefault: false
    }
  ]);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    type: "Home",
    name: "",
    street: "",
    city: "",
    pincode: "",
    phone: ""
  });

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('http://127.0.0.1:5000/update-address', {
        email: activeUser.email,
        name: newAddress.name,
        phone: newAddress.phone,
        address: newAddress.street,
        city: newAddress.city,
        state: "Not Specified", // Placeholder since form doesn't have it
        pincode: newAddress.pincode
      });

      const displayCity = newAddress.pincode ? `${newAddress.city} - ${newAddress.pincode}` : newAddress.city;
      
      if (editingAddressId) {
        setAddresses(addresses.map(a => 
          a.id === editingAddressId ? { ...newAddress, city: displayCity, id: editingAddressId, isDefault: a.isDefault } : a
        ));
      } else {
        const id = Date.now();
        const newAdd = { ...newAddress, city: displayCity, id, isDefault: addresses.length === 0 };
        setAddresses([...addresses, newAdd]);
      }
      
      setIsAddingAddress(false);
      setEditingAddressId(null);
      setNewAddress({ type: "Home", name: "", street: "", city: "", pincode: "", phone: "" });
      alert("Address saved to database!");
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Failed to save address to database.");
    }
  };

  const handleEditAddress = (address) => {
    let cityParts = address.city.split(' - ');
    let city = cityParts[0] || '';
    let pincode = cityParts.length > 1 ? cityParts[1] : '';

    setNewAddress({
      type: address.type,
      name: address.name,
      street: address.street,
      city: city,
      pincode: pincode,
      phone: address.phone
    });
    setEditingAddressId(address.id);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "Visa",
      last4: "4242",
      expiry: "12/27",
      isDefault: true,
      icon: FaCcVisa
    },
    {
      id: 2,
      type: "Mastercard",
      last4: "8888",
      expiry: "09/26",
      isDefault: false,
      icon: FaCcMastercard
    }
  ]);

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [newPayment, setNewPayment] = useState({ type: "Visa", cardNumber: "", expiry: "", cvv: "" });
  
  const [settings, setSettings] = useState({
    orderUpdates: true,
    promotions: true,
    twoFactorAuth: false
  });

  const handleAddPayment = (e) => {
    e.preventDefault();
    const last4 = newPayment.cardNumber.slice(-4) || '0000';
    let icon = FaCcVisa;
    if (newPayment.type === 'Mastercard') icon = FaCcMastercard;

    if (editingPaymentId) {
      setPaymentMethods(paymentMethods.map(p => 
        p.id === editingPaymentId ? { ...p, last4, expiry: newPayment.expiry, type: newPayment.type, icon } : p
      ));
    } else {
      const id = Date.now();
      setPaymentMethods([...paymentMethods, { id, isDefault: paymentMethods.length === 0, last4, expiry: newPayment.expiry, type: newPayment.type, icon }]);
    }
    setIsAddingPayment(false);
    setEditingPaymentId(null);
    setNewPayment({ type: "Visa", cardNumber: "", expiry: "", cvv: "" });
  };

  const handleEditPayment = (method) => {
    setNewPayment({ type: method.type, cardNumber: "****" + method.last4, expiry: method.expiry, cvv: "" });
    setEditingPaymentId(method.id);
    setIsAddingPayment(true);
  };

  const handleDeletePayment = (id) => {
    setPaymentMethods(paymentMethods.filter(p => p.id !== id));
  };

  const handleSetDefaultPayment = (id) => {
    setPaymentMethods(paymentMethods.map(p => ({ ...p, isDefault: p.id === id })));
  };

  const handleToggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadData = () => {
    alert("Your data is being packaged. A download link will be emailed to you shortly.");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("WARNING: Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      handleLogout();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Transit":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-stone-100 text-stone-800 border-stone-200";
    }
  };

  const handleLogout = () => {
    // Logout logic here
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">

      {/* Header Banner */}
      <div className="bg-stone-900 text-white pt-10 pb-20 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center text-stone-900 font-black text-3xl shadow-lg border-4 border-stone-800 overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                "JS"
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">{profileData.firstName}</h1>
              <p className="text-stone-400 font-medium text-sm tracking-wide">{profileData.email} • Member since 2023</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="flex flex-col gap-8">

          {/* Top Navbar Navigation */}
          <div className="w-full">
            <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden relative z-10">
              <div className="p-2 flex items-center justify-between overflow-x-auto whitespace-nowrap scrollbar-hide">
                <div className="flex items-center gap-2">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 justify-center px-6 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide ${isActive
                            ? 'bg-stone-900 text-amber-500 shadow-md'
                            : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                          }`}
                      >
                        <Icon size={16} className={isActive ? 'text-amber-500' : 'text-stone-400'} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex items-center gap-2 pl-4 ml-4 border-l border-stone-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 justify-center px-6 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <FaArrowRightFromBracket size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >

                {/* 1. Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-stone-200/50 border border-stone-100">
                      <div className="mb-8 border-b border-stone-100 pb-6 flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900 mb-1">Personal Information</h2>
                          <p className="text-stone-500 text-sm font-medium">Update your basic profile details here.</p>
                        </div>
                        {isEditingProfile ? (
                          <div className="flex gap-2">
                            <button onClick={() => setIsEditingProfile(false)} className="text-[10px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-100 px-4 py-2 rounded-xl transition-colors">
                              Cancel
                            </button>
                            <button onClick={handleSaveProfile} className="text-[10px] font-black uppercase tracking-widest text-stone-900 bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-xl shadow-sm transition-colors">
                              Save
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setIsEditingProfile(true)} className="text-amber-600 hover:text-amber-700 bg-amber-50 p-3 rounded-full transition-colors group">
                            <FaPencil className="group-hover:scale-110 transition-transform" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-10 items-start">
                        {/* Profile Picture Area */}
                        <div className="flex flex-col items-center gap-4 shrink-0 bg-stone-50/50 p-6 rounded-3xl border border-stone-100">
                          <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                          <div 
                            className="relative w-32 h-32 rounded-full border-[6px] border-white overflow-hidden shadow-lg shadow-stone-200/50 cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                          >
                             {profileImage ? (
                               <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full bg-amber-500 flex items-center justify-center text-4xl font-black text-stone-900 border border-stone-900/10">
                                 JS
                               </div>
                             )}
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                               <FaCamera size={24} />
                             </div>
                          </div>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[10px] font-black uppercase tracking-widest text-stone-900 bg-white border border-stone-200 shadow-sm px-5 py-2.5 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
                          >
                            Update Picture
                          </button>
                        </div>

                        {/* Text Fields */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Name</label>
                            {isEditingProfile ? (
                              <input type="text" value={profileData.firstName} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} className="w-full bg-white px-4 py-3 rounded-2xl font-semibold border border-stone-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                            ) : (
                              <div className="bg-stone-50 px-4 py-3 rounded-2xl font-semibold border border-stone-100 text-stone-900">{profileData.firstName}</div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Date of Birth</label>
                            {isEditingProfile ? (
                              <input type="date" value={profileData.dob} onChange={(e) => setProfileData({...profileData, dob: e.target.value})} className="w-full bg-white px-4 py-3 rounded-2xl font-semibold border border-stone-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                            ) : (
                              <div className="w-full bg-stone-50 px-4 py-3 rounded-2xl font-semibold border border-stone-100 text-stone-900">
                                {new Date(profileData.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Email Address</label>
                            {isEditingProfile ? (
                              <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="w-full bg-white px-4 py-3 rounded-2xl font-semibold border border-stone-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                            ) : (
                              <div className="bg-stone-50 px-4 py-3 rounded-2xl font-semibold border border-stone-100 text-stone-900">{profileData.email}</div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Phone</label>
                            {isEditingProfile ? (
                              <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-white px-4 py-3 rounded-2xl font-semibold border border-stone-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                            ) : (
                              <div className="bg-stone-50 px-4 py-3 rounded-2xl font-semibold border border-stone-100 text-stone-900">{profileData.phone}</div>
                            )}
                          </div>
                          <div className="space-y-2 md:col-span-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Street Address</label>
                             {isEditingProfile ? (
                               <input type="text" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} className="w-full bg-white px-4 py-3 rounded-2xl font-semibold border border-stone-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                             ) : (
                               <div className="bg-stone-50 px-4 py-3 rounded-2xl font-semibold border border-stone-100 text-stone-900">{profileData.address}</div>
                             )}
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">City</label>
                             {isEditingProfile ? (
                               <input type="text" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} className="w-full bg-white px-4 py-3 rounded-2xl font-semibold border border-stone-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                             ) : (
                               <div className="bg-stone-50 px-4 py-3 rounded-2xl font-semibold border border-stone-100 text-stone-900">{profileData.city}</div>
                             )}
                          </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">State</label>
                                 {isEditingProfile ? (
                                   <input type="text" value={profileData.state} onChange={(e) => setProfileData({...profileData, state: e.target.value})} className="w-full bg-white px-4 py-3 rounded-2xl font-semibold border border-stone-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                                 ) : (
                                   <div className="bg-stone-50 px-4 py-3 rounded-2xl font-semibold border border-stone-100 text-stone-900">{profileData.state}</div>
                                 )}
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Pincode</label>
                                 {isEditingProfile ? (
                                   <input type="text" value={profileData.pincode} onChange={(e) => setProfileData({...profileData, pincode: e.target.value})} className="w-full bg-white px-4 py-3 rounded-2xl font-semibold border border-stone-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" />
                                 ) : (
                                   <div className="bg-stone-50 px-4 py-3 rounded-2xl font-semibold border border-stone-100 text-stone-900">{profileData.pincode}</div>
                                 )}
                              </div>
                            </div>

                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Wishlist Highlight */}
                      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-sm font-black uppercase tracking-tight text-stone-900 border-b-2 border-amber-400 inline-block">My Wishlist ({wishlist.length})</h2>
                          <button onClick={() => navigate('/wishlist')} className="text-[10px] font-black uppercase text-amber-600 hover:text-amber-700 tracking-widest group flex items-center gap-1">
                            View All <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">&rarr;</span>
                          </button>
                        </div>
                        {wishlist.length > 0 ? (
                          <div className="grid grid-cols-2 gap-4 flex-1">
                            {wishlist.slice(0, 2).map((item) => (
                              <div key={item.id} className="bg-stone-50/50 rounded-2xl p-3 border border-stone-100 flex flex-col justify-between gap-2 transition-colors hover:border-amber-200 cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                                <div className="h-20 w-full overflow-hidden rounded-xl bg-white flex items-center justify-center p-2 shadow-sm border border-stone-100/50">
                                  <img src={item.variants[0].img} alt={item.name} className="h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-xs font-bold text-stone-900 truncate" title={item.name}>{item.name}</h3>
                                  <p className="text-[10px] font-black text-amber-600 mt-1">{item.variants[0].price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 rounded-2xl border border-stone-200 border-dashed py-8">
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">Empty Wishlist</p>
                          </div>
                        )}
                      </div>

                      {/* Cart Highlight */}
                      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-sm font-black uppercase tracking-tight text-stone-900 border-b-2 border-stone-900 inline-block">Active Cart ({cart.length})</h2>
                          <button onClick={() => navigate('/cart')} className="text-[10px] font-black uppercase text-stone-600 hover:text-stone-900 tracking-widest group flex items-center gap-1">
                            View Cart <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">&rarr;</span>
                          </button>
                        </div>
                        {cart.length > 0 ? (
                          <div className="flex flex-col gap-3 flex-1">
                            {cart.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex gap-4 items-center bg-stone-50/50 p-3 rounded-2xl border border-stone-100 cursor-pointer hover:border-stone-200 transition-colors" onClick={() => navigate('/cart')}>
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-stone-100/50 flex items-center justify-center p-1 shrink-0">
                                  <img src={item.variant.img} className="w-full h-full object-contain mix-blend-multiply" alt={item.name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xs font-bold text-stone-900 truncate" title={item.name}>{item.name}</h3>
                                  <p className="text-[10px] font-black text-stone-500 tracking-widest uppercase mt-0.5">Qty: {item.quantity} • {item.variant.color}</p>
                                </div>
                                <div className="text-xs font-black text-stone-900 shrink-0">
                                  {item.variant.price}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 rounded-2xl border border-stone-200 border-dashed py-8">
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">Cart is Empty</p>
                          </div>
                        )}
                      </div>


                    </div>
                  </div>
                )}

                {/* 2. Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="bg-white rounded-3xl p-8 shadow-xl shadow-stone-200/50 border border-stone-100 min-h-[500px]">
                    {selectedOrder ? (
                      <AnimatePresence mode="wait">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <button onClick={() => setSelectedOrder(null)} className="text-[10px] font-black uppercase text-stone-500 hover:text-stone-900 tracking-widest flex items-center gap-2 mb-6 group">
                            <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Orders
                          </button>
                          
                          <div className="flex flex-wrap gap-4 items-start justify-between mb-8 border-b border-stone-100 pb-6">
                            <div>
                              <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900 mb-2">Order {selectedOrder.id}</h2>
                              <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedOrder.status)}`}>
                                  {selectedOrder.status}
                                </span>
                                <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">{selectedOrder.date}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-black text-stone-900">{selectedOrder.total}</p>
                              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Amount</p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div>
                               <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Items in this order</h3>
                               <div className="bg-stone-50 rounded-2xl p-4 space-y-4 border border-stone-100">
                                {selectedOrder.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-4 text-sm bg-white p-4 rounded-xl border border-stone-100/50 shadow-sm">
                                    <div className="bg-stone-50 w-16 h-16 flex items-center justify-center rounded-xl border border-stone-100 text-stone-400">
                                      <selectedOrder.icon size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-stone-900 text-lg truncate">{item.name}</p>
                                      <p className="text-xs font-black text-stone-400 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-black text-stone-900 text-lg shrink-0">{item.price}</p>
                                  </div>
                                ))}
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 relative overflow-hidden">
                                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Shipping Address</h3>
                                <p className="font-bold text-stone-900 text-sm">{profileData.firstName} {profileData.lastName}</p>
                                <p className="text-stone-500 text-sm mt-1">123 Tech Boulevard<br />Mumbai, MH 400001<br />India</p>
                                <p className="text-stone-500 text-sm mt-2">{profileData.phone}</p>
                                <FaLocationDot className="absolute -bottom-4 -right-4 text-stone-200/50" size={100} />
                              </div>
                              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 relative overflow-hidden">
                                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Payment Method</h3>
                                <div className="flex items-center gap-3">
                                  <FaCcVisa className="text-stone-400" size={32} />
                                  <div>
                                    <p className="font-bold text-stone-900 text-sm">Visa ending in 4242</p>
                                    <p className="text-stone-500 text-xs mt-1">Paid on {selectedOrder.date}</p>
                                  </div>
                                </div>
                                <FaCreditCard className="absolute -bottom-4 -right-4 text-stone-200/50" size={100} />
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-stone-100 mt-8">
                               <button className="bg-white border border-stone-200 text-stone-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-50 transition shadow-sm active:scale-95">
                                 Download Invoice
                               </button>
                               <button className="bg-stone-900 text-amber-500 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition shadow-md active:scale-95">
                                 Track Package
                               </button>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <>
                        <div className="mb-8 border-b border-stone-100 pb-6">
                          <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900 mb-1">Order History</h2>
                          <p className="text-stone-500 text-sm font-medium">View and track your previous orders.</p>
                        </div>
                        <div className="space-y-6">
                          {orders.map((order) => (
                            <div key={order.id} className="border border-stone-200 rounded-3xl p-6 hover:border-amber-400 transition-colors group">
                              <div className="flex flex-wrap gap-4 items-start justify-between mb-6">
                                <div className="flex-1 min-w-[200px]">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-black text-stone-900 text-lg uppercase tracking-tight">{order.id}</h3>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                      {order.status}
                                    </div>
                                  </div>
                                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{order.date}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-black text-stone-900">{order.total}</p>
                                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Amount</p>
                                </div>
                              </div>

                              <div className="bg-stone-50 rounded-2xl p-4 mb-6 space-y-4">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-4 text-sm">
                                    <div className="bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm border border-stone-100 text-stone-400">
                                      <order.icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-stone-900 truncate">{item.name}</p>
                                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-black text-stone-900 shrink-0">{item.price}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <button className="flex-1 bg-stone-900 text-amber-500 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition shadow-md active:scale-95">
                                  Track Order
                                </button>
                                <button onClick={() => setSelectedOrder(order)} className="flex-1 bg-white border border-stone-200 text-stone-900 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-50 hover:border-stone-300 transition active:scale-95">
                                  View Details
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 3. Addresses Tab */}
                {activeTab === 'addresses' && (
                  <div className="bg-white rounded-3xl p-8 shadow-xl shadow-stone-200/50 border border-stone-100 min-h-[400px]">
                    <div className="mb-8 border-b border-stone-100 pb-6 flex flex-wrap gap-4 justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900 mb-1">Saved Addresses</h2>
                        <p className="text-stone-500 text-sm font-medium">Manage your delivery locations.</p>
                      </div>
                      {!isAddingAddress && (
                        <button onClick={() => { setIsAddingAddress(true); setEditingAddressId(null); setNewAddress({ type: "Home", name: "", street: "", city: "", pincode: "", phone: "" }); }} className="flex items-center gap-2 bg-stone-100 hover:bg-amber-100 text-stone-900 hover:text-amber-800 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm active:scale-95">
                          <FaPlus />
                          Add New
                        </button>
                      )}
                    </div>
                    
                    {isAddingAddress ? (
                      <form onSubmit={handleAddAddress} className="w-full bg-stone-50 p-6 rounded-3xl border border-stone-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Address Type</label>
                            <input required type="text" placeholder="e.g. Home, Work" value={newAddress.type} onChange={e => setNewAddress({...newAddress, type: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl font-semibold border border-stone-200 outline-none focus:border-amber-500 shadow-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Contact Name</label>
                            <input required type="text" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl font-semibold border border-stone-200 outline-none focus:border-amber-500 shadow-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Street Address</label>
                            <input required type="text" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl font-semibold border border-stone-200 outline-none focus:border-amber-500 shadow-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Mobile</label>
                            <input required type="tel" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl font-semibold border border-stone-200 outline-none focus:border-amber-500 shadow-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">City</label>
                            <input required type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl font-semibold border border-stone-200 outline-none focus:border-amber-500 shadow-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Pincode</label>
                            <input required type="text" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl font-semibold border border-stone-200 outline-none focus:border-amber-500 shadow-sm" />
                          </div>
                        </div>
                        <div className="flex gap-3 justify-end items-center border-t border-stone-200 pt-6">
                            <button type="button" onClick={() => { setIsAddingAddress(false); setEditingAddressId(null); setNewAddress({ type: "Home", name: "", street: "", city: "", pincode: "", phone: "" }); }} className="text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 px-4 py-2 transition-colors">
                              Cancel
                            </button>
                            <button type="submit" className="text-[10px] font-black uppercase tracking-widest text-stone-900 bg-amber-400 hover:bg-amber-500 px-6 py-3 rounded-xl shadow-sm transition-colors">
                              {editingAddressId ? 'Save Changes' : 'Save Address'}
                            </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((address) => (
                          <div key={address.id} className="border border-stone-200 rounded-3xl p-6 relative group overflow-hidden bg-stone-50/50 hover:border-amber-200 transition-colors">
                            {address.isDefault && (
                              <div className="absolute top-0 right-0 bg-stone-900 text-amber-500 px-4 py-1.5 rounded-bl-xl text-[9px] font-black uppercase tracking-widest shadow-sm">
                                Default
                              </div>
                            )}
                            <div className="flex items-center justify-between mb-4 mt-2">
                              <h3 className="font-black text-stone-900 text-lg uppercase tracking-tight">{address.type}</h3>
                              <div className="flex gap-2">
                                <button onClick={() => handleEditAddress(address)} className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                                  <FaPencil size={14} />
                                </button>
                                <button onClick={() => handleDeleteAddress(address.id)} className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                  <FaTrashCan size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1.5 text-sm font-medium text-stone-600 mb-6">
                              <p className="font-bold text-stone-900">{address.name}</p>
                              <p>{address.street}</p>
                              <p>{address.city}</p>
                              <p className="pt-2 text-stone-500 font-semibold text-xs tracking-wider">{address.phone}</p>
                            </div>
                            {!address.isDefault && (
                              <button onClick={() => handleSetDefaultAddress(address.id)} className="w-full py-2.5 border border-stone-200 bg-white text-stone-600 hover:border-stone-900 hover:text-stone-900 hover:shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                                Set as Default
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Payment Tab */}
                {activeTab === 'payment' && (
                  <div className="bg-white rounded-3xl p-8 shadow-xl shadow-stone-200/50 border border-stone-100 min-h-[400px]">
                    <div className="mb-8 border-b border-stone-100 pb-6 flex flex-wrap gap-4 justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900 mb-1">Payment Methods</h2>
                        <p className="text-stone-500 text-sm font-medium">Manage your saved credit and debit cards.</p>
                      </div>
                      {!isAddingPayment && (
                        <button onClick={() => { setIsAddingPayment(true); setEditingPaymentId(null); setNewPayment({ type: "Visa", cardNumber: "", expiry: "", cvv: "" }); }} className="flex items-center gap-2 bg-stone-100 hover:bg-amber-100 text-stone-900 hover:text-amber-800 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm active:scale-95">
                          <FaPlus />
                          Add Card
                        </button>
                      )}
                    </div>
                    {isAddingPayment ? (
                      <form onSubmit={handleAddPayment} className="w-full bg-stone-50 p-6 rounded-3xl border border-stone-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Card Type</label>
                            <select value={newPayment.type} onChange={e => setNewPayment({...newPayment, type: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl font-semibold border border-stone-200 outline-none focus:border-amber-500 shadow-sm appearance-none">
                              <option value="Visa">Visa</option>
                              <option value="Mastercard">Mastercard</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Card Number</label>
                            <input required type="text" placeholder="**** **** **** 4242" value={newPayment.cardNumber} onChange={e => setNewPayment({...newPayment, cardNumber: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl font-semibold border border-stone-200 outline-none focus:border-amber-500 shadow-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Expiry (MM/YY)</label>
                            <input required type="text" placeholder="12/27" value={newPayment.expiry} onChange={e => setNewPayment({...newPayment, expiry: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl font-semibold border border-stone-200 outline-none focus:border-amber-500 shadow-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">CVV</label>
                            <input required={!editingPaymentId} type="password" placeholder="***" value={newPayment.cvv} onChange={e => setNewPayment({...newPayment, cvv: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl font-semibold border border-stone-200 outline-none focus:border-amber-500 shadow-sm" />
                          </div>
                        </div>
                        <div className="flex gap-3 justify-end items-center border-t border-stone-200 pt-6">
                            <button type="button" onClick={() => { setIsAddingPayment(false); setEditingPaymentId(null); setNewPayment({ type: "Visa", cardNumber: "", expiry: "", cvv: "" }); }} className="text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 px-4 py-2 transition-colors">
                              Cancel
                            </button>
                            <button type="submit" className="text-[10px] font-black uppercase tracking-widest text-stone-900 bg-amber-400 hover:bg-amber-500 px-6 py-3 rounded-xl shadow-sm transition-colors">
                              {editingPaymentId ? 'Save Changes' : 'Save Card'}
                            </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="border border-stone-200 rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-white to-stone-50 hover:border-amber-200 transition-colors">
                            {method.isDefault && (
                              <div className="absolute top-0 right-0 bg-stone-900 text-amber-500 px-4 py-1.5 rounded-bl-xl text-[9px] font-black uppercase tracking-widest shadow-sm">
                                Default
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-10 bg-white border border-stone-200 shadow-sm rounded-lg flex items-center justify-center text-stone-700">
                                  <method.icon size={28} />
                                </div>
                                <div>
                                  <h5 className="font-black text-stone-900 uppercase tracking-tight mb-1">{method.type} ending in {method.last4}</h5>
                                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Expires {method.expiry}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleEditPayment(method)} className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                                  <FaPencil size={14} />
                                </button>
                                <button onClick={() => handleDeletePayment(method.id)} className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                  <FaTrashCan size={14} />
                                </button>
                              </div>
                            </div>
                            {!method.isDefault && (
                              <button onClick={() => handleSetDefaultPayment(method.id)} className="mt-6 w-full py-2.5 border border-stone-200 bg-white text-stone-600 hover:border-stone-900 hover:text-stone-900 hover:shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                                Set as Default
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-stone-200/50 border border-stone-100">
                      <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900 mb-6 border-b border-stone-100 pb-6">Notifications</h2>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                              <FaBoxOpen size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-stone-900">Order Updates</p>
                              <p className="text-xs font-medium text-stone-500">Get notified about order status via email</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.orderUpdates} onChange={() => handleToggleSetting('orderUpdates')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                              <FaBell size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-stone-900">Promotions</p>
                              <p className="text-xs font-medium text-stone-500">Receive offers and personalized deals</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.promotions} onChange={() => handleToggleSetting('promotions')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-stone-200/50 border border-stone-100">
                      <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900 mb-6 border-b border-stone-100 pb-6">Security & Account</h2>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                <FaKey size={16} />
                              </div>
                              <div>
                                <p className="font-bold text-stone-900">Account Password</p>
                                <p className="text-xs font-medium text-stone-500">Last changed 3 months ago</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setIsChangingPassword(!isChangingPassword)}
                              className="text-[10px] font-black uppercase tracking-widest text-stone-600 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors"
                            >
                              {isChangingPassword ? 'Cancel' : 'Change'}
                            </button>
                          </div>

                          <AnimatePresence>
                            {isChangingPassword && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 mt-2 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Current Password</label>
                                      <input 
                                        type="password" 
                                        value={passwordForm.current}
                                        onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-amber-500 outline-none transition-all"
                                        placeholder="••••••••"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">New Password</label>
                                      <input 
                                        type="password" 
                                        value={passwordForm.new}
                                        onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-amber-500 outline-none transition-all"
                                        placeholder="••••••••"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Confirm New</label>
                                      <input 
                                        type="password" 
                                        value={passwordForm.confirm}
                                        onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-amber-500 outline-none transition-all"
                                        placeholder="••••••••"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end">
                                    <button 
                                      className="bg-stone-900 text-amber-500 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-900/10"
                                      onClick={() => {
                                        alert("Password updated successfully!");
                                        setIsChangingPassword(false);
                                        setPasswordForm({ current: '', new: '', confirm: '' });
                                      }}
                                    >
                                      Update Password
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-stone-100">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                              <FaShieldHalved size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-stone-900">Two-Factor Auth</p>
                              <p className="text-xs font-medium text-stone-500">Add extra layer of security</p>
                            </div>
                          </div>
                          <button onClick={() => handleToggleSetting('twoFactorAuth')} className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${settings.twoFactorAuth ? 'bg-stone-900 text-amber-500 hover:bg-stone-800' : 'text-amber-600 bg-amber-50 hover:bg-amber-100'}`}>
                            {settings.twoFactorAuth ? 'Disable' : 'Enable'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-stone-100">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                              <FaFileArrowDown size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-stone-900">Download Data</p>
                              <p className="text-xs font-medium text-stone-500">Get a copy of your personal data</p>
                            </div>
                          </div>
                          <button onClick={handleDownloadData} className="text-[10px] font-black uppercase tracking-widest text-stone-600 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors">
                            Request
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-stone-100 mt-6 pt-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                              <FaUserMinus size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-red-600">Delete Account</p>
                              <p className="text-xs font-medium text-stone-500">Permanently remove your account and data</p>
                            </div>
                          </div>
                          <button onClick={handleDeleteAccount} className="text-[10px] font-black uppercase tracking-widest text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md shadow-red-500/20 active:scale-95">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
