import React from "react";
import { motion } from "framer-motion";
import { FaClipboardList, FaBox, FaChartLine } from "react-icons/fa6";

export default function Overview({ setActiveTab, stats }) {
  return (
    <>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Welcome Back!, Dhinakar</h1>
          <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">Here's what's happening with your store today.</p>
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
            className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-stone-50 text-stone-900 group-hover:bg-amber-500 group-hover:text-white transition-colors`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-green-500">{stat.trend}</span>
            </div>
            <h3 className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.name}</h3>
            <p className="text-2xl font-black text-stone-900">{stat.value}</p>
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
              <h3 className="font-black text-stone-900 uppercase tracking-widest text-sm italic">Sales Overview</h3>
              <button onClick={() => setActiveTab('Analytics')} className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">Full Analytics</button>
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
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-black text-stone-900 uppercase tracking-widest text-sm italic">Recent Orders</h3>
              <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Last 24h</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black text-stone-900 uppercase tracking-widest">Order ID</th>
                    <th className="px-6 py-4 text-[9px] font-black text-stone-900 uppercase tracking-widest">Customer Name</th>
                    <th className="px-6 py-4 text-[9px] font-black text-stone-900 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-right text-[9px] font-black text-stone-900 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {[
                    { id: '#ORD-101', name: 'Sophia Loren', amount: '₹34,000', status: 'Shipped', color: 'bg-blue-100 text-blue-600' },
                    { id: '#ORD-102', name: 'Marcus Aurelius', amount: '₹18,499', status: 'Delivered', color: 'bg-green-100 text-green-600' },
                    { id: '#ORD-103', name: 'Elena Gilbert', amount: '₹34,999', status: 'Pending', color: 'bg-stone-100 text-stone-600' },
                    { id: '#ORD-104', name: 'Alexandar Graham', amount: '₹1,89,999', status: 'Processing', color: 'bg-amber-100 text-amber-600' },
                    { id: '#ORD-105', name: 'Liam Neeson', amount: '₹42,999', status: 'Delivered', color: 'bg-green-100 text-green-600' },
                  ].map((order, i) => (
                    <tr key={i} className="hover:bg-stone-50/50 transition-colors cursor-default">
                      <td className="px-6 py-4 font-black text-stone-900 text-xs tracking-tight">{order.id}</td>
                      <td className="px-6 py-4 font-bold text-stone-600 text-xs tracking-tight">{order.name}</td>
                      <td className="px-6 py-4 font-black text-stone-900 text-xs italic">{order.amount}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest ${order.color}`}>{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Top Selling Products */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-stone-900 uppercase tracking-widest text-sm italic">Top Rated Assets</h3>
            <button onClick={() => setActiveTab('Products')} className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { name: 'Quantum Watch X', price: '₹42,999', sales: 342, icon: FaBox },
              { name: 'Aura Headphones', price: '₹34,999', sales: 215, icon: FaBox },
              { name: 'Vertex Pro 16', price: '₹1,49,900', sales: 89, icon: FaBox },
              { name: 'Sonic Buds Pro', price: '₹18,499', sales: 450, icon: FaBox },
              { name: 'MagSafe Dock', price: '₹8,499', sales: 120, icon: FaBox },
            ].map((prod, i) => (
              <div key={i} className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-900 text-amber-500 rounded-xl flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                    <prod.icon size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black text-stone-900 uppercase tracking-tight block">{prod.name}</span>
                    <span className="text-[10px] font-bold text-stone-400 block">{prod.price}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-green-500 block">+{prod.sales}</span>
                  <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Gross Unit Sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
