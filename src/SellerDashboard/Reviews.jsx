import React from "react";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa6";

export default function Reviews() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-stone-900 italic uppercase">Customer <span className="text-amber-600">Feedback</span></h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reviews Summary Stats */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
          <span className="text-5xl font-black text-stone-900 mb-2 italic">4.8</span>
          <div className="flex gap-1 mb-4 text-amber-500">
            <FaStar size={16} /><FaStar size={16} /><FaStar size={16} /><FaStar size={16} /><FaStar size={16} />
          </div>
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Global Assets Rating</span>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
          <span className="text-5xl font-black text-stone-900 mb-2 italic">92%</span>
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Positive Sentiment Flux</span>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
          <span className="text-3xl font-black text-stone-900 mb-2 italic">842</span>
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Total Verified Responses</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-stone-200/40 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="p-8 border-b border-stone-100 relative z-10 flex items-center justify-between">
          <h3 className="font-black text-stone-900 uppercase tracking-widest text-xs italic">Live Response Feed</h3>
          <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Real-time Stream</span>
        </div>
        <div className="divide-y divide-stone-50 relative z-10">
          {[
            { user: 'Marcus Aurelius', rating: 5, comment: 'Exceptional build quality on the Vertex Pro 16. The thermal performance is industry-leading.', date: '2h ago', product: 'Vertex Pro 16', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' },
            { user: 'Sophia Loren', rating: 4, comment: 'Quantum Watch X is beautiful, but the battery synchronization could be tighter.', date: '5h ago', product: 'Quantum Watch X', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop' },
            { user: 'Elena Gilbert', rating: 5, comment: 'The Sonic Buds Pro offer unparalleled noise cancellation protocol.', date: '1d ago', product: 'Sonic Buds Pro', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
          ].map((rev, i) => (
            <div key={i} className="p-8 hover:bg-stone-50 transition-colors flex flex-col lg:flex-row gap-8">
              <div className="w-20 h-20 flex-shrink-0 bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden shadow-sm group cursor-pointer">
                 <img src={rev.img} alt={rev.product} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-black text-xs">{rev.user[0]}</div>
                    <div className="space-y-0.5">
                      <span className="font-black text-stone-900 text-sm block tracking-tight">{rev.user}</span>
                      <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Unit: {rev.product}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                    {[...Array(rev.rating)].map((_, j) => <FaStar key={j} size={10} />)}
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed italic border-l-4 border-amber-500/20 pl-4 py-1 mb-6">"{rev.comment}"</p>
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
                  <span className="text-stone-300">{rev.date}</span>
                  <span className="text-stone-300">|</span>
                  <button className="text-amber-600 hover:underline">Draft Response</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
