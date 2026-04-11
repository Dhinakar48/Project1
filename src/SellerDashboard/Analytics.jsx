import React from "react";
import { motion } from "framer-motion";

export default function Analytics({ timeRange, setTimeRange, setActiveTab }) {
  return (
    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter uppercase italic">
            Sales insights
          </h1>
        </div>

        {/* High-End Time Range Toggle */}
        <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200/50">
          {['Today', 'Monthly', 'Yearly'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${timeRange === range
                  ? 'bg-stone-900 text-amber-500 shadow-xl shadow-stone-900/20'
                  : 'text-stone-400 hover:text-stone-900 hover:bg-white'
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Cinematic Graph Section */}
      <div className="grid grid-cols-1 gap-12">
        <div className="bg-stone-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-stone-900/50 group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] -mr-[300px] -mt-[300px] group-hover:bg-amber-500/20 transition-all duration-1000" />

          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="space-y-1">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                {timeRange} <span className="text-amber-500">Flux</span>
              </h3>
              <p className="text-stone-500 text-[10px] font-black uppercase tracking-[0.3em]">
                {timeRange === 'Today' ? 'Live Intra-Day Velocity' : timeRange === 'Monthly' ? '30-Day Growth Vector' : 'Year-Over-Year Macro Scalability'}
              </p>
            </div>
            <div className="hidden md:flex gap-4">
              <div className="flex items-center gap-4 bg-stone-800/50 px-6 py-3 rounded-2xl border border-stone-700/30">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_8px_#f59e0b]" />
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Revenue Flow</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-[250px] w-full group/graph">
            <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible">
              {/* Dynamic Path based on TimeRange */}
              <motion.path
                key={timeRange + "-bg"}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.2 }}
                transition={{ duration: 1.5 }}
                d={timeRange === 'Today'
                  ? "M0 240 Q 200 280, 400 200 T 800 220 T 1000 180"
                  : timeRange === 'Monthly'
                    ? "M0 240 Q 150 200, 300 250 T 600 180 T 900 140 L 1000 160"
                    : "M0 260 Q 300 250, 500 100 T 800 80 T 1000 20"}
                fill="none"
                stroke="#78716c"
                strokeWidth="3"
                className="[stroke-dasharray:10_10] animate-[dash_20s_linear_infinite]"
              />

              <motion.path
                key={timeRange + "-main"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "circOut" }}
                d={timeRange === 'Today'
                  ? "M0 250 C 100 250, 300 150, 500 180 C 700 210, 800 120, 1000 140"
                  : timeRange === 'Monthly'
                    ? "M0 260 C 150 260, 250 100, 400 120 C 550 140, 650 40, 800 60 C 950 80, 1000 240"
                    : "M0 280 C 200 280, 400 20, 600 40 C 800 60, 900 10, 1000 0"}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="8"
                strokeLinecap="round"
                className="filter drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]"
              />

              {/* Animated Tracker Nodes */}
              <motion.g animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                <circle cx="500" cy="180" r="16" fill="#f59e0b" className="opacity-10" />
                <circle cx="500" cy="180" r="6" fill="#1c1917" stroke="#f59e0b" strokeWidth="3" />
              </motion.g>

              <motion.line
                animate={{ x: [0, 1000] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                y1="0" y2="300"
                stroke="rgba(245, 158, 11, 0.05)"
                strokeWidth="1"
              />
            </svg>

            {/* Range-Aware Label */}
            <div className="absolute top-[20%] right-[10%] bg-stone-800/80 backdrop-blur-2xl border border-stone-700/50 p-6 rounded-[2rem] shadow-3xl pointer-events-none">
              <span className="text-[9px] font-black text-amber-500 uppercase block mb-1">
                Current {timeRange === 'Today' ? 'Hourly' : timeRange === 'Monthly' ? 'Day' : 'Quarter'} Total
              </span>
              <span className="text-3xl font-black tracking-tighter italic block">
                {timeRange === 'Today' ? '₹84,200' : timeRange === 'Monthly' ? '₹24,50,000' : '₹3.82 Cr'}
              </span>
            </div>
          </div>

          <div className="flex justify-between mt-12 px-4 pb-8 border-b border-stone-800">
            {timeRange === 'Today' ? (
              ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'NOW'].map((t) => (
                <span key={t} className="text-[10px] font-black text-stone-600 uppercase tracking-widest">{t}</span>
              ))
            ) : timeRange === 'Monthly' ? (
              ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'].map((m) => (
                <span key={m} className="text-[10px] font-black text-stone-600 uppercase tracking-widest">{m}</span>
              ))
            ) : (
              ['2018', '2019', '2020', '2021', '2022', '2023', '2024'].map((y) => (
                <span key={y} className="text-[10px] font-black text-stone-600 uppercase tracking-widest">{y}</span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Comparative & Category Logic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Revenue vs Orders Ratio */}
         <div className="bg-white p-8 rounded-[3rem] border border-stone-100 shadow-sm flex flex-col justify-between">
            <div>
               <h3 className="font-black text-stone-900 uppercase tracking-widest text-sm italic mb-1">Rev vs Orders</h3>
               <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Efficiency Multiplier</p>
            </div>
            <div className="my-8 relative">
               <div className="flex items-end gap-3 h-32 px-4">
                  <div className="flex-1 bg-stone-100 rounded-t-xl relative group">
                     <div className="absolute inset-x-0 bottom-0 bg-stone-900 rounded-t-xl transition-all duration-700 h-[80%] group-hover:h-[85%]" />
                  </div>
                  <div className="flex-1 bg-stone-100 rounded-t-xl relative group">
                     <div className="absolute inset-x-0 bottom-0 bg-amber-500 rounded-t-xl transition-all duration-700 h-[40%] group-hover:h-[45%]" />
                  </div>
               </div>
               <div className="flex justify-between mt-4 px-6">
                  <span className="text-[9px] font-black text-stone-900 uppercase tracking-widest">Revenue</span>
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Orders</span>
               </div>
            </div>
            <div className="bg-stone-50 p-4 rounded-2xl flex justify-between items-center border border-stone-100/50">
               <div>
                  <span className="text-[10px] font-black text-stone-400 uppercase block tracking-widest">Avg Order Val</span>
                  <span className="text-xl font-black text-stone-900">₹3,400</span>
               </div>
               <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-md">+14%</span>
            </div>
         </div>

         {/* Category Spread */}
         <div className="bg-white p-8 rounded-[3rem] border border-stone-100 shadow-sm col-span-1 lg:col-span-2 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="font-black text-stone-900 uppercase tracking-widest text-sm italic mb-1">Category Spread</h3>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Market Sector Dominance</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
               {[
                  { cat: 'Computing', val: '45%', color: 'bg-stone-900' },
                  { cat: 'Wearables', val: '25%', color: 'bg-amber-500' },
                  { cat: 'Audio', val: '20%', color: 'bg-stone-300' },
                  { cat: 'Accessories', val: '10%', color: 'bg-stone-100' },
               ].map((item, i) => (
                  <div key={i} className="space-y-4 group">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">{item.cat}</span>
                        <span className="text-sm font-black text-stone-400">{item.val}</span>
                     </div>
                     <div className="h-2 w-full bg-stone-50 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: item.val }}
                           transition={{ duration: 1.5, delay: i * 0.2 }}
                           className={`h-full rounded-full ${item.color} group-hover:brightness-110 transition-all`}
                        />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-stone-100 shadow-sm p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-black text-stone-900 uppercase tracking-widest text-sm italic mb-1">Live Action Feed</h3>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Realtime node events</p>
            </div>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <div className="space-y-4 relative">
            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-stone-100 rounded-full" />
            {[
              { event: 'Order Dispatched', asset: '#ORD-99XZ', val: '₹42,999', time: 'Just Now' },
              { event: 'New Registration', asset: 'elena@example.com', val: 'Client', time: '2m ago' },
              { event: 'Restock Required', asset: 'Sonic Buds Pro', val: 'Critical', time: '14m ago' },
              { event: 'Payment Settled', asset: '#TRX-4421', val: '₹1,89,999', time: '1h ago' },
            ].map((evt, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={evt.asset}
                className="flex items-center justify-between p-6 bg-stone-50 rounded-[2rem] border border-stone-100/50 hover:bg-white transition-all cursor-crosshair group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full group-hover:scale-150 transition-transform" />
                  <div>
                    <span className="text-[10px] font-black text-stone-900 uppercase block tracking-tighter">{evt.event}</span>
                    <span className="text-[11px] font-bold text-stone-400 italic">{evt.asset}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-stone-900 block">{evt.val}</span>
                  <span className="text-[9px] font-black text-stone-300 uppercase">{evt.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-stone-900 rounded-[3rem] p-10 shadow-2xl flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          <div>
            <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8 font-serif">Top Products</h4>
            <div className="space-y-6 relative z-10">
               {[
                  { name: 'Quantum Watch X', rev: '₹4.3M' },
                  { name: 'Vertex Pro 16', rev: '₹14.9M' },
                  { name: 'Aura Headset', rev: '₹2.1M' },
               ].map((prod, i) => (
                   <div key={i} className="flex justify-between items-center group cursor-default border-b border-stone-800 pb-4 last:border-0 last:pb-0">
                      <span className="text-sm font-black tracking-tight">{prod.name}</span>
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-md">{prod.rev}</span>
                   </div>
               ))}
            </div>
          </div>
          <button onClick={() => setActiveTab('Inventory')} className="w-full mt-6 bg-amber-500 text-stone-900 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-colors shadow-2xl shadow-amber-500/20 relative z-10">Restock Catalog</button>
        </div>
      </div>
    </div>
  );
}
