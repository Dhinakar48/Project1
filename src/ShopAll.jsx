import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { featuredProductsArray as products } from "./data";

export default function ShopAll() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-stone-50 pt-32 pb-24 px-6 md:px-16 font-sans">
            <div className="max-w-7xl mx-auto text-stone-900">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-20 text-center"
                >
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none mb-6">
                        The Master <br />
                        <span className="text-amber-600">Catalog</span>
                    </h1>
                    <p className="text-stone-500 max-w-xl mx-auto text-lg font-medium">
                        Explore every masterpiece in our collection. From precision audio to high-performance computing.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => navigate(`/product/${product.id}`, { state: { from: 'shop-all' } })}
                            className="group cursor-pointer"
                        >
                            <div className="aspect-[4/5] bg-white border border-stone-200 overflow-hidden mb-6 p-10 transition-all duration-700 relative flex items-center justify-center">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700"></div>
                                <img
                                    src={product.variants[0].img}
                                    className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition duration-700"
                                    alt={product.name}
                                />
                                <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition duration-700 z-20">
                                    <button className="w-full bg-stone-900 text-stone-50 py-3 text-[10px] font-black uppercase tracking-widest">
                                        Examine Details
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-lg font-black text-stone-900 leading-tight group-hover:text-amber-600 transition-colors uppercase italic">{product.name}</h4>
                                    </div>
                                    <p className="text-sm font-black text-amber-600">{product.variants[0].price}</p>
                                </div>
                                <p className="text-stone-500 text-xs line-clamp-2 font-medium leading-relaxed">{product.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
