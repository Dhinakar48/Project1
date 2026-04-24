import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaChartLine, FaChartBar, FaChartPie, FaArrowUp, FaArrowDown, FaCalendarAlt } from "react-icons/fa";

export default function Analytics() {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      setLoading(true);
      axios.get("http://localhost:5000/api/admin/analytics-detailed")
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
         <div>
            <h3 className="text-xl font-bold text-stone-900 tracking-tight">Advanced Platform Analytics</h3>
            <p className="text-xs text-stone-500 font-medium">Deep insights into revenue performance, market trends, and category distribution.</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Trend Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group">
               <div className="flex justify-between items-center mb-10">
                  <div>
                     <h4 className="text-sm font-bold text-stone-900">Revenue Growth</h4>
                     <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Last 6 Months Performance</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                     <FaArrowUp /> 12.5%
                  </div>
               </div>

               <div className="flex items-end justify-between h-48 gap-4 px-2">
                  {data.revenueTrend.map((r, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                        <div className="relative w-full flex justify-center">
                           <div 
                              className="w-10 bg-indigo-500 rounded-t-xl group-hover/bar:bg-indigo-600 transition-all duration-700 relative overflow-hidden"
                              style={{ height: `${(Number(r.amount) / maxRevenue) * 160}px` }}
                           >
                              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
                           </div>
                           <div className="absolute -top-8 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-stone-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                              ₹{Number(r.amount).toLocaleString()}
                           </div>
                        </div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{r.month}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <h4 className="text-sm font-bold text-stone-900">Category Distribution</h4>
                     <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Product sales across verticals</p>
                  </div>
                  <FaChartPie className="text-indigo-200 text-xl" />
               </div>

               <div className="space-y-6">
                  {data.categoryDistribution.slice(0, 5).map((cat, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-stone-700">{cat.name}</span>
                           <span className="text-[10px] font-black text-stone-900">{cat.sales} Sales</span>
                        </div>
                        <div className="w-full h-2 bg-stone-50 rounded-full overflow-hidden border border-stone-100 shadow-inner">
                           <div 
                              className={`h-full rounded-full transition-all duration-1000 ${['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'][i % 5]}`}
                              style={{ width: `${Math.min((cat.sales / data.categoryDistribution[0].sales) * 100, 100)}%` }}
                           />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnalyticsCard title="Customer Retention" value="78.4%" trend="+2.3%" icon={FaUserShield} color="text-indigo-500" bg="bg-indigo-50" />
            <AnalyticsCard title="Conversion Rate" value="3.12%" trend="-0.4%" trendDown icon={FaChartLine} color="text-rose-500" bg="bg-rose-50" />
            <AnalyticsCard title="Average Order Value" value="₹12,450" trend="+8.1%" icon={FaCalendarAlt} color="text-emerald-500" bg="bg-emerald-50" />
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
