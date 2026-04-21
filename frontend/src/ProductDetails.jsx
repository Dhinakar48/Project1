import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useStore } from "./StoreContext";
import { FaBagShopping, FaCheck } from "react-icons/fa6";

export default function ProductDetails() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);

    const { addToCart, toggleWishlist, wishlist } = useStore();
    const isWishlisted = product && wishlist.some(item => item.product_id === product.product_id);

    const [addedToCart, setAddedToCart] = useState(false);

    // The dynamic logic moves below where it has access to product/variants
    // after loading checks.

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

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/product/${id}`);
            const data = res.data;
            setProduct(data);

            // Fetch related products (same category)
            if (data.category_name) {
                const relatedRes = await axios.get(`http://localhost:5000/products/category/${data.category_name}`);
                setRelatedProducts(relatedRes.data.filter(p => p.product_id !== data.product_id).slice(0, 4));
            }
        } catch (err) {
            console.error("Error fetching product:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        // Adapt db product to store logic
        const storeProduct = {
            id: product.product_id,
            name: product.name,
            price: product.price,
            img: product.gallery && product.gallery.length > 0 ? product.gallery[0].image_url : '/placeholder.png'
        };
        const variant = {
            id: `v${product.product_id}-${activeColor || 'default'}`,
            name: activeColor || 'Standard',
            img: activeImage,
            price: `₹${parseFloat(activePrice).toLocaleString()}`
        };
        addToCart(storeProduct, variant);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate("/order");
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProduct();
        setSelectedImageIndex(0);
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Accessing Vault...</p>
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-stone-900 mb-2">Item Not Found</h2>
                <Link to="/" className="text-amber-600 font-bold uppercase tracking-widest text-xs border-b border-amber-600 pb-1">Return to Laboratory</Link>
            </div>
        </div>
    );

    // Dynamic Price/Color Selection logic
    const colorVariants = product.specifications && Array.isArray(product.specifications)
        ? product.specifications.filter(s => s.key?.toLowerCase().includes('color'))
        : [];

    const activeVariant = colorVariants.length > 0 
        ? colorVariants[selectedImageIndex % colorVariants.length]
        : null;

    const activeColor = activeVariant?.value || null;
    const activePrice = (activeVariant?.price && parseFloat(activeVariant.price) > 0) 
        ? activeVariant.price 
        : product.price;

    const activeStock = (activeVariant?.stock !== undefined && activeVariant?.stock !== null) 
    ? parseInt(activeVariant.stock) 
    : parseInt(product.stock_quantity);

    const priceString = `₹${parseFloat(activePrice).toLocaleString()}`;
    const gallery = product.images && product.images.length > 0 ? product.images : ['/placeholder.png'];
    const activeImage = gallery[selectedImageIndex] || '/placeholder.png';

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 pt-12 pb-4 px-6 md:px-16 overflow-hidden relative font-sans">

            {/* Back Button */}
            <motion.div
                className="max-w-7xl mx-auto mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link to={product?.category_name ? `/category/${product.category_name}` : "/"} className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition duration-300 group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-sm font-bold tracking-widest uppercase text-stone-900">Back to Collection</span>
                </Link>
            </motion.div>

            {/* Main Product Card - Just Border */}
            <div className="max-w-6xl mx-auto md:py-12 px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24">

                    <motion.div
                        className="lg:flex-1 w-full max-w-[480px] relative group aspect-square flex items-center justify-center rounded-[40px] overflow-hidden border border-amber-200 bg-white shadow-inner"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="absolute inset-0 blur-3xl opacity-10 rounded-full"></div>

                        {/* Navigation Arrows */}
                        {gallery.length > 1 && (
                            <>
                                <div className="absolute inset-y-0 left-0 z-20 flex items-center">
                                    <button
                                        onClick={() => setSelectedImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length)}
                                        className="p-3 ml-6 bg-white/70 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white text-stone-900 border border-amber-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="absolute inset-y-0 right-0 z-20 flex items-center">
                                    <button
                                        onClick={() => setSelectedImageIndex((prev) => (prev + 1) % gallery.length)}
                                        className="p-3 mr-6 bg-white/70 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white text-stone-900 border border-amber-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        )}

                        <motion.img
                            key={selectedImageIndex}
                            src={activeImage}
                            alt={product.name}
                            className="w-[85%] h-[85%] object-contain relative z-10"
                            initial={{ opacity: 0.6 }}
                            animate={{ opacity: 1, scale: [0.95, 1] }}
                            transition={{ duration: 0.5 }}
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
                        <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-amber-600 text-xs md:text-sm font-black tracking-[0.3em] uppercase mb-4">
                            {product.brand}
                        </motion.p>
                        <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-2xl md:text-4xl font-bold mb-1 tracking-tight leading-tight text-stone-900 uppercase">
                            {product.name}
                        </motion.h1>

                        {/* Dynamic Variant/Color Display */}
                        {activeColor && (
                            <motion.div 
                                variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                                key={selectedImageIndex}
                                className="flex items-center gap-2 mb-4"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Selected Color:</span>
                                <span className="text-xs font-bold text-stone-800 uppercase tracking-tight bg-amber-50 px-2 py-0.5 rounded">
                                    {activeColor}
                                </span>
                            </motion.div>
                        )}

                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-wrap items-center gap-6 mb-6 border-b border-amber-100 pb-6 w-full">
                            <div className="flex flex-col">
                                <p className="text-3xl font-black text-amber-600 leading-none">
                                    {priceString}
                                </p>
                                {product.mrp && parseFloat(product.mrp) > parseFloat(product.price) && (
                                    <span className="text-stone-400 line-through text-xs mt-1 font-bold">
                                        MRP: ₹{parseFloat(product.mrp).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <span className={`px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-colors ${activeStock > 0 ? 'bg-amber-600' : 'bg-red-500'}`}>
                                {activeStock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </motion.div>
                        <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-stone-500 mb-6 leading-relaxed max-w-lg text-lg font-medium">
                            {product.description}
                        </motion.p>

                        {gallery.length > 1 && (
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3">Gallery</h3>
                                <div className="flex gap-4">
                                    {gallery.map((img, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`w-12 h-12 rounded-xl cursor-pointer transition-all duration-300 border overflow-hidden ${selectedImageIndex === index ? `ring-2 ring-offset-2 ring-offset-white ring-amber-600 scale-110` : 'hover:scale-110 opacity-60 hover:opacity-100 border-stone-200'}`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                            className="flex items-stretch gap-3"
                        >
                            <motion.button
                                onClick={handleAddToCart}
                                disabled={activeStock === 0}
                                whileHover={activeStock > 0 ? { scale: 1.01 } : {}}
                                whileTap={activeStock > 0 ? { scale: 0.99 } : {}}
                                className={`w-16 flex items-center justify-center transition-all duration-300 border ${activeStock === 0 ? 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed' : addedToCart ? 'bg-green-600 text-white border-green-600' : 'bg-stone-100 text-stone-900 border-stone-200 hover:bg-stone-200'}`}
                                title={activeStock === 0 ? "Out of Stock" : addedToCart ? "Added" : "Add to Bag"}
                            >
                                {addedToCart ? <FaCheck size={18} /> : <FaBagShopping size={18} />}
                            </motion.button>

                            <motion.button
                                onClick={activeStock > 0 ? handleBuyNow : undefined}
                                disabled={activeStock === 0}
                                whileHover={activeStock > 0 ? { scale: 1.01 } : {}}
                                whileTap={activeStock > 0 ? { scale: 0.99 } : {}}
                                className={`w-64 py-5 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${activeStock === 0 ? 'bg-stone-100 text-stone-300 cursor-not-allowed' : 'bg-stone-900 text-amber-500 hover:bg-stone-800 shadow-stone-900/10'}`}
                            >
                                {activeStock > 0 ? "Buy Now" : "Sold Out"}
                            </motion.button>

                            <motion.button
                                onClick={() => toggleWishlist(product)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className={`w-16 flex items-center justify-center border transition-all duration-300 ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-stone-200 text-stone-400 hover:border-stone-900 hover:bg-stone-50 bg-white'}`}
                                title="Wishlist"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isWishlisted ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Technical Specifications Section */}
            <motion.div
                className="max-w-7xl mx-auto mt-16 border-t border-stone-200 pt-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-1/4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-2">Specifications</h4>
                        <h3 className="text-3xl font-black text-stone-900 tracking-tight leading-none mb-4">Technical Details</h3>
                        <p className="text-stone-500 text-xs leading-relaxed">
                            Engineered for excellence and high performance.
                        </p>
                    </div>

                    <div className="lg:w-3/4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-6">

                        {product.height && parseFloat(product.height) > 0 && (
                            <div className="border-b border-stone-100 pb-3 group hover:border-amber-600 transition-colors duration-500">
                                <h5 className="text-[8px] font-black uppercase tracking-widest text-stone-400 mb-1 group-hover:text-amber-600 transition-colors">Height</h5>
                                <p className="text-sm font-bold text-stone-800">{product.height} mm</p>
                            </div>
                        )}

                        {product.weight && parseFloat(product.weight) > 0 && (
                            <div className="border-b border-stone-100 pb-3 group hover:border-amber-600 transition-colors duration-500">
                                <h5 className="text-[8px] font-black uppercase tracking-widest text-stone-400 mb-1 group-hover:text-amber-600 transition-colors">Weight</h5>
                                <p className="text-sm font-bold text-stone-800">{product.weight} grms</p>
                            </div>
                        )}

                        {product.width && parseFloat(product.width) > 0 && (
                            <div className="border-b border-stone-100 pb-3 group hover:border-amber-600 transition-colors duration-500">
                                <h5 className="text-[8px] font-black uppercase tracking-widest text-stone-400 mb-1 group-hover:text-amber-600 transition-colors">Width</h5>
                                <p className="text-sm font-bold text-stone-800">{product.width} mm</p>
                            </div>
                        )}

                        {product.breadth && parseFloat(product.breadth) > 0 && (
                            <div className="border-b border-stone-100 pb-3 group hover:border-amber-600 transition-colors duration-500">
                                <h5 className="text-[8px] font-black uppercase tracking-widest text-stone-400 mb-1 group-hover:text-amber-600 transition-colors">Breadth</h5>
                                <p className="text-sm font-bold text-stone-800">{product.breadth} mm</p>
                            </div>
                        )}


                        {product.specifications && product.specifications.map((spec, index) => (
                            spec.value && spec.value !== "N/A" && !spec.key.toLowerCase().includes('color') && (
                                <div key={index} className="border-b border-stone-100 pb-3 group hover:border-amber-600 transition-colors duration-500">
                                    <h5 className="text-[8px] font-black uppercase tracking-widest text-stone-400 mb-1 group-hover:text-amber-600 transition-colors capitalize">{spec.key}</h5>
                                    <p className="text-sm font-bold text-stone-800">{spec.value}</p>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Reviews Section */}
            <div className="max-w-7xl mx-auto mt-20 border-t border-stone-200 pt-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 text-stone-900">
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-2">Social</h4>
                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter">Voices of Electro</h3>
                    </div>
                    <button
                        onClick={() => document.getElementById('review-form').scrollIntoView({ behavior: 'smooth' })}
                        className="text-[10px] font-black uppercase tracking-[0.3em] border-b-2 border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-all"
                    >
                        Share Your Experience
                    </button>
                </div>

                {/* Review Form */}
                <motion.div
                    id="review-form"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24 bg-white border border-stone-200 p-8 md:p-12"
                >
                    <h4 className="text-xl font-bold mb-8 tracking-tight">Write a Review</h4>
                    <form onSubmit={handleReviewSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2">Your Name</label>
                                <input
                                    type="text"
                                    value={newReview.name}
                                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                    className="w-full bg-stone-50 border-none p-4 text-sm focus:ring-1 focus:ring-stone-900 outline-none transition"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className={`text-2xl transition ${star <= newReview.rating ? 'text-black' : 'text-stone-200'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2">Upload Image</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="review-img"
                                    />
                                    <label
                                        htmlFor="review-img"
                                        className="bg-stone-100 px-6 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-stone-200 transition"
                                    >
                                        Choose File
                                    </label>
                                    {newReview.img && <img src={newReview.img} alt="preview" className="w-12 h-12 object-cover rounded" />}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6 flex flex-col">
                            <div className="flex-grow">
                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2">Your Review</label>
                                <textarea
                                    rows="5"
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    className="w-full bg-stone-50 border-none p-4 text-sm focus:ring-1 focus:ring-stone-900 outline-none transition h-full resize-none"
                                    placeholder="Tell us about your experience..."
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-amber-600 text-white py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition shadow-xl shadow-amber-600/10"
                            >
                                Post Review
                            </button>
                        </div>
                    </form>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white border border-stone-200 p-8 transition-all duration-500">
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-black' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-stone-600 text-sm leading-relaxed mb-6 font-medium">"{review.comment}"</p>
                            {review.img && (
                                <div className="mb-6 overflow-hidden">
                                    <img src={review.img} alt="Review" className="w-full h-40 object-cover rounded-sm hover:scale-105 transition duration-500" />
                                </div>
                            )}
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
                        <Link to={`/product/${item.product_id}`} key={item.product_id} className="group cursor-pointer">
                            <div className="overflow-hidden bg-stone-50 border border-stone-200 p-6 mb-4 transition-all duration-700 aspect-square flex items-center justify-center">
                                <img
                                    src={item.main_image || (item.images && item.images[0]) || '/placeholder.png'}
                                    alt={item.name}
                                    className="w-full h-full object-contain group-hover:scale-110 transition duration-700"
                                />
                            </div>
                            <div className="px-1 space-y-2">
                                <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">{item.category_name}</p>
                                <h2 className="text-sm font-bold group-hover:text-stone-600 transition text-stone-900 leading-tight uppercase font-black">
                                    {item.name}
                                </h2>
                                <p className="text-amber-600 font-black text-sm">
                                    ₹{parseFloat(item.price).toLocaleString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
