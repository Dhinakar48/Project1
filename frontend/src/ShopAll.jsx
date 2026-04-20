import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ShopAll() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/products");
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 pt-12 pb-24 px-6 md:px-16 font-sans">
            <div className="max-w-7xl mx-auto text-stone-900">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-20 text-center"
                >
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none mb-6">
                        The Master <br />
                        <span className="text-amber-600">Catalog</span>
                    </h1>
                    <p className="text-stone-500 max-w-xl mx-auto text-md font-medium">
                        Explore every masterpiece in our collection. From precision audio to high-performance computing.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {loading ? (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-stone-400 font-medium animate-pulse italic">Scanning the master catalog...</p>
                        </div>
                    ) : products.length > 0 ? (
                        products.map((product, index) => (
                            <motion.div
                                key={product.product_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => navigate(`/product/${product.product_id}`, { state: { from: 'shop-all' } })}
                                className="group cursor-pointer"
                            >
                                <div className="aspect-[4/5] bg-white border border-stone-200 overflow-hidden mb-6 p-10 transition-all duration-700 relative flex items-center justify-center">
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700"></div>
                                    <img
                                        src={product.main_image || (product.images && product.images[0]) || '/placeholder.png'}
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
                                            <h4 className="text-lg font-bold tracking-tight text-stone-900 leading-tight group-hover:text-amber-600 transition-colors uppercase">{product.name}</h4>
                                        </div>
                                        <p className="text-sm font-black text-amber-600">₹{parseFloat(product.price).toLocaleString()}</p>
                                    </div>
                                    <p className="text-stone-500 text-xs line-clamp-2 font-medium leading-relaxed">{product.description}</p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-stone-400 italic">
                            No products found in the catalog.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
