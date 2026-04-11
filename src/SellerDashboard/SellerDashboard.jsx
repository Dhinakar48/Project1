import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaBox, FaChartLine, FaUsers, FaArrowTrendUp,
  FaPlus, FaEllipsisVertical, FaBell, FaPen,
  FaArrowRightFromBracket, FaGear, FaHouse, FaDownload, FaClipboardList,
  FaStar
} from "react-icons/fa6";
import { FaSearch, FaTimes, FaArrowRight, FaGlobe, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import sellerData from "./sellerData.js";

// Modular Components
import Overview from "./Overview";
import Products from "./Products";
import Orders from "./Orders";
import Customers from "./Customers";
import Analytics from "./Analytics";
import Reviews from "./Reviews";
import Settings from "./Settings";

const stats = [
  { id: 1, name: 'Total Revenue', value: '₹4,82,900', icon: FaChartLine, trend: '+12.5%', color: 'amber', tab: 'Analytics' },
  { id: 2, name: 'Total Orders', value: '142', icon: FaClipboardList, trend: '+8.2%', color: 'stone', tab: 'Orders' },
  { id: 3, name: 'Active Customers', value: '892', icon: FaUsers, trend: '+14.1%', color: 'amber', tab: 'Customers' },
  { id: 4, name: 'Total Products', value: '24', icon: FaBox, trend: '+4 New', color: 'stone', tab: 'Products' },
];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('sellerActiveTab') || 'Overview';
  });

  useEffect(() => {
    localStorage.setItem('sellerActiveTab', activeTab);
  }, [activeTab]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeRange, setTimeRange] = useState('Today');
  const [globalSearch, setGlobalSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [viewedCustomer, setViewedCustomer] = useState(null);
  const [inventoryProducts, setInventoryProducts] = useState(sellerData.inventoryProducts);



  const downloadReceipt = (p) => {
    const data = `Product: ${p.name}\nCategory: ${p.category}\nPrice: ${p.price}\nStock: ${p.stock}\nGenerated on: ${new Date().toLocaleString()}`;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${p.name}_receipt.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen bg-stone-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-white hidden lg:flex flex-col p-6 h-full flex-shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-105">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-stone-900">
            <FaBox size={16} />
          </div>
          <span className="text-lg font-semibold text-amber-500">ElectroSeller</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { name: 'Overview', icon: FaHouse },
            { name: 'Products', icon: FaBox },
            { name: 'Orders', icon: FaClipboardList },
            { name: 'Analytics', icon: FaChartLine },
            { name: 'Customers', icon: FaUsers },
            { name: 'Reviews', icon: FaStar },
            { name: 'Settings', icon: FaGear },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.name
                  ? 'bg-amber-500 text-stone-900 shadow-lg shadow-amber-500/20'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                }`}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-stone-800 flex flex-col gap-4">
           <button 
             onClick={() => window.location.href = '/seller-login'}
             className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-stone-400 hover:bg-red-500/10 hover:text-red-500 transition-all group"
           >
             <FaArrowRightFromBracket size={18} className="text-stone-600 group-hover:text-red-500 transition-colors" />
             Logout
           </button>
           <p className="text-[10px] font-semibold text-stone-700 text-center opacity-30 hover:opacity-100 transition-opacity">Neural Terminal v1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-[50] shadow-sm">
          <div className="flex items-center gap-4 lg:hidden">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-amber-500">
              <FaBox size={16} />
            </div>
          </div>

          <div className="w-1/3">
             <h2 className="text-xl font-semibold text-stone-900 tracking-tight hidden sm:block">
               Seller <span className="text-amber-600">Dashboard</span>
             </h2>
          </div>

          <div className="flex-1" />

          <div className="w-1/3 flex items-center gap-4 justify-end">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group ${showNotifications ? 'bg-amber-100 text-amber-600' : 'text-stone-400 hover:text-amber-600 hover:bg-amber-50'}`}
              >
                <FaBell size={18} className={`${showNotifications ? '' : 'group-hover:rotate-[15deg]'} transition-transform`} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-600 rounded-full border-2 border-white animate-pulse"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                    <h4 className="font-semibold text-stone-900 text-[10px]">Real-time Alerts</h4>
                    <span className="text-[10px] font-semibold text-amber-600">3 New</span>
                  </div>
                  <div className="divide-y divide-stone-200 max-h-[350px] overflow-y-auto">
                    {[
                      { title: 'New Order Received', desc: 'Order #ORD-882 awaits processing', time: '2m ago', icon: '📦' },
                      { title: 'Inventory Alert', desc: 'Sonic Buds Pro stock is critical (2 units)', time: '14m ago', icon: '⚠️' },
                      { title: 'Payment Settled', desc: 'Payout of ₹84,200 cleared', time: '2h ago', icon: '💰' },
                    ].map((n, i) => (
                      <div key={i} className="p-5 hover:bg-stone-50 transition-colors cursor-pointer group">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-lg">{n.icon}</div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-stone-900 text-[11px] mb-0.5">{n.title}</h5>
                            <p className="text-[10px] font-bold text-stone-400 leading-tight">{n.desc}</p>
                            <span className="text-[8px] font-semibold text-stone-300 mt-2 block">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowNotifications(false)} className="w-full p-4 text-[9px] font-semibold text-stone-400 hover:bg-stone-50 transition-colors border-t border-stone-50">Close Feed</button>
                </div>
              )}
            </div>

            <div className="relative">
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 bg-amber-100 rounded-[1rem] flex items-center justify-center text-amber-700 font-semibold text-xs border border-amber-200 cursor-pointer hover:bg-white hover:border-amber-400 transition-all group active:scale-95"
              >
                D
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-stone-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-5 border-b border-stone-100 bg-stone-50/50">
                    <span className="text-[10px] font-semibold text-stone-400 block mb-1">Signed in as</span>
                    <span className="text-xs font-semibold text-stone-900">Dhinakar</span>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => { setActiveTab('Settings'); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-[10px] font-semibold text-stone-500 hover:text-amber-600 transition-all group"
                    >
                      <FaGear size={14} className="text-stone-300 group-hover:text-amber-600 transition-colors" />
                      Account Settings
                    </button>
                    <button 
                      onClick={() => { setActiveTab('Overview'); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-[10px] font-semibold text-stone-500 hover:text-amber-600 transition-all group"
                    >
                      <FaUser size={14} className="text-stone-300 group-hover:text-amber-600 transition-colors" />
                      Public Profile
                    </button>
                    <div className="my-2 border-t border-stone-50" />
                    <button 
                      onClick={() => window.location.href = '/seller-login'}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-[10px] font-semibold text-red-400 hover:text-red-500 transition-all group"
                    >
                      <FaArrowRightFromBracket size={14} className="text-red-300 group-hover:text-red-500 transition-colors" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Global Modals */}
        <AnimatePresence>


          {viewedCustomer && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <div className="flex justify-between items-center mb-10 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-semibold text-xl shadow-lg border border-white/50 ${viewedCustomer.color}`}>
                      {viewedCustomer.id}
                    </div>
                    <div>
                      <h3 className="font-semibold text-3xl text-stone-900">{viewedCustomer.name}</h3>
                      <p className="text-[10px] font-semibold text-stone-400 ml-1">Lifetime Value: {viewedCustomer.spend}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewedCustomer(null)} className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center border border-stone-100 text-stone-400 hover:text-stone-900 hover:shadow-xl hover:bg-white transition-all"><FaTimes size={16} /></button>
                </div>

                <div className="space-y-6 relative z-10">
                  <h4 className="text-[10px] font-semibold text-amber-600 block border-b border-stone-100 pb-3">Dossier / Financial Footprint</h4>
                  <div className="bg-stone-50 rounded-[2rem] border border-stone-100 p-2 overflow-hidden shadow-inner">
                    <div className="flex items-center justify-between p-6 hover:bg-white transition-all rounded-3xl cursor-default group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-stone-900 rounded-[1.25rem] flex items-center justify-center text-amber-500 shadow-md transform group-hover:scale-105 transition-transform"><FaBox size={16} /></div>
                        <div>
                          <span className="font-semibold text-stone-900 block text-lg tracking-tight">{viewedCustomer.order}</span>
                          <span className="text-[10px] font-semibold text-stone-400">ORD-{viewedCustomer.id}-A101</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-stone-900 block text-lg">{viewedCustomer.spend}</span>
                        <span className="text-[9px] font-semibold text-green-500">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dash Content */}
        <div className="p-6 space-y-8">
          {activeTab === 'Overview' && <Overview setActiveTab={setActiveTab} stats={stats} />}

          {activeTab === 'Products' && (
            <Products 
              inventoryProducts={inventoryProducts}
              setInventoryProducts={setInventoryProducts}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              globalSearch={globalSearch}
              downloadReceipt={downloadReceipt}
            />
          )}

          {activeTab === 'Orders' && <Orders globalSearch={globalSearch} />}

          {activeTab === 'Customers' && <Customers globalSearch={globalSearch} setViewedCustomer={setViewedCustomer} />}

          {activeTab === 'Analytics' && <Analytics timeRange={timeRange} setTimeRange={setTimeRange} setActiveTab={setActiveTab} />}

          {activeTab === 'Reviews' && <Reviews />}

          {activeTab === 'Settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}
