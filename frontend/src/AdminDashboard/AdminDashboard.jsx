import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
   FaChartPie, FaBoxOpen, FaShoppingCart, FaShippingFast, 
   FaUndo, FaCreditCard, FaUsers, FaChartLine, FaUserCog, FaSignOutAlt, FaTags, FaHandHoldingUsd, FaBell, FaCheck, FaUser, FaShopify, FaTimesCircle, FaExclamationTriangle} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useStore } from "../StoreContext";

// Component Imports
import Overview from "./components/Overview";
import Products from "./components/Products";
import Orders from "./components/Orders";
import Shipping from "./components/Shipping";
import Returns from "./components/Returns";
import Payments from "./components/Payments";
import Users from "./components/Users";
import Analytics from "./components/Analytics";
import Profile from "./components/Profile";
import Coupons from "./components/Coupons";

export default function AdminDashboard() {
   const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || "overview");
   const [notifications, setNotifications] = useState([]);
   const [showNotifDropdown, setShowNotifDropdown] = useState(false);
   const notifRef = useRef(null);
   const { logout } = useStore();
   const navigate = useNavigate();

   useEffect(() => {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Check every minute
      return () => clearInterval(interval);
   }, []);

   useEffect(() => {
      localStorage.setItem('adminActiveTab', activeTab);
   }, [activeTab]);

   const fetchNotifications = async () => {
      try {
         const res = await axios.get("http://localhost:5000/api/admin/notifications");
         if (res.data.success) {
            setNotifications(res.data.notifications);
         }
      } catch (err) {
         console.error("Failed to fetch admin notifications:", err);
      }
   };

   const markAsRead = async (id) => {
      try {
         await axios.patch(`http://localhost:5000/api/admin/notifications/read/${id}`);
         setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
      } catch (err) {
         console.error("Failed to mark notification as read:", err);
      }
   };

   const markAllRead = async () => {
      try {
         await axios.patch('http://localhost:5000/api/admin/notifications/read-all');
         setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (err) {
         console.error("Failed to mark all as read:", err);
      }
   };

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (notifRef.current && !notifRef.current.contains(event.target)) {
            setShowNotifDropdown(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const unreadCount = notifications.filter(n => !n.is_read).length;

   const navItems = [
      { id: "overview", label: "Overview", icon: FaChartPie, component: Overview },
      { id: "products", label: "Products", icon: FaBoxOpen, component: Products },
      { id: "orders", label: "Orders", icon: FaShoppingCart, component: Orders },
      { id: "shipping", label: "Shipping", icon: FaShippingFast, component: Shipping },
      { id: "returns", label: "Returns", icon: FaUndo, component: Returns },
      { id: "payments", label: "Payments", icon: FaCreditCard, component: Payments },
      { id: "users", label: "Users", icon: FaUsers, component: Users },
      { id: "analytics", label: "Analytics", icon: FaChartLine, component: Analytics },
      { id: "coupons", label: "Coupons", icon: FaTags, component: Coupons },
      { id: "profile", label: "Profile", icon: FaUserCog, component: Profile },
   ];

   const handleLogout = async () => {
      try {
         const adminId = JSON.parse(localStorage.getItem('adminUser'))?.id;
         await axios.post("http://localhost:5000/api/admin-logout", { admin_id: adminId });
      } catch (err) {
         console.error("Logout log error:", err);
      }
      logout();
   };

   // Find the current component to render
   const ActiveComponent = navItems.find(item => item.id === activeTab)?.component || Overview;

   return (
      <div className="flex h-screen bg-stone-50 font-sans overflow-hidden text-stone-900">
         {/* Sidebar */}
         <aside className="w-64 bg-stone-900 text-white flex flex-col justify-between shrink-0 shadow-2xl relative z-20">
            <div>
               <div className="p-8 border-b border-stone-800">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        <span className="font-bold text-lg leading-none tracking-tighter">A</span>
                     </div>
                     <span className="font-bold text-xl tracking-tight">Admin<span className="text-indigo-400">Core</span></span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mt-2">Superuser Console</p>
               </div>

               <nav className="p-4 space-y-1">
                  {navItems.map((item) => {
                     const Icon = item.icon;
                     const isActive = activeTab === item.id;
                     return (
                        <button
                           key={item.id}
                           onClick={() => setActiveTab(item.id)}
                           className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold ${
                              isActive 
                                 ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_4px_0_0_#818cf8]' 
                                 : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                           }`}
                        >
                           <Icon className={isActive ? 'text-indigo-400' : 'text-stone-500'} />
                           {item.label}
                        </button>
                     );
                  })}
               </nav>
            </div>

            <div className="p-4">
               <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-800 text-stone-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-bold"
               >
                  <FaSignOutAlt /> Logout
               </button>
            </div>
         </aside>

         {/* Main Content Area */}
         <main className="flex-1 overflow-y-auto bg-stone-50 no-scrollbar relative">
            <header className="sticky top-0 z-[60] bg-white border-b border-stone-200 px-8 py-5 flex justify-between items-center shadow-sm">
               <h2 className="text-2xl font-bold tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
               <div className="flex items-center gap-6">
                  {/* Notification Bell */}
                  <div className="relative" ref={notifRef}>
                     <button 
                        onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                        className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all relative group"
                     >
                        <FaBell size={18} className="group-hover:rotate-12 transition-transform" />
                        {unreadCount > 0 && (
                           <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
                              {unreadCount > 9 ? '9+' : unreadCount}
                           </span>
                        )}
                     </button>

                     <AnimatePresence>
                        {showNotifDropdown && (
                            <motion.div 
                               initial={{ opacity: 0, y: 15, scale: 0.95 }}
                               animate={{ opacity: 1, y: 0, scale: 1 }}
                               exit={{ opacity: 0, y: 15, scale: 0.95 }}
                               className="absolute top-full right-0 mt-4 w-[420px] bg-white border border-stone-200 shadow-2xl rounded-[2rem] overflow-hidden z-[1000] ring-1 ring-black/5"
                            >
                               {/* Header */}
                               <div className="px-5 py-4 border-b border-stone-100 flex justify-between items-center bg-gradient-to-r from-indigo-50/80 to-white">
                                  <div>
                                     <h3 className="font-bold text-stone-900 text-sm">Order Notifications</h3>
                                     <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Live platform activity</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     {unreadCount > 0 && (
                                        <button
                                           onClick={markAllRead}
                                           className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                        >
                                           Mark all read
                                        </button>
                                     )}
                                     <span className="text-[10px] font-black text-white bg-red-500 px-2 py-1 rounded-lg min-w-[32px] text-center">
                                        {unreadCount}
                                     </span>
                                  </div>
                               </div>

                               {/* Notification List */}
                               <div className="max-h-[420px] overflow-y-auto no-scrollbar divide-y divide-stone-50">
                                  {notifications.length > 0 ? (
                                     notifications.map((notif) => {
                                        const isPlaced = notif.type === 'Order Placed' || notif.type === 'New Order';
                                        const isCancelled = notif.type === 'Order Cancelled' || notif.type === 'System Alert';
                                        const isRegistration = notif.type === 'New User' || notif.type === 'New Seller';
                                        const isNewProduct = notif.type === 'New Product';

                                        const iconBg = isPlaced ? 'bg-emerald-100 text-emerald-600'
                                           : isCancelled ? 'bg-red-100 text-red-500'
                                           : isRegistration ? 'bg-indigo-100 text-indigo-600'
                                           : isNewProduct ? 'bg-amber-100 text-amber-600'
                                           : 'bg-stone-100 text-stone-600';

                                        const TypeIcon = isPlaced ? FaBoxOpen 
                                           : isCancelled ? FaTimesCircle 
                                           : notif.type === 'New User' ? FaUser 
                                           : notif.type === 'New Seller' ? FaShopify 
                                           : isNewProduct ? FaBoxOpen 
                                           : FaExclamationTriangle;

                                        const typeBadge = isPlaced
                                           ? 'bg-emerald-50 text-emerald-700'
                                           : isCancelled ? 'bg-red-50 text-red-600'
                                           : isRegistration ? 'bg-indigo-50 text-indigo-700'
                                           : isNewProduct ? 'bg-amber-50 text-amber-700'
                                           : 'bg-stone-50 text-stone-700';

                                        return (
                                           <div
                                              key={notif.notification_id}
                                              className={`p-4 hover:bg-stone-50 transition-colors flex gap-3 ${!notif.is_read ? 'bg-indigo-50/20 border-l-4 border-indigo-400' : 'border-l-4 border-transparent'}`}
                                           >
                                              {/* Icon */}
                                              <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${iconBg}`}>
                                                 <TypeIcon size={15} />
                                              </div>

                                              {/* Content */}
                                              <div className="flex-1 min-w-0">
                                                 <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${typeBadge}`}>
                                                       {notif.type}
                                                    </span>
                                                    <span className="text-[9px] text-stone-400 font-bold shrink-0">
                                                       {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                 </div>

                                                 <p className="text-xs text-stone-600 leading-relaxed mb-1 truncate">
                                                    <span className="font-bold text-stone-800">{notif.customer_name || notif.seller_name || 'System'}:</span>{' '}
                                                    {notif.message}
                                                 </p>

                                                 <div className="flex items-center gap-2 flex-wrap">
                                                    {notif.order_id && (
                                                       <span className="text-[9px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                                                          {notif.order_id}
                                                       </span>
                                                    )}
                                                    {notif.order_status && (
                                                       <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                                                          notif.order_status === 'Cancelled' ? 'bg-red-50 text-red-500'
                                                          : notif.order_status === 'Delivered' ? 'bg-emerald-50 text-emerald-600'
                                                          : notif.order_status === 'Shipped' ? 'bg-blue-50 text-blue-600'
                                                          : 'bg-amber-50 text-amber-600'
                                                       }`}>
                                                          {notif.order_status}
                                                       </span>
                                                    )}
                                                    {!notif.is_read && (
                                                       <button
                                                          onClick={() => markAsRead(notif.notification_id)}
                                                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors"
                                                       >
                                                          <FaCheck size={7} /> Read
                                                       </button>
                                                    )}
                                                 </div>
                                              </div>
                                           </div>
                                        );
                                     })
                                  ) : (
                                     <div className="p-14 text-center">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                                           <FaBell size={26} />
                                        </div>
                                        <p className="text-sm font-bold text-stone-400">No order activity yet</p>
                                        <p className="text-xs text-stone-300 mt-1">Orders, updates & cancellations will appear here</p>
                                     </div>
                                  )}
                               </div>

                               {/* Footer */}
                               {notifications.length > 0 && (
                                  <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
                                     <p className="text-[10px] text-stone-400 font-semibold">{notifications.length} total events</p>
                                      <button onClick={() => { setActiveTab('orders'); setShowNotifDropdown(false); }} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors">
                                         View all orders
                                     </button>
                                  </div>
                               )}
                            </motion.div>
                        )}
                     </AnimatePresence>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-stone-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                     <span className="text-xs font-bold text-stone-500">ADM</span>
                  </div>
               </div>
            </header>

            <div className="p-8 bg-[#fafafa] min-h-full">
               <ActiveComponent />
            </div>
         </main>
      </div>
   );
}
