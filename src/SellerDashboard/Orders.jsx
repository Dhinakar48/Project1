import React from "react";

export default function Orders({ globalSearch }) {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-stone-900 italic uppercase">Global <span className="text-amber-600">Orders</span></h1>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-stone-200/40 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-stone-50">
              <th className="px-8 py-8 text-[10px] font-black text-stone-900 uppercase tracking-widest">Order code</th>
              <th className="px-8 py-8 text-[10px] font-black text-stone-900 uppercase tracking-widest">Client Identity</th>
              <th className="px-8 py-8 text-[10px] font-black text-stone-900 uppercase tracking-widest">Asset Details</th>
              <th className="px-8 py-8 text-[10px] font-black text-stone-900 uppercase tracking-widest">Valuation</th>
              <th className="px-8 py-8 text-right text-[10px] font-black text-stone-900 uppercase tracking-widest">Status Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {[
              { id: '#ORD-94AZ', name: 'Alexandar Graham', item: 'Vertex Laptop 16', amount: '₹1,89,999', status: 'Shipped', statusColor: 'bg-blue-100 text-blue-600' },
              { id: '#ORD-88BZ', name: 'Sophia Loren', item: 'Pulse Watch X', amount: '₹34,000', status: 'Processing', statusColor: 'bg-amber-100 text-amber-600' },
              { id: '#ORD-72CX', name: 'Marcus Aurelius', item: 'Sonic Buds Pro', amount: '₹18,499', status: 'Delivered', statusColor: 'bg-green-100 text-green-600' },
              { id: '#ORD-61DY', name: 'Elena Gilbert', item: 'Aura Headphones', amount: '₹34,999', status: 'Pending', statusColor: 'bg-stone-100 text-stone-600' },
            ]
              .filter(o => o.name.toLowerCase().includes(globalSearch.toLowerCase()) || o.item.toLowerCase().includes(globalSearch.toLowerCase()) || o.id.toLowerCase().includes(globalSearch.toLowerCase()))
              .map((order, i) => (
              <tr key={i} className="group hover:bg-stone-50/50 transition-colors cursor-default">
                <td className="px-8 py-6 font-black text-stone-900 text-sm tracking-tight">{order.id}</td>
                <td className="px-8 py-6 font-bold text-stone-500 text-sm tracking-tight">{order.name}</td>
                <td className="px-8 py-6 font-bold text-stone-500 text-sm tracking-tight">{order.item}</td>
                <td className="px-8 py-6 font-black text-stone-900 text-sm italic">{order.amount}</td>
                <td className="px-8 py-6 text-right">
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${order.statusColor}`}>{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
