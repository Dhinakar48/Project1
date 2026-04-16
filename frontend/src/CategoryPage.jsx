import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { featuredProductsArray } from "./data";

export default function CategoryPage() {
    const { categoryName } = useParams();
    const navigate = useNavigate();

    // Filter products based on category name from URL
    const filteredProducts = featuredProductsArray.filter(
        product => product.category && product.category.toLowerCase() === categoryName.toLowerCase()
    );

    return (
        <div className="min-h-screen bg-stone-50 py-16 px-6 md:px-16 lg:px-24">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-16">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-2">Collection</h4>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-stone-900 border-b-4 border-stone-900 pb-4 inline-block">
                        {categoryName}
                    </h1>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="group cursor-pointer"
                                onClick={() => navigate(`/product/${product.id}`, { state: { from: 'category' } })}
                            >
                                <div className="aspect-[4/5] overflow-hidden bg-white mb-6 border border-stone-200">
                                    <img
                                        src={product.variants[0].img}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-8 group-hover:scale-110 transition duration-700"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-stone-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm font-bold text-stone-500 pt-1">
                                        {product.variants[0].price}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-stone-400 font-medium">No products found for this category.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
