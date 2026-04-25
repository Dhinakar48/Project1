import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useStore } from "./StoreContext";
import { FaBagShopping, FaCheck, FaHeart } from "react-icons/fa6";

export default function ProductDetails() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedColorId, setSelectedColorId] = useState(null);
    const [selectedMemoryId, setSelectedMemoryId] = useState(null);
    const [lastSelectedType, setLastSelectedType] = useState('memory');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);

    const { addToCart, toggleWishlist, wishlist, userProfile } = useStore();
    
    // Move logic here
    const specs = Array.isArray(product?.specifications) 
        ? product.specifications 
        : (product?.specifications ? Object.entries(product.specifications).map(([k, v]) => ({ key: k, value: v })) : []);

    const colorVariants = specs.filter(s => s.key?.toLowerCase().includes('color'));
    const ramSpecs = specs.filter(s => s.key?.toLowerCase() === 'ram');
    const romSpecs = specs.filter(s => s.key?.toLowerCase() === 'rom' || s.key?.toLowerCase() === 'storage' || s.key?.toLowerCase() === 'memory');
    const preCombined = specs.filter(s => 
        (s.value && typeof s.value === 'string' && s.value.includes('+') && (s.value.toLowerCase().includes('gb') || s.value.toLowerCase().includes('ram'))) ||
        s.key?.toLowerCase() === 'configuration'
    );

    let memoryVariants = [];
    if (preCombined.length > 0) {
        memoryVariants = preCombined;
    } else if (ramSpecs.length > 0 || romSpecs.length > 0) {
        const count = Math.max(ramSpecs.length, romSpecs.length);
        for (let i = 0; i < count; i++) {
            const ram = ramSpecs[i];
            const rom = romSpecs[i];
            const primary = rom || ram;
            if (!primary) continue;
            memoryVariants.push({
                variant_id: primary.variant_id,
                key: 'Variant',
                value: rom && ram ? `${rom.value} + ${ram.value}` : (rom?.value || ram?.value),
                price: primary.price,
                mrp: primary.mrp || product.mrp,
                stock: primary.stock
            });
        }
    }

    const gallery = product?.images && product.images.length > 0 ? product.images : ['/placeholder.png'];

    const isWishlisted = product && wishlist.some(item => item.product_id === product.product_id);

    const [addedToCart, setAddedToCart] = useState(false);

    // The dynamic logic moves below where it has access to product/variants
    // after loading checks.

    const [reviews, setReviews] = useState([]);
    const [fetchingReviews, setFetchingReviews] = useState(true);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "", img: null });

    const fetchReviews = async () => {
        setFetchingReviews(true);
        try {
            const res = await axios.get(`http://localhost:5000/product-reviews/${id}`);
            setReviews(res.data);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setFetchingReviews(false);
        }
    };

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewReview({ ...newReview, img: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting review. UserProfile:", userProfile);
        if (!userProfile || !userProfile.customerId) {
            alert("Session issue: Please logout and login again to post a review.");
            console.error("Missing customerId in userProfile:", userProfile);
            return;
        }
        if (newReview.comment) {
            const payload = {
                customerId: userProfile.customerId,
                productId: id,
                rating: newReview.rating,
                body: newReview.comment,
                title: "Verified Purchase",
                imageUrl: newReview.img
            };
            console.log("Review payload:", payload);
            try {
                const res = await axios.post("http://localhost:5000/add-review", payload);
                setReviews([res.data, ...reviews]);
                setNewReview({ rating: 5, comment: "", img: null });
            } catch (err) {
                console.error("Error posting review:", err);
                alert("Failed to post review. Please try again.");
            }
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
        const storeProduct = {
            id: product.product_id,
            name: product.name,
            price: activePrice,
            mrp: activeMRP,
            img: gallery[0] || '/placeholder.png'
        };
        const variant = {
            id: selectedVarId || `default-${product.product_id}`,
            name: activeVariant?.key || 'Standard',
            value: activeValue || 'Default',
            price: activePrice,
            mrp: activeMRP,
            img: activeImage
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
        fetchReviews();
        setSelectedImageIndex(0);
    }, [id]);

    useEffect(() => {
        // Use the already calculated 'specs' from the component body
        // But since we need it in useEffect, we recalculate or use local
        const currentSpecs = Array.isArray(product?.specifications) 
            ? product.specifications 
            : (product?.specifications ? Object.entries(product.specifications).map(([k, v]) => ({ key: k, value: v })) : []);

        const ramSpecs = currentSpecs.filter(s => s.key?.toLowerCase() === 'ram');
        const romSpecs = currentSpecs.filter(s => s.key?.toLowerCase() === 'rom' || s.key?.toLowerCase() === 'storage' || s.key?.toLowerCase() === 'memory');
        const colors = currentSpecs.filter(s => s.key?.toLowerCase().includes('color'));
        const preCombined = currentSpecs.filter(s => 
            (s.value && typeof s.value === 'string' && s.value.includes('+') && (s.value.toLowerCase().includes('gb') || s.value.toLowerCase().includes('ram'))) ||
            s.key?.toLowerCase() === 'configuration'
        );

        if (colors.length > 0) setSelectedColorId(colors[0].variant_id || 0);
        
        if (preCombined.length > 0) {
            setSelectedMemoryId(preCombined[0].variant_id || 0);
        } else if (romSpecs.length > 0) {
            setSelectedMemoryId(romSpecs[0].variant_id || 0);
        } else if (ramSpecs.length > 0) {
            setSelectedMemoryId(ramSpecs[0].variant_id || 0);
        }
    }, [product]);

    useEffect(() => {
        // Find if the current image suggests a specific color
        if (colorVariants.length > 0 && selectedImageIndex < colorVariants.length) {
            setSelectedColorId(colorVariants[selectedImageIndex].variant_id);
            setLastSelectedType('color');
        }
    }, [selectedImageIndex]);

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





    const handleVariantSelect = (vId) => {
        // Identify what type of variant was selected
        const isColor = colorVariants.some(cv => cv.variant_id === vId);
        const isMemory = memoryVariants.some(mv => mv.variant_id === vId);

        if (isColor) {
            setSelectedColorId(vId);
            setLastSelectedType('color');
            const colorIndex = colorVariants.findIndex(cv => cv.variant_id === vId);
            if (colorIndex !== -1 && gallery[colorIndex]) {
                setSelectedImageIndex(colorIndex);
            }
        } else if (isMemory) {
            setSelectedMemoryId(vId);
            setLastSelectedType('memory');
        }
    };

    const selectedVarId = lastSelectedType === 'color' ? (selectedColorId || selectedMemoryId) : (selectedMemoryId || selectedColorId);

    const activeColor = colorVariants.find(cv => cv.variant_id === selectedColorId);
    const activeMemory = memoryVariants.find(mv => mv.variant_id === selectedMemoryId) || 
                         specs.find(s => s.variant_id === selectedMemoryId);

    const activeVariant = lastSelectedType === 'color' ? (activeColor || activeMemory) : (activeMemory || activeColor);

    const activePrice = activeVariant?.price || product.price;
    const activeMRP = activeVariant?.mrp || product.mrp;
    const activeStock = activeVariant?.stock !== undefined ? parseInt(activeVariant.stock) : parseInt(product.stock_quantity);
    const activeValue = activeVariant?.value || null;

    const priceString = `₹${parseFloat(activePrice).toLocaleString()}`;
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
                        <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-xl md:text-2xl font-bold mb-1 tracking-tight leading-tight text-stone-900 uppercase">
                            {product.name}
                        </motion.h1>                        {/* Color Selection */}
                        {colorVariants.length > 0 && (
                            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="mb-6">
                                <h3 className="text-[10px] font-black mt-2 uppercase tracking-widest text-stone-400">Selected Color: <span className="text-stone-900 ml-1">{activeColor?.value || 'N/A'}</span></h3>
                            </motion.div>
                        )}

                        {/* Gallery Thumbnails */}
                        {gallery.length > 1 && (
                            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="mb-5">
                                <div className="flex gap-3">
                                    {gallery.map((img, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`w-14 h-14 rounded-xl cursor-pointer transition-all duration-300 border overflow-hidden ${selectedImageIndex === index ? `ring-2 ring-stone-900 scale-105` : 'opacity-60 hover:opacity-100 border-stone-200'}`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Memory Variant Boxes */}
                        {memoryVariants.length > 0 && (
                            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="mb-8">
                                <h3 className="text-lg font-bold text-stone-800 mb-4">Vareint: <span className="text-stone-500 font-medium">{activeMemory?.value || ''}</span></h3>
                                <div className="flex flex-wrap gap-4">
                                    {memoryVariants.map((v) => {
                                        const disc = v.mrp && v.price && parseFloat(v.mrp) > parseFloat(v.price) ? Math.round(((parseFloat(v.mrp) - parseFloat(v.price)) / parseFloat(v.mrp)) * 100) : 0;
                                        return (
                                            <div
                                                key={v.variant_id}
                                                onClick={() => handleVariantSelect(v.variant_id)}
                                                className={`flex flex-col p-4 min-w-[150px] border rounded-2xl cursor-pointer transition-all duration-300 ${selectedMemoryId === v.variant_id ? 'border-stone-900 bg-stone-50 shadow-lg scale-[1.02]' : 'border-stone-200 hover:border-stone-400 bg-white'}`}
                                            >
                                                <span className="text-sm font-bold text-stone-900 mb-2">{v.value}</span>
                                                <div className="border-t border-stone-100 pt-2 flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        {disc > 0 && <span className="text-green-700 text-xs font-black">↓{disc}%</span>}
                                                        {v.mrp && parseFloat(v.mrp) > parseFloat(v.price) && (
                                                            <span className="text-stone-400 line-through text-xs">₹{parseFloat(v.mrp).toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-lg font-black text-stone-900 tracking-tight">₹{parseFloat(v.price).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}



                        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col gap-1 mb-8">
                            <div className="flex items-baseline gap-3">
                                <p className="text-3xl font-black text-stone-900 tracking-tighter">
                                    {priceString}
                                </p>
                                {activeMRP && parseFloat(activeMRP) > parseFloat(activePrice) && (
                                    <span className="text-stone-400 line-through text-md font-medium">
                                        ₹{parseFloat(activeMRP).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${activeStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {activeStock > 0 ? `Plenty in Stock (${activeStock})` : 'Temporarily Unavailable'}
                            </span>
                        </motion.div>

                        <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="text-stone-500 mb-6 leading-relaxed max-w-lg text-sm font-medium text-justify">
                            {product.description}
                        </motion.p>

                        <motion.div
                            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                            className="flex items-stretch gap-4 mb-10"
                        >
                            {/* Add to Cart Icon Button - Left */}
                            <motion.button
                                onClick={handleAddToCart}
                                disabled={activeStock === 0}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex-1 flex items-center justify-center p-1 transition-all duration-300 border-2 ${activeStock === 0 ? 'bg-stone-50 border-stone-100 text-stone-200' : addedToCart ? 'bg-green-600 border-green-600 text-white' : 'bg-stone-100 border-stone-200 text-stone-900 hover:bg-stone-200'}`}
                                title="Add to Bag"
                            >
                                {addedToCart ? <FaCheck size={20} /> : <FaBagShopping size={20} />}
                            </motion.button>

                            {/* Buy Now - Center Action */}
                            <motion.button
                                onClick={activeStock > 0 ? handleBuyNow : undefined}
                                disabled={activeStock === 0}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-[4] py-5 bg-stone-900 text-amber-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-stone-800 transition shadow-2xl shadow-stone-900/20 disabled:bg-stone-100 disabled:text-stone-300"
                            >
                                {activeStock > 0 ? "Buy Now" : "Unavailable"}
                            </motion.button>

                            {/* Wishlist Icon Button - Right */}
                            <motion.button
                                onClick={() => toggleWishlist(product)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex-1 flex items-center justify-center p-1 border-2 transition-all duration-300 ${isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-stone-200 bg-white text-stone-400 hover:border-stone-900 hover:text-stone-900'}`}
                                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                <FaHeart size={20} className={isWishlisted ? 'fill-current' : ' stroke-2 '} />
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


                        {specs && specs.map((spec, index) => (
                            spec.value && spec.value !== "N/A" && !['color', 'ram', 'rom', 'storage', 'memory'].some(k => spec.key.toLowerCase().includes(k)) && (
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
                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2">Reviewer</label>
                                <div className="w-full bg-stone-50 border-none p-4 text-sm text-stone-400 font-bold">
                                    {userProfile ? userProfile.name : "Sign in to post"}
                                </div>
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
                                    {newReview.img && <img src={newReview.img} alt="preview" className="w-16 h-16 object-cover rounded-full border border-stone-200 shadow-sm transition-transform hover:scale-105" />}
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
                    {reviews.length > 0 ? (
                        reviews.map((review, idx) => (
                            <div key={review.review_id || idx} className="bg-white border border-stone-200 p-8 transition-all duration-500">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex gap-1 mb-6">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-black' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-stone-600 text-sm leading-relaxed mb-6 font-medium">"{review.body || review.comment}"</p>
                                    </div>
                                    {(review.image_url || review.img) && (
                                        <img src={review.image_url || review.img} alt="Review" className="w-20 h-20 object-cover rounded-full border-2 border-stone-100 hover:scale-110 transition duration-500 shadow-sm shrink-0" />
                                    )}
                                </div>
                                <div className="flex items-center border-t border-stone-100 pt-6">
                                    <span className="text-stone-900 font-bold text-sm tracking-tight">{review.customer_name || review.name}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-stone-100 border border-dashed border-stone-300">
                            <p className="text-stone-400 font-black uppercase tracking-widest text-xs">No one has spoken yet. Be the first.</p>
                        </div>
                    )}
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
