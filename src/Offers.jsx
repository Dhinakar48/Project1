import { motion } from "framer-motion";
import { useStore } from "./StoreContext";

const offers = [
    {
        id: 1,
        title: "Summer Special",
        discount: "20% OFF",
        desc: "On all premium headphones",
        code: "SUMMER20",
        color: "bg-[#E5E1DA]"
    },
    {
        id: 2,
        title: "Flash Deal",
        discount: "₹5,000 OFF",
        desc: "On Vertex Pro Laptops",
        code: "FLASH5K",
        color: "bg-stone-900",
        dark: true
    },
    {
        id: 3,
        title: "New Arrival",
        discount: "Free Shipping",
        desc: "On all Pulse Watch orders",
        code: "FREESHIP",
        color: "bg-[#FBF9F1]"
    }
];

export default function Offers() {
    const { applyDiscountCode } = useStore();

    const handleApply = (code) => {
        const result = applyDiscountCode(code);
        alert(result.message);
    };

    return (
        <section className="bg-stone-50 py-16 px-6 md:px-16 lg:px-24">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">Exclusive Deals</h2>
                    <div className="h-[1px] flex-grow bg-stone-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            className={`${offer.color} ${offer.dark ? 'text-stone-50' : 'text-stone-900'} p-8 relative overflow-hidden group border border-stone-200 shadow-sm`}
                        >
                            <div className="relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 block">{offer.title}</span>
                                <h3 className="text-3xl font-black mb-1">{offer.discount}</h3>
                                <p className={`text-sm mb-6 ${offer.dark ? 'text-stone-400' : 'text-stone-500'} font-medium`}>{offer.desc}</p>
                                
                                <div className="flex items-center justify-between">
                                    <div className={`px-4 py-2 border border-dashed ${offer.dark ? 'border-stone-700' : 'border-stone-300'} text-xs font-mono font-bold`}>
                                        {offer.code}
                                    </div>
                                    <button 
                                        onClick={() => handleApply(offer.code)}
                                        className={`text-[10px] font-black uppercase tracking-widest border-b-2 ${offer.dark ? 'border-white' : 'border-stone-900'} pb-1 hover:opacity-70 transition`}
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                            
                            {/* Decorative element */}
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 ${offer.dark ? 'bg-white' : 'bg-black'} group-hover:scale-150 transition-transform duration-700`}></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
