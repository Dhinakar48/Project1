import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { featuredProductsArray as products } from "./data";


export default function Featured() {
    const navigate = useNavigate();


    return (
        <div className="bg-stone-50 text-stone-900 py-24 px-6 md:px-16 lg:px-24">
            
            <div className="mb-16">
                <div className="space-y-4">
                    <motion.h1 
                        className="text-3xl md:text-5xl font-bold tracking-tight leading-none text-stone-900"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Featured <span className="text-amber-600">Products</span>
                    </motion.h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 ">
                {products.slice(0, 3).map((item, i) => {
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
                            <div className="relative aspect-[4/5] bg-amber-100/20 border border-amber-100 overflow-hidden mb-6 transition-all duration-700">
                                <img
                                    src={item.variants[0].img}
                                    alt={item.name}
                                    className="w-full h-full object-contain p-12 group-hover:scale-110 transition duration-1000"
                                    onClick={() => navigate(`/product/${item.id}`, { state: { from: 'home' } })}
                                />
                                



                                <div className="absolute bottom-0 left-0 right-0 p-6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                    <button className="w-full bg-amber-600 text-white py-3 text-[10px] font-black uppercase tracking-[0.2em]">
                                        Quick Purchase
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 px-2">
                                <div className="cursor-pointer" onClick={() => navigate(`/product/${item.id}`, { state: { from: 'home' } })}>
                                    <h2 className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-amber-600 transition-colors">
                                        {item.name}
                                    </h2>
                                    <p className="text-sm font-black text-amber-600 mt-1">
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