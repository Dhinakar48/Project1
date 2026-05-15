import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaChartLine, FaChartBar, FaChartPie, FaArrowUp, FaArrowDown, FaCalendarAlt } from "react-icons/fa";

export default function Analytics() {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      setLoading(true);
      axios.get("http://127.0.0.1:5001/api/admin/analytics-detailed")
         .then(res => {
            if (res.data.success) setData(res.data);
            setLoading(false);
         })
         .catch(err => {
            console.error("Analytics fetch error", err);
            setLoading(false);
         });
   }, []);

   if (loading || !data) return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Aggregating Intelligence...</p>
      </div>
   );

   const maxRevenue = Math.max(...data.revenueTrend.map(r => Number(r.amount)), 1);

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex justify-between items-end">
            <div>
               <h3 className="text-xl font-bold text-stone-900 tracking-tight">Advanced Platform Analytics</h3>
               <p className="text-xs text-stone-500 font-medium">Deep insights into revenue performance, market trends, and category distribution.</p>
            </div>
            {/* Live MoM Comparison */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-200 flex items-center gap-6"
            >
               <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">{data.comparison?.current_month_name || 'Current Month'} (Live)</p>
                  <p className="text-lg font-black tracking-tight">₹{Number(data.comparison?.current_month || 0).toLocaleString()}</p>
               </div>
               <div className="w-px h-8 bg-white/10" />
               <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">{data.comparison?.prev_month_name || 'Previous Month'}</p>
                  <p className="text-sm font-bold opacity-80">₹{Number(data.comparison?.prev_month || 0).toLocaleString()}</p>
               </div>
               <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${Number(data.comparison?.current_month) >= Number(data.comparison?.prev_month) ? 'bg-emerald-400 text-indigo-900' : 'bg-rose-400 text-indigo-900'}`}>
                  {Number(data.comparison?.prev_month) > 0 
                     ? `${(((Number(data.comparison.current_month) - Number(data.comparison.prev_month)) / Number(data.comparison.prev_month)) * 100).toFixed(1)}%` 
                     : '+100%'}
               </div>
            </motion.div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Animated Revenue Month-over-Month Block Chart */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group col-span-1 lg:col-span-2"
            >
               <div className="flex justify-between items-center mb-10">
                  <div>
                     <h4 className="text-base font-bold text-stone-900 tracking-tight">Revenue Performance (MoM)</h4>
                     <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Staggered Month-over-Month Growth Audit</p>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                           <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">This Month</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-2.5 h-2.5 rounded-sm bg-stone-100 border border-stone-200" />
                           <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Prev Month</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="relative h-64 w-full flex items-end justify-between px-4 pb-8">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-16 pt-8">
                     {[1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-stone-50 border-dashed" />)}
                  </div>

                  {data.revenueTrend.map((r, i) => {
                     const currentAmount = Number(r.amount);
                     const prevAmount = Number(r.prev_amount || 0);
                     const maxRev = Math.max(...data.revenueTrend.map(x => Math.max(Number(x.amount), Number(x.prev_amount || 0))), 1);
                     
                     return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar relative z-10">
                           <div className="relative w-full flex items-end justify-center gap-2 px-2">
                              {/* Previous Month Block */}
                              <motion.div 
                                 initial={{ height: 0 }}
                                 animate={{ height: `${Math.max((prevAmount / (maxRev * 1.1)) * 160, 4)}px` }}
                                 transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                                 className="w-[40%] min-w-[18px] max-w-[42px] bg-stone-100 rounded-t-lg border border-stone-200 relative"
                              >
                                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-stone-600 text-white text-[9px] font-bold px-2 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                                    <p className="text-stone-300">{r.prev_month_name || 'Previous'}</p>
                                    ₹{prevAmount.toLocaleString()}
                                 </div>
                              </motion.div>

                              {/* This Month Block */}
                              <motion.div 
                                 initial={{ height: 0 }}
                                 animate={{ height: `${Math.max((currentAmount / (maxRev * 1.1)) * 160, 4)}px` }}
                                 transition={{ duration: 1.2, delay: (i * 0.1) + 0.2, ease: "easeOut" }}
                                 className="w-[40%] min-w-[18px] max-w-[42px] bg-indigo-500 rounded-t-lg group-hover/bar:bg-indigo-600 transition-colors relative shadow-lg shadow-indigo-100"
                              >
                                 <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-t-lg" />
                                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-stone-900 text-white text-[9px] font-bold px-2 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50 translate-x-4 pointer-events-none">
                                    <p className="text-indigo-400">{r.full_month_name || 'Current'}</p>
                                    ₹{currentAmount.toLocaleString()}
                                 </div>
                              </motion.div>
                           </div>
                           <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{r.month}</span>
                        </div>
                     );
                  })}
               </div>
            </motion.div>

            {/* Category Performance */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm col-span-1"
            >
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <h4 className="text-sm font-bold text-stone-900">Top Categories</h4>
                     <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Market share distribution</p>
                  </div>
                  <FaChartPie className="text-indigo-200 text-xl" />
               </div>

               <div className="space-y-5">
                  {data.categoryDistribution.slice(0, 4).map((cat, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-stone-700">{cat.name}</span>
                           <span className="text-[10px] font-black text-stone-900">{cat.sales}</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-50 rounded-full overflow-hidden border border-stone-100">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((cat.sales / data.categoryDistribution[0].sales) * 100, 100)}%` }}
                              transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                              className={`h-full rounded-full ${['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500'][i % 4]}`}
                           />
                        </div>
                     </div>
                  ))}
               </div>
               
               <div className="mt-8 pt-6 border-t border-stone-50">
                  <motion.div 
                     whileHover={{ scale: 1.02 }}
                     className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100 cursor-pointer transition-shadow hover:shadow-lg"
                  >
                     <div>
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Growth Leader</p>
                        <p className="text-xs font-bold text-indigo-700">{data.categoryDistribution[0]?.name || 'N/A'}</p>
                     </div>
                     <motion.div 
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm"
                     >
                        <FaArrowUp size={10} />
                     </motion.div>
                  </motion.div>
               </div>
            </motion.div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsCard title="Customer Retention" value="78.4%" trend="+2.3%" icon={FaUserShield} color="text-indigo-500" bg="bg-indigo-50" />
            <AnalyticsCard title="Conversion Rate" value="3.12%" trend="-0.4%" trendDown icon={FaChartLine} color="text-rose-500" bg="bg-rose-50" />
            <AnalyticsCard title="Avg Order Value" value="₹12,450" trend="+8.1%" icon={FaCalendarAlt} color="text-emerald-500" bg="bg-emerald-50" />
            <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm">
                  <FaChartBar />
               </div>
               <div>
                  <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Active Sessions</h3>
                  <div className="text-xl font-black text-stone-900 tracking-tight">1,284</div>
               </div>
            </div>
         </div>
      </div>
   );
}

function AnalyticsCard({ title, value, trend, icon: Icon, color, bg, trendDown }) {
   return (
      <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm relative group overflow-hidden">
         <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500`}>
               <Icon size={20} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${trendDown ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
               {trendDown ? <FaArrowDown /> : <FaArrowUp />} {trend}
            </div>
         </div>
         <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{title}</h3>
         <div className="text-2xl font-black text-stone-900 tracking-tight">{value}</div>
      </div>
   );
}

function FaUserShield(props) { return <FaChartPie {...props} />; }
