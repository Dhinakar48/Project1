import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { featuredProductsArray } from "./data";

const categories = ["Audio", "Wearables", "Computing", "Accessories"];

export default function CategoryPage() {
    const { categoryName } = useParams();
    const navigate = useNavigate();

    // Filter products based on category name from URL
    const filteredProducts = featuredProductsArray.filter(
        product => product.category && product.category.toLowerCase() === categoryName.toLowerCase()
    );

    return (
        <div className="min-h-screen bg-stone-50 py-10 md:py-16 px-6 md:px-16 lg:px-24">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-14">
                
                {/* 🧭 Left Sidebar Navigation */}
                <aside className="md:w-60 shrink-0">
                    <div className="sticky top-32">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-6 text-center md:text-left">
                            Collections
                        </h4>
                        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-3 md:gap-5 pb-4 md:pb-0 scrollbar-hide">
                            {categories.map((cat) => (
                                <Link 
                                    key={cat}
                                    to={`/category/${cat}`}
                                    className={`text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-3 whitespace-nowrap md:whitespace-normal px-4 md:px-0 py-2 md:py-0 border md:border-none rounded-full md:rounded-none ${
                                        categoryName.toLowerCase() === cat.toLowerCase()
                                            ? "text-stone-900 bg-stone-100 md:bg-transparent md:translate-x-2 border-stone-900"
                                            : "text-stone-400 border-stone-200 hover:text-stone-600"
                                    }`}
                                >
                                    <span className={`hidden md:block w-1.5 h-1.5 rounded-full bg-amber-600 transition-opacity duration-300 ${
                                        categoryName.toLowerCase() === cat.toLowerCase() ? "opacity-100" : "opacity-0"
                                    }`} />
                                    {cat}
                                </Link>
                            ))}
                        </nav>
                        
                        <div className="mt-20 pt-10 border-t border-stone-200 hidden md:block">
                            <p className="text-[10px] font-medium text-stone-400 leading-relaxed uppercase tracking-tighter">
                                Showing curated engineering from <br/> our latest laboratory drops.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* 📦 Main content Area */}
                <main className="flex-1">
                    <div className="mb-10">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-stone-900 mb-2">
                            {categoryName}
                        </h1>
                        <p className="text-stone-400 text-sm font-medium">
                            {filteredProducts.length} Premium engineering pieces found.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                        <AnimatePresence mode="wait">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="group cursor-pointer"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        <div className="aspect-[1/1] overflow-hidden bg-white mb-6 border border-stone-100 rounded-3xl shadow-sm group-hover:shadow-xl group-hover:shadow-stone-200/50 transition-all duration-500">
                                            <img
                                                src={product.variants[0].img}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-10 group-hover:scale-110 transition duration-700"
                                            />
                                        </div>
                                        <div className="px-2">
                                            <h3 className="text-lg font-bold tracking-tight text-stone-900 group-hover:text-amber-600 transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs font-black text-amber-600 mt-2 uppercase tracking-widest">
                                                {product.variants[0].price}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div className="col-span-full py-20 text-center">
                                    <p className="text-stone-400 font-medium italic">Current vault is empty.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
