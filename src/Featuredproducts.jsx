import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { featuredProductsArray as products } from "./data";
import { useStore } from "./StoreContext";
import { FaHeart, FaPlus } from "react-icons/fa6";

export default function Featured() {
    const navigate = useNavigate();
    const { toggleWishlist, wishlist, addToCart } = useStore();

    return (
        <div className="bg-stone-50 text-stone-900 py-24 px-6 md:px-16 lg:px-24">
            
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div className="space-y-4">
                    <motion.p 
                       initial={{ opacity: 0, x: -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400"
                    >
                        Collection 2024
                    </motion.p>
                    <motion.h1
                        className="text-5xl md:text-7xl font-black tracking-tighter leading-none"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Featured
                    </motion.h1>
                </div>
                <motion.p
                    className="text-stone-500 max-w-sm text-sm font-medium leading-relaxed border-l border-stone-200 pl-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Experience the frontier of industrial design and acoustic engineering. Every detail is meticulously crafted for the divine listener.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
                {products.slice(0, 3).map((item, i) => {
                    const isWishlisted = wishlist.some(w => w.id === item.id);
                    return (
                        <motion.div
                            key={item.id}
                            className="group relative flex flex-col"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            {/* Product Card Image Wrapper */}
                            <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden mb-6 group shadow-sm hover:shadow-2xl transition-all duration-700">
                                <img
                                    src={item.variants[0].img}
                                    alt={item.name}
                                    className="w-full h-full object-contain p-12 group-hover:scale-110 transition duration-1000"
                                    onClick={() => navigate(`/product/${item.id}`)}
                                />
                                
                                {/* Overlay Actions */}
                                <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWishlist(item);
                                        }}
                                        className={`p-4 rounded-full shadow-xl transition-all duration-300 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-stone-900 hover:bg-stone-900 hover:text-white'}`}
                                    >
                                        <FaHeart size={18} className={isWishlisted ? 'fill-current' : ''} />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(item, item.variants[0]);
                                        }}
                                        className="p-4 bg-white text-stone-900 rounded-full shadow-xl hover:bg-stone-900 hover:text-white transition-all duration-300"
                                    >
                                        <FaPlus size={18} />
                                    </button>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                    <button className="w-full bg-white/90 backdrop-blur-sm text-stone-900 py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                        Quick Purchase
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 px-2">
                                <div className="flex justify-between items-start">
                                    <div className="cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                                        <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{item.title}</p>
                                        <h2 className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-stone-600 transition-colors">
                                            {item.name}
                                        </h2>
                                    </div>
                                    <p className="text-lg font-black text-stone-900 pt-1">
                                        {item.variants[0].price}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}