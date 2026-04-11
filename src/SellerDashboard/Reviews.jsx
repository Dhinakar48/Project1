import React from "react";
import { motion } from "framer-motion";
import { FaStar, FaRegStar, FaStarHalfAlt, FaQuoteLeft, FaReply } from "react-icons/fa";

export default function Reviews() {
  const reviews = [
    { user: 'Marcus Aurelius', rating: 5, comment: 'Exceptional build quality on the Vertex Pro 16. The thermal performance is industry-leading. Everything functions beautifully straight out of the box. Highly recommended for power users.', date: '2h ago', product: 'Vertex Pro 16', img: '/laptop.jpg', status: 'Verified Purchase' },
    { user: 'Sophia Loren', rating: 4, comment: 'Quantum Watch X is beautiful, but the battery synchronization could be tighter. Other than that, the metrics tracking is impeccable.', date: '5h ago', product: 'Pulse Watch X', img: '/featured/watch1.avif', status: 'Verified Purchase' },
    { user: 'Elena Gilbert', rating: 5, comment: 'The Sonic Buds Pro offer unparalleled noise cancellation protocol. I use them daily on my commute and the battery life lasts for weeks.', date: '1d ago', product: 'Sonic Buds Pro', img: '/featured/buds1.avif', status: 'Verified Purchase' },
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
       <FaStar key={i} className={i < rating ? "text-amber-500" : "text-stone-200"} size={12} />
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-1000">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600">
             <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
             <span className="text-[9px] font-semibold">Feedback Center</span>
          </div>
          <h1 className="text-4xl font-semibold text-stone-900">
            Customer Reviews
          </h1>
        </div>
      </div>

      {/* STATS AGGREGATE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/20 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 blur-[40px transition-colors" />
          <span className="text-6xl font-semibold text-stone-900 mb-3 z-10">4.8</span>
          <div className="flex gap-1.5 mb-4 z-10">
            {[...Array(5)].map((_, j) => <FaStar key={j} className="text-amber-500 drop-shadow-sm" size={18} />)}
          </div>
          <span className="text-[10px] font-semibold text-stone-400 z-10">Global Average Rating</span>
        </div>

        <div className="bg-stone-900 p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 w-32 h-32 blur-[40px] transition-colors" />
          <span className="text-6xl font-semibold text-amber-500 mb-3 z-10">92%</span>
          <div className="h-2 w-32 bg-stone-800 rounded-full mb-4 overflow-hidden z-10">
             <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} transition={{ duration: 1.5 }} className="h-full bg-amber-500 rounded-full" />
          </div>
          <span className="text-[10px] font-semibold text-stone-300 z-10">Positive Sentiment Vector</span>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/20 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute bottom-0 right-0 w-32 h-32 blur-[40px] transition-colors" />
          <span className="text-6xl font-semibold text-stone-900 mb-3 z-10">842</span>
          <div className="flex items-center gap-2 mb-4 text-emerald-500 z-10">
             <FaQuoteLeft size={16} />
             <span className="text-[10px] font-semibold">+12 this week</span>
          </div>
          <span className="text-[10px] font-semibold text-stone-400 z-10">Verified Datapoints</span>
        </div>
      </div>

      {/* FEED LIST */}
      <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-stone-200/40 relative">
        <div className="p-8 border-b border-stone-100 flex items-center justify-between">
          <div>
             <h3 className="font-semibold text-stone-900 text-sm">Live Intelligence Feed</h3>
             <p className="text-[9px] font-bold text-stone-400">Chronological verification pipeline</p>
          </div>
          <span className="px-4 py-2 bg-stone-50 border border-stone-100 text-stone-500 rounded-xl text-[9px] font-semibold shadow-sm">
             Sorted by: Recent
          </span>
        </div>
        
        <div className="divide-y divide-stone-50">
          {reviews.map((rev, i) => (
            <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="p-8 hover:bg-stone-50/50 transition-colors flex flex-col md:flex-row gap-6 lg:gap-10 group"
            >
              {/* Product Insight */}
              <div className="w-full md:w-48 flex-shrink-0">
                 <div className="bg-white rounded-[1.0rem] border border-stone-100 p-3 shadow-sm h-32 w-full flex items-center justify-center overflow-hidden mb-3 transition-all">
                    <img src={rev.img} alt={rev.product} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                 </div>
                 <span className="text-[10px] font-semibold text-stone-900 block text-center truncate">{rev.product}</span>
              </div>

              {/* Review Content */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-semibold text-sm border border-amber-100">
                       {rev.user.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-stone-900 text-base block tracking-tight">{rev.user}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-semibold border border-emerald-200">{rev.status}</span>
                         <span className="text-[9px] font-bold text-stone-400">{rev.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 bg-white border border-stone-100 p-2 rounded-xl shadow-sm">
                    {renderStars(rev.rating)}
                  </div>
                </div>
                
                <p className="text-stone-600 text-sm leading-relaxed border-l-2 border-amber-500/30 pl-5 py-1 my-4">
                  "{rev.comment}"
                </p>

                <div className="mt-auto">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-[9px] font-semibold hover:bg-amber-500 hover:text-stone-900 hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                    <FaReply size={10} /> Execute Response
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
