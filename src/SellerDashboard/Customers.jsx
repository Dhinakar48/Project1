import React from "react";

export default function Customers({ globalSearch, setViewedCustomer }) {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-stone-900 italic uppercase">customer details</h1>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-stone-200/40 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-stone-50">
              <th className="px-8 py-8 text-[10px] font-black text-stone-900 uppercase tracking-widest">Customer Identity</th>
              <th className="px-8 py-8 text-[10px] font-black text-stone-900 uppercase tracking-widest">Last Order</th>
              <th className="px-8 py-8 text-[10px] font-black text-stone-900 uppercase tracking-widest">Total Spend</th>
              <th className="px-8 py-8 text-right text-[10px] font-black text-stone-900 uppercase tracking-widest">Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {[
              { name: 'Alexandar Graham', email: 'alex@example.com', order: 'Vertex Laptop', spend: '₹2,45,000', id: 'AG', color: 'bg-emerald-100 text-emerald-600' },
              { name: 'Sophia Loren', email: 'sophia@example.com', order: 'Pulse Watch', spend: '₹34,000', id: 'SL', color: 'bg-blue-100 text-blue-600' },
              { name: 'Marcus Aurelius', email: 'marcus@example.com', order: 'Sonic Buds', spend: '₹18,000', id: 'MA', color: 'bg-amber-100 text-amber-600' },
              { name: 'Elena Gilbert', email: 'elena@example.com', order: 'Bose QC Ultra', spend: '₹35,000', id: 'EG', color: 'bg-purple-100 text-purple-600' },
            ]
              .filter(c => c.name.toLowerCase().includes(globalSearch.toLowerCase()) || c.email.toLowerCase().includes(globalSearch.toLowerCase()))
              .map((customer, i) => (
              <tr key={i} className="group hover:bg-stone-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${customer.color}`}>{customer.id}</div>
                    <div>
                      <span className="font-black text-stone-900 text-sm block">{customer.name}</span>
                      <span className="text-[10px] font-bold text-stone-400">{customer.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 font-bold text-stone-600 text-sm">{customer.order}</td>
                <td className="px-8 py-6 font-black text-stone-900 text-sm">{customer.spend}</td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => setViewedCustomer(customer)} className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">View Transactions</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
