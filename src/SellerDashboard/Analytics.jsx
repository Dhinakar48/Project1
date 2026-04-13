import React from "react";
import { motion } from "framer-motion";

export default function Analytics({ timeRange, setTimeRange, setActiveTab }) {
   return (
      <div className="space-y-12 animate-in fade-in zoom-in-95 duration-1000">
         {/* Top Header */}
         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 overflow-hidden">
            <div className="space-y-2">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[9px] font-semibold">Performance Metrics</span>
               </div>
               <h1 className="text-4xl font-semibold text-stone-900">
                  Analytics
               </h1>
            </div>

            {/* High-End Time Range Toggle */}
            <div className="flex items-center gap-2 bg-stone-100/50 p-1.5 rounded-[2rem] border border-stone-200/50 backdrop-blur-sm">
               {['Today', 'Monthly', 'Yearly'].map((range) => (
                  <button
                     key={range}
                     onClick={() => setTimeRange(range)}
                     className={`px-6 py-2.5 rounded-xl text-[10px] font-semibold   transition-all ${timeRange === range
                        ? 'bg-stone-900 text-amber-500 shadow-xl shadow-stone-900/20'
                        : 'text-stone-400 hover:text-stone-900 hover:bg-white'
                        }`}
                  >
                     {range}
                  </button>
               ))}
            </div>
         </div>

         {/* Redesigned Revenue Flow Section (Bar Chart Style) */}
         <div className="bg-white rounded-[2.5rem] border border-stone-100 p-6 md:p-8 relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-colors duration-1000 -mr-20 -mt-20" />

            <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 relative z-10 gap-4">
               <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-stone-900 tracking-tight">
                     Revenue Protocol
                  </h3>
                  <div className="flex gap-3">
                     <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_#f59e0b]" />
                        <span className="text-[9px] font-semibold text-stone-500">Gross</span>
                     </div>

                  </div>
               </div>
               <div className="text-right">
                  <span className="text-[9px] font-semibold text-stone-400 block mb-1">Total Accumulated</span>
                  <span className="text-4xl font-semibold text-stone-900 drop-shadow-sm">
                     {timeRange === 'Today' ? '₹84,200' : timeRange === 'Monthly' ? '₹24.5L' : '₹3.8Cr'}
                  </span>
                  <p className="text-[10px] font-semibold text-green-500 mt-1 flex items-center justify-end gap-1">
                     <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>+14.2% Growth</motion.span>
                  </p>
               </div>
            </div>

            {/* SLEEK BAR GRAPH AREA */}
            <div className="relative h-[180px] w-full flex items-end justify-between gap-2 sm:gap-4 mt-6 z-10">
               {/* Background horizontal grid lines */}
               <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3].map(i => (
                     <div key={i} className="w-full h-px bg-stone-100" />
                  ))}
               </div>

               {/* Dynamic Bars */}
               {(() => {
                  const data = timeRange === 'Today'
                     ? [40, 65, 30, 85, 50, 95]
                     : timeRange === 'Monthly'
                        ? [50, 70, 85, 45, 90, 60, 100, 75]
                        : [60, 80, 40, 100];
                  const labels = timeRange === 'Today'
                     ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
                     : timeRange === 'Monthly'
                        ? ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']
                        : ['Q1', 'Q2', 'Q3', 'Q4'];

                  return data.map((val, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar cursor-pointer">
                        <div className="w-full relative flex items-end justify-center h-[85%]">
                           {/* Gross Bar (taller behind) */}
                           <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${val}%` }}
                              transition={{ duration: 1.2, delay: i * 0.1, type: "spring", bounce: 0.3 }}
                              className="absolute bottom-0 w-[90%] max-w-[65px] bg-amber-500 rounded-t-md transition-colors group-hover/bar:bg-amber-400"
                           />


                           {/* Hover Tooltip/Value */}
                           <div className="absolute -top-8 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                              <span className="bg-stone-900 text-white text-[9px] font-semibold px-2 py-1 rounded shadow-md">
                                 {val * 10}k
                              </span>
                           </div>
                        </div>
                        <span className="text-[8px] font-semibold text-stone-400 group-hover/bar:text-amber-500 transition-colors mt-1">
                           {labels[i]}
                        </span>
                     </div>
                  ));
               })()}
            </div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Rev vs Orders */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
               <h3 className="font-semibold text-stone-900 text-sm mb-1">Conversion Ratio</h3>
               <p className="text-[9px] font-bold text-stone-400">Revenue vs Orders metrics</p>

               <div className="my-10 h-32 flex items-end justify-center gap-6 relative z-10">
                  <div className="w-16 bg-stone-100 rounded-t-2xl relative overflow-hidden h-full group/bar">
                     <motion.div initial={{ height: 0 }} animate={{ height: '80%' }} transition={{ duration: 1, delay: 0.2 }} className="absolute bottom-0 w-full bg-stone-900 rounded-t-2xl group-hover/bar:bg-stone-800 transition-colors" />
                  </div>
                  <div className="w-16 bg-stone-100 rounded-t-2xl relative overflow-hidden h-full group/bar">
                     <motion.div initial={{ height: 0 }} animate={{ height: '40%' }} transition={{ duration: 1, delay: 0.4 }} className="absolute bottom-0 w-full bg-amber-500 rounded-t-2xl group-hover/bar:bg-amber-400 transition-colors" />
                  </div>
               </div>

               <div className="flex justify-center gap-12 text-center relative z-10 border-t border-stone-50 pt-6">
                  <div>
                     <span className="text-[9px] font-semibold text-stone-400 block mb-1">Revenue</span>
                     <span className="text-xl font-semibold text-stone-900">80%</span>
                  </div>
                  <div>
                     <span className="text-[9px] font-semibold text-amber-500 block mb-1">Orders</span>
                     <span className="text-xl font-semibold text-stone-900">40%</span>
                  </div>
               </div>
            </div>

            {/* Category Spread */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm col-span-1 xl:col-span-2 relative overflow-hidden group">
               <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-10 relative z-10 gap-4">
                  <div>
                     <h3 className="font-semibold text-stone-900 text-sm mb-1">Category Dominance</h3>
                     <p className="text-[9px] font-bold text-stone-400">Market sector analysis</p>
                  </div>
                  <div className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                     Computing leads by +20%
                  </div>
               </div>

               <div className="space-y-6 relative z-10">
                  {[
                     { cat: 'Computing', val: '45%', color: 'from-stone-800 to-stone-900', sales: '840 units' },
                     { cat: 'Wearables', val: '25%', color: 'from-amber-400 to-amber-500', sales: '512 units' },
                     { cat: 'Audio', val: '20%', color: 'from-stone-300 to-stone-400', sales: '320 units' },
                     { cat: 'Accessories', val: '10%', color: 'from-stone-100 to-stone-200', sales: '145 units' },
                  ].map((item, i) => (
                     <div key={i} className="group/item">
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-[10px] font-semibold text-stone-900">{item.cat} <span className="text-stone-300 ml-2">({item.sales})</span></span>
                           <span className="text-[11px] font-semibold text-stone-900">{item.val}</span>
                        </div>
                        <div className="h-3 w-full bg-stone-50 rounded-full overflow-hidden p-0.5 border border-stone-100">
                           <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: item.val }}
                              transition={{ duration: 1.5, delay: i * 0.15 }}
                              className={`h-full rounded-full bg-gradient-to-r ${item.color} group-hover/item:brightness-110 shadow-sm`}
                           />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm p-8 flex flex-col h-[400px]">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h3 className="font-semibold text-stone-900 text-sm mb-1">Live Feed</h3>
                     <p className="text-[9px] font-bold text-stone-400">System event streams</p>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                     </span>
                     <span className="text-[8px] font-semibold leading-none mt-[1px]">Live</span>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-stone-200">
                  {[
                     { event: 'Order Dispatched', asset: '#ORD-99XZ', val: '₹42,999', time: 'Just Now', icon: '📦' },
                     { event: 'New Registration', asset: 'elena@example.com', val: 'Client', time: '2m ago', icon: '👤' },
                     { event: 'Restock Required', asset: 'Sonic Buds Pro', val: 'Critical', time: '14m ago', icon: '⚠️' },
                     { event: 'Payment Settled', asset: '#TRX-4421', val: '₹1,89,999', time: '1h ago', icon: '💰' },
                     { event: 'Review Added', asset: 'Vertex Pro 16', val: '5 Stars', time: '2h ago', icon: '⭐' },
                  ].map((evt, i) => (
                     <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100/50 hover:bg-white hover:shadow-md transition-all group"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-xl border border-stone-100 text-base group-hover:scale-110 transition-transform">
                              {evt.icon}
                           </div>
                           <div>
                              <span className="text-[10px] font-semibold text-stone-900 block">{evt.event}</span>
                              <span className="text-[9px] font-bold text-stone-400">{evt.asset}</span>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="text-sm font-semibold text-stone-900 block">{evt.val}</span>
                           <span className="text-[8px] font-semibold text-stone-400">{evt.time}</span>
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div>

            <div className="bg-stone-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between text-white relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />

               <div className="relative z-10">
                  <h4 className="text-[12px] font-semibold text-amber-500 mb-2">Product Alpha</h4>
                  <p className="text-[9px] font-medium text-stone-400 mb-8">Top performing inventory</p>

                  <div className="space-y-6">
                     {[
                        { name: 'Quantum Watch X', rev: '₹4.3M', color: 'bg-green-500' },
                        { name: 'Vertex Pro 16', rev: '₹14.9M', color: 'bg-blue-500' },
                        { name: 'Aura Headset', rev: '₹2.1M', color: 'bg-purple-500' },
                     ].map((prod, i) => (
                        <div key={i} className="group/item flex items-center gap-4 cursor-default border-b border-stone-800/50 pb-5 last:border-0 last:pb-0">
                           <div className={`w-1.5 h-1.5 ${prod.color} rounded-full flex-shrink-0 group-hover/item:scale-150 transition-transform shadow-[0_0_8px_currentColor]`} />
                           <div className="flex-1">
                              <span className="text-xs font-semibold block text-stone-100">{prod.name}</span>
                           </div>
                           <span className="text-[10px] font-semibold text-stone-900 bg-amber-500 px-2 py-1 rounded-md">{prod.rev}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <button onClick={() => setActiveTab('Products')} className="w-full mt-8 bg-white text-stone-900 py-4 rounded-2xl font-semibold text-[10px] hover:bg-stone-100 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/10 relative z-10">
                  Manage Inventory
               </button>
            </div>
         </div>
      </div>
   );
}
