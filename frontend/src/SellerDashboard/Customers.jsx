import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserShield, FaCrown, FaEnvelope, FaSearchDollar, FaArrowRight } from "react-icons/fa";
import axios from "axios";

export default function Customers({ globalSearch, setViewedCustomer, sellerId }) {
  const [filter, setFilter] = useState("All");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!sellerId) return;
      try {
        const res = await axios.get(`http://localhost:5000/seller-customers/${sellerId}`);
        const formatted = res.data.map(c => {
          const spendAmt = parseFloat(c.total_spend) || 0;
          let tier = 'Silver';
          let color = 'bg-blue-100 text-blue-600 border-blue-200';
          if (spendAmt > 100000) {
            tier = 'Platinum';
            color = 'bg-amber-100 text-amber-600 border-amber-200';
          } else if (spendAmt > 50000) {
            tier = 'Gold';
            color = 'bg-stone-100 text-stone-600 border-stone-200';
          } else if (spendAmt > 20000) {
            color = 'bg-emerald-100 text-emerald-600 border-emerald-200';
          } else {
            color = 'bg-purple-100 text-purple-600 border-purple-200';
          }

          return {
            name: c.name || 'Anonymous User',
            email: c.email || 'No Email',
            order: c.latest_product || 'Multiple Items',
            spend: `₹${spendAmt.toLocaleString('en-IN')}`,
            id: c.customer_id ? c.customer_id.substring(0, 3).toUpperCase() : 'CUS',
            color,
            tier
          };
        });
        setCustomers(formatted);
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [sellerId]);

  const filteredCustomers = customers
    .filter(c => filter === "All" ? true : c.tier === filter)
    .filter(c => 
      c.name.toLowerCase().includes((globalSearch || "").toLowerCase()) || 
      c.email.toLowerCase().includes((globalSearch || "").toLowerCase())
    );

  const getTierIcon = (tier) => {
    switch(tier) {
      case 'Platinum': return <FaCrown className="text-amber-500" />;
      case 'Gold': return <FaSearchDollar className="text-yellow-600" />;
      default: return <FaUserShield className="text-stone-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-1000">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-semibold">Client Ecosystem</span>
          </div>
          <h1 className="text-4xl font-semibold text-stone-900">
            Customer Details
          </h1>
        </div>

        {/* TIERS FILTER */}
        <div className="flex flex-wrap items-center gap-2">
           {['All', 'Platinum', 'Gold', 'Silver'].map(t => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-xl text-[10px] font-semibold transition-all ${filter === t ? 'bg-stone-900 text-amber-500 shadow-xl' : 'bg-white text-stone-400 border border-stone-100 hover:border-stone-300 shadow-sm'}`}
              >
                {t}
              </button>
           ))}
        </div>
      </div>

      {/* CUSTOMER GRID / TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-stone-200/40 overflow-hidden relative" style={{ minHeight: '400px' }}>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        
        <div className="overflow-x-auto relative z-10 w-full">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50 backdrop-blur-md">
                <th className="px-8 py-6 text-[9px] font-semibold text-stone-400">Client Identity</th>
                <th className="px-8 py-6 text-[9px] font-semibold text-stone-400">Status Tier</th>
                <th className="px-8 py-6 text-[9px] font-semibold text-stone-400">Recent Acquisition</th>
                <th className="px-8 py-6 text-[9px] font-semibold text-stone-400">Lifetime Value</th>
                <th className="px-8 py-6 text-right text-[9px] font-semibold text-stone-400">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              <AnimatePresence>
                {filteredCustomers.map((customer, i) => (
                  <motion.tr 
                    key={customer.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-stone-50/50 transition-colors cursor-default"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center font-semibold text-sm border shadow-sm ${customer.color}`}>
                          {customer.id}
                        </div>
                        <div>
                          <span className="font-semibold text-stone-900 text-sm tracking-tight block">{customer.name}</span>
                          <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1 mt-0.5"><FaEnvelope size={10}/> {customer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center">
                             {getTierIcon(customer.tier)}
                          </div>
                          <span className="font-bold text-stone-700 text-xs">{customer.tier}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="font-bold text-stone-600 text-sm tracking-tight block">{customer.order}</span>
                       <span className="text-[9px] font-semibold text-stone-400 mt-1 block">Latest Order</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-semibold text-stone-900 text-[15px]">{customer.spend}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setViewedCustomer(customer)} 
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-[9px] font-semibold hover:bg-amber-500 hover:text-stone-900 hover:shadow-lg hover:shadow-amber-500/30 transition-all group/btn"
                      >
                        Client Details
                        <FaArrowRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredCustomers.length === 0 && (
                 <tr>
                   <td colSpan="5" className="px-8 py-24 text-center">
                     <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                        <FaUserShield size={24} />
                     </div>
                     <h3 className="font-semibold text-stone-900 text-sm mb-1">No Clients Found</h3>
                     <p className="text-[10px] font-bold text-stone-400">Try adjusting your search criteria.</p>
                   </td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
