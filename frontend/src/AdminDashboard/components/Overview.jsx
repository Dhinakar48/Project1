import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaChartLine, FaUsers, FaStore, FaBan, FaMoneyBillWave, FaArrowLeft, FaBoxOpen, FaEdit, FaTrashAlt, FaBarcode, FaTags, FaInfoCircle, FaCalendarAlt } from "react-icons/fa";

export default function Overview() {
   const [dashboardData, setDashboardData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [activeModal, setActiveModal] = useState(null);
   const [selectedProduct, setSelectedProduct] = useState(null);

   useEffect(() => {
      setLoading(true);
      axios.get("http://localhost:5000/api/admin/dashboard-stats")
         .then(res => {
            if (res.data.success) setDashboardData(res.data);
            setLoading(false);
         })
         .catch(err => {
            console.error("Dashboard fetch error", err);
            setLoading(false);
         });
   }, []);

   if (loading) return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-stone-400 font-bold">Synchronizing Database...</p>
      </div>
   );

   if (!dashboardData) return null;

   const statCards = [
      {
         id: "volume",
         title: "Total Volume",
         value: `₹${Number(dashboardData.stats.volume).toLocaleString()}`,
         icon: FaChartLine,
         trend: "up",
         change: "Live DB",
         color: "indigo",
         detail: { label: "Total revenue across all orders placed on the platform", extra: `${Number(dashboardData.stats.volume).toLocaleString()} INR processed` }
      },
      {
         id: "sellers",
         title: "Active Sellers",
         value: dashboardData.stats.sellers,
         icon: FaStore,
         trend: "up",
         change: "Live DB",
         color: "purple",
         detail: { label: "Total registered and active seller accounts", extra: `${dashboardData.stats.sellers} merchants onboarded` }
      },
      {
         id: "customers",
         title: "Customer Base",
         value: dashboardData.stats.customers,
         icon: FaUsers,
         trend: "up",
         change: "Live DB",
         color: "sky",
         detail: { label: "Total registered customer accounts on the platform", extra: `${dashboardData.stats.customers} unique shoppers` }
      },
      {
         id: "revenue",
         title: "Platform Revenue",
         value: `₹${Number(dashboardData.stats.platformRevenue).toLocaleString()}`,
         icon: FaMoneyBillWave,
         trend: "up",
         change: "Live DB",
         color: "emerald",
         detail: { label: "Platform commission earnings (5% of total volume)", extra: `₹${Number(dashboardData.stats.platformRevenue).toLocaleString()} earned` }
      },
      {
         id: "blocked",
         title: "Blocked Accounts",
         value: dashboardData.stats.blockedCustomers,
         icon: FaBan,
         trend: "down",
         change: "Restricted Access",
         color: "rose",
         detail: { label: "Customer accounts currently restricted by admin", extra: `${dashboardData.stats.blockedCustomers} accounts suspended` }
      },
   ];

   const colorMap = {
      indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", icon: "bg-indigo-100 text-indigo-500", grad: "from-indigo-500/10" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", icon: "bg-purple-100 text-purple-500", grad: "from-purple-500/10" },
      sky: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200", icon: "bg-sky-100 text-sky-500", grad: "from-sky-500/10" },
      emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", icon: "bg-emerald-100 text-emerald-500", grad: "from-emerald-500/10" },
      rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", icon: "bg-rose-100 text-rose-500", grad: "from-rose-500/10" },
   };

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

         {/* Stat Detail Modal */}
         <AnimatePresence>
            {activeModal && (() => {
               const card = statCards.find(c => c.id === activeModal);
               const cm = colorMap[card.color];
               const Icon = card.icon;
               return (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                     onClick={() => setActiveModal(null)}
                  >
                     <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl"
                        onClick={e => e.stopPropagation()}
                     >
                        <div className="flex justify-between items-start mb-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${cm.icon}`}>
                              <Icon />
                           </div>
                           <button onClick={() => setActiveModal(null)} className="text-stone-400 hover:text-stone-900 transition-colors">
                              <FaTimes size={18} />
                           </button>
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-stone-400 mb-1">{card.title}</h3>
                        <div className={`text-4xl font-black tracking-tight mb-4 ${cm.text}`}>{card.value}</div>
                        <p className="text-sm text-stone-500 leading-relaxed mb-3">{card.detail.label}</p>
                        <div className={`${cm.bg} ${cm.border} border rounded-2xl px-4 py-3 text-sm font-bold ${cm.text}`}>
                           {card.detail.extra}
                        </div>
                     </motion.div>
                  </motion.div>
               );
            })()}
         </AnimatePresence>

         {/* Product Detail Modal */}
         <AnimatePresence>
            {selectedProduct && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setSelectedProduct(null)}
               >
                  <motion.div
                     initial={{ scale: 0.9, y: 20 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.9, y: 20 }}
                     className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl"
                     onClick={e => e.stopPropagation()}
                  >
                     <div className="flex items-center justify-between mb-6">
                        <div>
                           <h3 className="text-xl font-black text-stone-900">{selectedProduct.name}</h3>
                           <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-0.5">{selectedProduct.product_id}</p>
                        </div>
                        <button onClick={() => setSelectedProduct(null)} className="w-9 h-9 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">
                           <FaTimes size={16} />
                        </button>
                     </div>

                     {/* Product Image */}
                     {selectedProduct.images?.[0] && (
                        <div className="w-full h-48 bg-stone-50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden border border-stone-100">
                           <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="max-h-full max-w-full object-contain p-4" />
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-indigo-50 rounded-2xl p-4">
                           <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Sales Units</p>
                           <p className="text-2xl font-black text-indigo-700">{selectedProduct.sales}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-2xl p-4">
                           <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Revenue</p>
                           <p className="text-2xl font-black text-emerald-700">₹{Number(selectedProduct.rev).toLocaleString()}</p>
                        </div>
                     </div>

                     <div className="space-y-2">
                        {selectedProduct.brand && (
                           <div className="flex justify-between items-center px-4 py-2.5 bg-stone-50 rounded-xl text-sm">
                              <span className="font-bold text-stone-500 flex items-center gap-2"><FaTags size={11} /> Brand</span>
                              <span className="font-black text-stone-900">{selectedProduct.brand}</span>
                           </div>
                        )}
                        {selectedProduct.category_name && (
                           <div className="flex justify-between items-center px-4 py-2.5 bg-stone-50 rounded-xl text-sm">
                              <span className="font-bold text-stone-500 flex items-center gap-2"><FaInfoCircle size={11} /> Category</span>
                              <span className="font-black text-stone-900">{selectedProduct.category_name}</span>
                           </div>
                        )}
                        <div className="flex justify-between items-center px-4 py-2.5 bg-stone-50 rounded-xl text-sm">
                           <span className="font-bold text-stone-500 flex items-center gap-2"><FaBarcode size={11} /> Rank</span>
                           <span className="font-black text-amber-600">#{selectedProduct.rank}</span>
                        </div>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Sales Overview */}
         <div>
            <h3 className="text-sm font-bold text-stone-900 mb-4 tracking-tight">Sales Overview <span className="text-stone-400 font-normal text-xs ml-1">— click a card for details</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
               {statCards.map(card => {
                  const cm = colorMap[card.color];
                  const Icon = card.icon;
                  return (
                     <button
                        key={card.id}
                        onClick={() => setActiveModal(card.id)}
                        className={`bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm relative overflow-hidden group text-left transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]`}
                     >
                        <div className={`absolute inset-0 bg-gradient-to-br ${cm.grad} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${cm.icon}`}>
                           <Icon size={15} />
                        </div>
                        <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">{card.title}</h3>
                        <div className="text-2xl font-black text-stone-900 tracking-tight">{card.value}</div>
                        <div className={`text-[10px] font-bold mt-2 ${card.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {card.change}
                        </div>
                        <div className={`absolute bottom-3 right-3 text-[9px] font-black uppercase tracking-widest ${cm.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                           View details →
                        </div>
                     </button>
                  );
               })}
            </div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm col-span-1">
               <h3 className="text-sm font-bold text-stone-900 mb-6 tracking-tight">Traffic Source</h3>
               <div className="w-full flex items-center justify-center">
                  <TrafficDonutChart />
               </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm col-span-1 xl:col-span-2">
               <h3 className="text-sm font-bold text-stone-900 mb-6 tracking-tight">Recent Activity</h3>
               <div className="space-y-2">
                  {dashboardData.recentActivity.length > 0 ? dashboardData.recentActivity.map((act, i) => (
                     <ActivityRow key={i} time={act.time} action={act.action} detail={act.detail} />
                  )) : <p className="text-stone-400 text-sm">No recent activity.</p>}
               </div>
            </div>
         </div>

         {/* Top Performing Products */}
         <div>
            <h3 className="text-sm font-bold text-stone-900 mb-4 tracking-tight">
               Top Performing Products <span className="text-stone-400 font-normal text-xs ml-1">— click for product details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {dashboardData.topProducts.length > 0 ? dashboardData.topProducts.map((prod, i) => (
                  <TopProductCard
                     key={i}
                     rank={i + 1}
                     product={prod}
                     onClick={() => setSelectedProduct({ ...prod, rank: i + 1 })}
                  />
               )) : <p className="text-stone-400 text-sm">No top products data yet.</p>}
            </div>
         </div>
      </div>
   );
}

function StatCard({ title, value, change, trend, color = "indigo" }) {
   const colorClass = color === 'rose' ? 'from-rose-500/5' : 'from-indigo-500/5';
   const trendClass = trend === 'up' ? 'text-emerald-500' : 'text-rose-500';

   return (
      <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm relative overflow-hidden group">
         <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
         <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">{title}</h3>
         <div className="text-3xl font-bold text-stone-900 tracking-tight">{value}</div>
         <div className={`text-[10px] font-bold mt-2 inline-flex items-center gap-1 ${trendClass}`}>
            {change}
         </div>
      </div>
   );
}

function TrafficDonutChart() {
   const [isAnimated, setIsAnimated] = React.useState(false);

   React.useEffect(() => {
      const timer = setTimeout(() => setIsAnimated(true), 150);
      return () => clearTimeout(timer);
   }, []);

   const data = [
      { source: "Direct", percentage: 45, color: "#6366f1" },
      { source: "Social", percentage: 28, color: "#a855f7" },
      { source: "Referral", percentage: 15, color: "#f59e0b" },
      { source: "Organic", percentage: 12, color: "#10b981" },
   ];

   let cumulativePercent = 0;
   
   return (
      <div className="flex flex-col items-center w-full">
         <div className="relative w-48 h-48 mb-8">
            <svg 
               viewBox="0 0 36 36" 
               className={`w-full h-full drop-shadow-xl transition-transform duration-[1500ms] ease-out ${isAnimated ? 'transform -rotate-90 scale-100' : 'transform rotate-90 scale-90'}`}
            >
               <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f5f5f4" strokeWidth="3" />
               {data.map((item, index) => {
                  const targetDasharray = `${item.percentage} ${100 - item.percentage}`;
                  const strokeDasharray = isAnimated ? targetDasharray : `0 100`;
                  const strokeDashoffset = -cumulativePercent + 100;
                  cumulativePercent += item.percentage;

                  return (
                     <circle
                        key={index}
                        cx="18"
                        cy="18"
                        r="15.91549430918954"
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="3"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-[1200ms] ease-out cursor-pointer hover:stroke-4 hover:opacity-80"
                        style={{ transitionDelay: `${index * 150}ms` }}
                     />
                  );
               })}
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-1000 delay-500 ${isAnimated ? 'opacity-100' : 'opacity-0'}`}>
               <span className="text-3xl font-black text-stone-900 tracking-tighter">100<span className="text-lg text-stone-400">%</span></span>
               <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">Total Traffic</span>
            </div>
         </div>

         <div className="w-full grid grid-cols-2 gap-3">
            {data.map((item, i) => (
               <div 
                  key={i} 
                  className={`flex items-center gap-3 p-3 rounded-2xl bg-stone-50/50 hover:bg-white border border-stone-100/50 hover:border-stone-200 transition-all shadow-sm duration-500 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${800 + i * 100}ms` }}
               >
                  <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                  <div>
                     <div className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">{item.source}</div>
                     <div className="text-sm font-black text-stone-900">{item.percentage}%</div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

function ActivityRow({ time, action, detail }) {
   return (
      <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100">
         <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
         <div>
            <h4 className="text-sm font-bold text-stone-900">{action}</h4>
            <p className="text-xs text-stone-500 mt-1">{detail}</p>
         </div>
         <div className="ml-auto text-[10px] font-bold text-stone-400 uppercase tracking-widest">{time}</div>
      </div>
   );
}

function TopProductCard({ rank, product, onClick }) {
   return (
      <button
         onClick={onClick}
         className="bg-white p-5 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-4 group hover:border-indigo-200 hover:shadow-md transition-all w-full text-left active:scale-[0.98]"
      >
         <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center font-black text-stone-300 group-hover:text-indigo-400 group-hover:bg-indigo-50 transition-colors shrink-0 text-lg">
            #{rank}
         </div>
         <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-stone-900 truncate">{product.name}</h4>
            <div className="flex gap-3 mt-1 text-xs">
               <span className="font-semibold text-stone-500">{product.sales} Units</span>
               <span className="text-stone-300">|</span>
               <span className="font-bold text-emerald-500">₹{Number(product.rev).toLocaleString()}</span>
            </div>
         </div>
         <div className="text-stone-300 group-hover:text-indigo-400 transition-colors shrink-0">
            <FaInfoCircle size={14} />
         </div>
      </button>
   );
}
