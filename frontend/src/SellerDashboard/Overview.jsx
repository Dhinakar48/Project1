import React from "react";
import { motion } from "framer-motion";
import { FaClipboardList, FaBox, FaChartLine, FaBell } from "react-icons/fa6";

export default function Overview({ setActiveTab, stats, notifications, recentOrders, inventoryProducts, sellerName }) {
  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600">
             <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
             <span className="text-[9px] font-semibold">Live Dashboard</span>
             <button onClick={() => window.location.reload()} className="ml-4 px-2 py-1 bg-white border border-stone-200 text-stone-900 rounded-md text-[9px] font-bold hover:bg-stone-100">
               Force Reload
             </button>
          </div>
          {/* Debug Block */}
          {stats && stats.length > 0 && stats[0].value === '₹0' && (
             <div className="text-[10px] text-red-500 font-mono mt-2">
               DEBUG: Stats are still showing default zeros. Please click "Force Reload".
             </div>
          )}
          <h1 className="text-4xl font-semibold text-stone-900">
            Overview
          </h1>
          <p className="text-stone-400 text-[10px] font-semibold mt-1">
             Welcome Back, {sellerName || 'Seller'} <span className="mx-2 text-stone-200">|</span> Here's your store's status
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.id}
            onClick={() => setActiveTab(stat.tab)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative bg-white p-6 rounded-3xl border border-stone-100 shadow-sm transition-all group cursor-pointer hover:shadow-xl hover:shadow-stone-200/50 hover:border-amber-500/30 overflow-hidden"
          >
            {/* Subtle glow background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-stone-900 group-hover:bg-stone-900 group-hover:text-amber-500 group-hover:border-stone-900 transition-all shadow-sm">
                <stat.icon size={18} />
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[9px] font-semibold flex items-center gap-1 ${stat.trend.includes('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trend}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-3xl font-semibold text-stone-900 tracking-tight mb-1">{stat.value}</p>
              <h3 className="text-stone-400 text-[10px] font-bold">{stat.name}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders & Sales Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Overview Mini Chart */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-1000" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-semibold text-stone-900 text-sm">Sales Overview</h3>
              <button onClick={() => setActiveTab('Analytics')} className="text-[10px] font-semibold text-amber-600 hover:underline">Full Analytics</button>
            </div>
            <div className="h-48 relative z-10 group-hover:scale-[1.02] transition-transform duration-700">
              <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible drop-shadow-xl">
                <line x1="0" y1="150" x2="400" y2="150" stroke="#f5f5f4" strokeWidth="1" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#f5f5f4" strokeWidth="1" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#f5f5f4" strokeWidth="1" />

                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2 }}
                  d="M0 130 C 50 130, 80 80, 120 90 C 160 100, 200 40, 240 60 C 280 80, 320 20, 360 30 C 380 35, 390 10, 400 0 L 400 150 L 0 150 Z"
                  fill="url(#chartGradient)"
                />

                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  d="M0 130 C 50 130, 80 80, 120 90 C 160 100, 200 40, 240 60 C 280 80, 320 20, 360 30 C 380 35, 390 10, 400 0"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_4px_8px_rgba(245,158,11,0.4)]"
                />

                <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} cx="120" cy="90" r="4" fill="#fff" stroke="#f59e0b" strokeWidth="2" />
                <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} cx="240" cy="60" r="4" fill="#fff" stroke="#f59e0b" strokeWidth="2" />
                <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.4 }} cx="400" cy="0" r="6" fill="#fff" stroke="#f59e0b" strokeWidth="3" className="shadow-lg" />
              </svg>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden relative">
            <div className="p-8 border-b border-stone-50 flex items-center justify-between bg-stone-50/50">
              <div className="space-y-1">
                 <h3 className="font-semibold text-stone-900 text-sm">Recent Orders</h3>
                 <p className="text-[9px] font-bold text-stone-400">Latest transactions processed</p>
              </div>
              <button 
                onClick={() => setActiveTab('Orders')}
                className="px-4 py-2 bg-white border border-stone-200 text-stone-900 rounded-xl text-[9px] font-semibold hover:bg-stone-900 hover:text-white transition-all shadow-sm"
              >
                 View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white border-b border-stone-50">
                  <tr>
                    <th className="px-8 py-5 text-[9px] font-semibold text-stone-400">Order ID</th>
                    <th className="px-8 py-5 text-[9px] font-semibold text-stone-400">Customer Name</th>
                    <th className="px-8 py-5 text-[9px] font-semibold text-stone-400">Amount</th>
                    <th className="px-8 py-5 text-right text-[9px] font-semibold text-stone-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {(!recentOrders || recentOrders.length === 0) ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-10 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        No recent orders found
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order, i) => {
                      let color = 'bg-stone-50 text-stone-600 border-stone-200';
                      if (order.order_status === 'Delivered') color = 'bg-green-50 text-green-600 border-green-100';
                      else if (order.order_status === 'Shipped') color = 'bg-blue-50 text-blue-600 border-blue-100';
                      else if (order.order_status === 'Processing') color = 'bg-amber-50 text-amber-600 border-amber-100';

                      return (
                        <tr key={i} className="hover:bg-stone-50/80 transition-colors cursor-default group">
                          <td className="px-8 py-5 font-semibold text-stone-900 text-xs tracking-tight">
                             <span className="bg-stone-100 px-2.5 py-1 rounded-md">{order.order_id}</span>
                          </td>
                          <td className="px-8 py-5 font-bold text-stone-600 text-xs tracking-tight group-hover:text-amber-600 transition-colors">{order.customer_name || 'Anonymous'}</td>
                          <td className="px-8 py-5 font-semibold text-stone-900 text-sm">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</td>
                          <td className="px-8 py-5 text-right">
                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-semibold border ${color}`}>{order.order_status || 'Pending'}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Top Selling Products & Notifications */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-stone-900/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="space-y-1">
                 <h3 className="font-semibold text-stone-900 text-sm">Top Rated Assets</h3>
                 <p className="text-[9px] font-bold text-stone-400">Highest converting limits</p>
              </div>
              <button onClick={() => setActiveTab('Products')} className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-stone-900 hover:text-white transition-all">
                 <span className="text-xl leading-none -mt-1">›</span>
              </button>
            </div>
            <div className="space-y-4 flex-1 relative z-10">
              {(!inventoryProducts || inventoryProducts.length === 0) ? (
                <div className="py-10 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  No products available
                </div>
              ) : (
                inventoryProducts.slice(0, 5).map((prod, i) => (
                  <div key={prod.product_id || i} className="group p-3 rounded-2xl border border-transparent hover:border-stone-100 hover:bg-stone-50/50 flex items-center justify-between transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-100 rounded-xl overflow-hidden p-2 group-hover:scale-105 transition-transform border border-stone-200/50">
                         <img src={prod.main_image || '/placeholder-product.png'} alt={prod.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-stone-900 tracking-tight block truncate max-w-[120px]">{prod.name}</span>
                        <span className="text-[10px] font-bold text-stone-400 block">₹{parseFloat(String(prod.price).replace(/[^\d.]/g, '')).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold block ${prod.stock_quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>{prod.stock_quantity}</span>
                      <span className="text-[8px] font-semibold text-stone-400">In Stock</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Notifications Section */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="space-y-1">
                 <h3 className="font-semibold text-stone-900 text-sm">Recent Notifications</h3>
                 <p className="text-[9px] font-bold text-stone-400">Latest updates for you</p>
              </div>
              <button onClick={() => setActiveTab('Notifications')} className="text-[10px] font-semibold text-amber-600 hover:underline transition-all">View All</button>
            </div>
            <div className="space-y-4 flex-1 relative z-10">
              {notifications.slice(0, 3).map((n) => (
                <div key={n.notification_id} className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50/50 border border-transparent hover:border-stone-100 hover:bg-white transition-all cursor-default group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-110 ${!n.is_read ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-stone-100 text-stone-400'}`}>
                    <FaClipboardList size={14} />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-[11px] font-semibold leading-tight ${!n.is_read ? 'text-stone-900' : 'text-stone-500'}`}>{n.message}</p>
                    <p className="text-[9px] font-bold text-stone-300 uppercase tracking-tighter">{new Date(n.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="py-10 text-center space-y-3">
                  <FaBell className="mx-auto text-stone-100" size={32} />
                  <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">No recent alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
