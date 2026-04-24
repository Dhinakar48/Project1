import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Overview() {
   const [dashboardData, setDashboardData] = useState(null);
   const [loading, setLoading] = useState(true);

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

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* Sales Overview */}
         <div>
            <h3 className="text-sm font-bold text-stone-900 mb-4 tracking-tight">Sales Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <StatCard title="Total Volume" value={`₹${Number(dashboardData.stats.volume).toLocaleString()}`} change="Live DB" trend="up" />
               <StatCard title="Active Sellers" value={dashboardData.stats.sellers} change="Live DB" trend="up" />
               <StatCard title="Customer Base" value={dashboardData.stats.customers} change="Live DB" trend="up" />
               <StatCard title="Platform Revenue" value={`₹${Number(dashboardData.stats.platformRevenue).toLocaleString()}`} change="Live DB" trend="up" />
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

         <div>
            <h3 className="text-sm font-bold text-stone-900 mb-4 tracking-tight">Top Performing Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {dashboardData.topProducts.length > 0 ? dashboardData.topProducts.map((prod, i) => (
                  <TopProductCard 
                     key={i} 
                     rank={`#${i + 1}`} 
                     name={prod.name} 
                     sales={`${prod.sales} Units`} 
                     rev={`₹${Number(prod.rev).toLocaleString()}`} 
                  />
               )) : <p className="text-stone-400 text-sm">No top products data yet.</p>}
            </div>
         </div>
      </div>
   );
}

function StatCard({ title, value, change, trend }) {
   return (
      <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
         <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">{title}</h3>
         <div className="text-3xl font-bold text-stone-900 tracking-tight">{value}</div>
         <div className={`text-[10px] font-bold mt-2 inline-flex items-center gap-1 ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
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

function TopProductCard({ rank, name, sales, rev }) {
   return (
      <div className="bg-white p-5 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-colors">
         <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center font-black text-stone-300 group-hover:text-indigo-400 group-hover:bg-indigo-50 transition-colors">
            {rank}
         </div>
         <div>
            <h4 className="text-sm font-bold text-stone-900">{name}</h4>
            <div className="flex gap-3 mt-1 text-xs">
               <span className="font-semibold text-stone-500">{sales}</span>
               <span className="text-stone-300">|</span>
               <span className="font-bold text-emerald-500">{rev}</span>
            </div>
         </div>
      </div>
   );
}
