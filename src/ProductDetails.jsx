import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { productsData, featuredProductsArray } from "./data";
import { useStore } from "./StoreContext";

export default function ProductDetails() {
    const { id } = useParams();
    const product = productsData[id] || productsData["default"];
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const activeVariant = product.variants[selectedColorIndex] || product.variants[0];

    const relatedProducts = featuredProductsArray.filter(p => p.id !== product.id).slice(0, 3);

    const { addToCart, toggleWishlist, wishlist } = useStore();
    const isWishlisted = wishlist.some(item => item.id === product.id);

    const [addedToCart, setAddedToCart] = useState(false);

    const [reviews, setReviews] = useState([
        { id: 1, name: "Alex Johnson", rating: 5, comment: "Absolutely blown away by the quality. Worth every penny.", img: null },
        { id: 2, name: "Samantha Lee", rating: 5, comment: "Sleek design and phenomenal performance. Highly recommended!", img: null },
        { id: 3, name: "Michael T.", rating: 4, comment: "Great product, solid build. It feels incredibly premium in hand, simply stellar.", img: null }
    ]);
    const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "", img: null });

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewReview({ ...newReview, img: URL.createObjectURL(e.target.files[0]) });
        }
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (newReview.name && newReview.comment) {
            setReviews([{ ...newReview, id: Date.now() }, ...reviews]);
            setNewReview({ name: "", rating: 5, comment: "", img: null });
        }
    };

    const handleAddToCart = () => {
        addToCart(product, activeVariant);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        setSelectedColorIndex(0);
    }, [id]);

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 pt-24 pb-16 px-6 md:px-16 overflow-hidden relative font-sans">
            
            {/* Back Button */}
            <motion.div 
                className="max-w-7xl mx-auto mb-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link to="/" className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition duration-300 group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-sm font-bold tracking-widest uppercase text-stone-900">Back to Boutique</span>
                </Link>
            </motion.div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
                
                {/* Image Section */}
                <motion.div 
                    className="flex-1 w-full relative"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="absolute inset-0 bg-stone-200 blur-3xl opacity-30 rounded-full"></div>
                    <motion.img 
                        key={selectedColorIndex}
                        src={activeVariant.img} 
                        alt={product.name} 
                        className="w-full h-auto max-h-[600px] object-contain rounded-2xl shadow-2xl relative z-10 p-8"
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1, y: [0, -10, 0] }}
                        transition={{ opacity: { duration: 0.4 }, y: { repeat: Infinity, duration: 6, ease: "easeInOut" } }}
                    />
                </motion.div>

                {/* Details Section */}
                <motion.div 
                    className="flex-1 w-full flex flex-col justify-center"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                    }}
                >
                    <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-stone-400 text-xs md:text-sm font-black tracking-[0.3em] uppercase mb-4">
                        {product.title}
                    </motion.p>
                    <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight text-stone-900">
                        {product.name}
                    </motion.h1>
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex items-center gap-6 mb-8 border-b border-stone-200 pb-8 w-full">
                        <p className="text-3xl font-black text-stone-900">
                            {activeVariant.price}
                        </p>
                        <span className="px-3 py-1 bg-stone-900 text-stone-50 text-[10px] font-black uppercase tracking-widest rounded-full">
                            In Stock
                        </span>
                    </motion.div>
                    <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-stone-500 mb-10 leading-relaxed max-w-lg text-lg font-medium">
                        {product.desc}
                    </motion.p>

                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-12">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4">Select Finish: <span className="text-stone-900">{activeVariant.colorName}</span></h3>
                        <div className="flex gap-4">
                            {product.variants.map((variant, index) => (
                                <div 
                                    key={index}
                                    onClick={() => setSelectedColorIndex(index)}
                                    className={`w-10 h-10 rounded-full ${variant.colorBg} cursor-pointer transition-all duration-300 border shadow-inner ${selectedColorIndex === index ? `ring-2 ring-offset-2 ring-offset-stone-50 ring-stone-900 scale-110` : 'hover:scale-110 opacity-60 hover:opacity-100 border-stone-200'}`}
                                ></div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <motion.button 
                            onClick={handleAddToCart}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`${addedToCart ? 'bg-green-600' : 'bg-stone-900'} text-stone-50 py-5 px-12 font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-stone-800 transition-all duration-300 flex-grow md:flex-grow-0 border border-stone-900`}
                        >
                            {addedToCart ? 'Added to Bag' : 'Add to Shopping Bag'}
                        </motion.button>
                        
                        <motion.button
                            onClick={() => toggleWishlist(product)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-5 flex items-center justify-center border transition-all duration-300 shadow-lg ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900 bg-white'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isWishlisted ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Extra information section */}
            <motion.div 
                className="max-w-7xl mx-auto mt-24 border-t border-stone-200 pt-16 grid grid-cols-1 md:grid-cols-3 gap-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Engineering</h4>
                    <p className="text-xl font-bold text-stone-800">Premium Materials</p>
                    <p className="text-stone-500 text-sm leading-relaxed">Crafted with aircraft-grade aluminum and soft-touch composites for ultimate durability and comfort.</p>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Acoustics</h4>
                    <p className="text-xl font-bold text-stone-800">Precision Sound</p>
                    <p className="text-stone-500 text-sm leading-relaxed">Custom-tuned drivers deliver a soundscape that redefines your listening experience with deep clarity.</p>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Power</h4>
                    <p className="text-xl font-bold text-stone-800">Infinite Endurance</p>
                    <p className="text-stone-500 text-sm leading-relaxed">Up to 40 hours of continuous use on a single charge. Rapid charge technology gets you moving fast.</p>
                </div>
            </motion.div>

            {/* Reviews Section */}
            <div className="max-w-7xl mx-auto mt-32 border-t border-stone-200 pt-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 text-stone-900">
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-2">Social</h4>
                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter">Voices of Electro</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white border border-stone-200 p-8 shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-black' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-stone-600 text-sm leading-relaxed mb-8 font-medium">"{review.comment}"</p>
                            <div className="flex items-center gap-4 border-t border-stone-100 pt-6">
                                <span className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-black text-stone-900 border border-stone-200 uppercase">
                                    {review.name.charAt(0)}
                                </span>
                                <span className="text-stone-900 font-bold text-sm tracking-tight">{review.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Related Products */}
            <div className="max-w-7xl mx-auto mt-32 mb-16 border-t border-stone-200 pt-20">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-2">Discovery</h4>
                 <h3 className="text-4xl font-black tracking-tighter text-stone-900 mb-12">Related Creations</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {relatedProducts.map((item) => (
                        <Link to={`/product/${item.id}`} key={item.id} className="group cursor-pointer">
                            <div className="overflow-hidden bg-stone-50 border border-stone-200 p-6 mb-4 group-hover:shadow-xl transition-all duration-700">
                                <img
                                    src={item.variants[0].img}
                                    alt={item.name}
                                    className="w-full h-48 object-contain group-hover:scale-110 transition duration-700"
                                />
                            </div>
                            <div className="px-1 space-y-2">
                                <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">{item.title}</p>
                                <h2 className="text-sm font-bold group-hover:text-stone-600 transition text-stone-900 leading-tight">
                                    {item.name}
                                </h2>
                                <p className="text-stone-900 font-black text-sm">
                                    {item.variants[0].price}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
