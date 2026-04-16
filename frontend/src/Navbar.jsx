import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaOpencart, FaUser, FaShopify } from "react-icons/fa6";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { PiHeartStraight } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "./StoreContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { featuredProductsArray as products } from "./data";

const offers = [
  "🔥 Get 20% off all Bose Buds Pro - Limited Time!",
  "🚚 Free 2-Day Shipping on the new Vertex Pro 16",
  "⌚ Bundle a Pulse Watch X with any Audio product for 15% off"
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [catDropdown, setCatDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(0);
  const location = useLocation();
  const isSellerDashboard = location.pathname === "/seller-dashboard";
  const { cart, wishlist } = useStore();
  const navigate = useNavigate();
  const userRef = useRef(null);

  const activeUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [profileImg, setProfileImg] = useState(null);

  useEffect(() => {
    if (activeUser.email) {
      axios.get(`http://127.0.0.1:5000/profile/${activeUser.email}`)
        .then(res => setProfileImg(res.data.profile_picture))
        .catch(err => console.error("Error fetching profile pic:", err));
    }
  }, [activeUser.email]);

  // Search logic
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOffer((prev) => (prev === offers.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 6);
    setSearchResults(results);
  }, [searchQuery]);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchResultClick = (id) => {
    navigate(`/product/${id}`);
    setSearchQuery("");
    setShowSearch(false);
  };

  return (
    <>
      <div className="bg-stone-900 text-stone-50 py-2 px-4 text-xs sm:text-sm font-medium flex items-center justify-center relative overflow-hidden h-9 md:h-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentOffer}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute tracking-wide"
          >
            {offers[currentOffer]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="bg-white/95 backdrop-blur-md text-stone-900 border-b border-stone-100 p-2 sticky top-0 z-50">

        <div className="grid grid-cols-3 items-center max-w-7xl mx-auto py-1">

          {/* Left: Logo & Categories Dropdown */}
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold tracking-tight text-amber-600">ElectroShop</Link>

            <div className={`hidden md:block relative ${isSellerDashboard ? 'hidden' : ''}`}>
              <button
                onMouseEnter={() => setCatDropdown(true)}
                onMouseLeave={() => setCatDropdown(false)}
                className="mt-1 text-stone-500 hover:text-amber-600 font-bold text-xs uppercase tracking-widest flex items-center gap-1 transition"
              >
                Categories
                <svg className={`w-3 h-3 transition-transform ${catDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              <AnimatePresence>
                {catDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseEnter={() => setCatDropdown(true)}
                    onMouseLeave={() => setCatDropdown(false)}
                    className="absolute top-full left-0 mt-2 w-48 bg-white border border-stone-100 p-4 flex flex-col gap-3 z-[60]"
                  >
                    <Link to="/category/Audio" onClick={() => setCatDropdown(false)} className="text-stone-500 hover:text-amber-600 text-xs font-black uppercase tracking-widest cursor-pointer transition">Audio</Link>
                    <Link to="/category/Wearables" onClick={() => setCatDropdown(false)} className="text-stone-500 hover:text-amber-600 text-xs font-black uppercase tracking-widest cursor-pointer transition">Wearables</Link>
                    <Link to="/category/Computing" onClick={() => setCatDropdown(false)} className="text-stone-500 hover:text-amber-600 text-xs font-black uppercase tracking-widest cursor-pointer transition">Computing</Link>
                    <Link to="/category/Accessories" onClick={() => setCatDropdown(false)} className="text-stone-500 hover:text-amber-600 text-xs font-black uppercase tracking-widest cursor-pointer transition">Accessories</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className={`hidden md:flex justify-center relative ${isSellerDashboard ? 'invisible opacity-0' : ''}`} ref={searchRef}>
            <div className="flex items-center rounded-full px-4 py-2 w-full max-w-md focus-within:bg-white transition-colors border border-amber-400">
              <FaSearch className="text-amber-600 mr-3 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                placeholder="Search products..."
                className="bg-transparent outline-none text-sm w-full text-stone-900"
              />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearch && (searchQuery.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-full max-w-md bg-white border border-stone-200 z-[60] overflow-hidden rounded-xl"
                >
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSearchResultClick(product.id)}
                          className="flex items-center gap-4 p-3 hover:bg-stone-50 cursor-pointer transition group border-b border-stone-50 last:border-none"
                        >
                          <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={product.variants[0].img} className="w-full h-full object-contain p-1" alt={product.name} />
                          </div>
                          <div className="group-hover:text-amber-600 transition">
                            <h4 className="text-sm font-bold text-stone-900 truncate">{product.name}</h4>
                            <p className="text-[10px] text-amber-500/60 uppercase tracking-widest font-black">{product.title}</p>
                          </div>
                          <div className="text-sm font-black text-amber-600">
                            {product.variants[0].price}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-stone-400 text-sm">
                      No matching products found
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Actions */}
          <div className="flex gap-5 xl:gap-8 items-center justify-end text-stone-400">
            <div className="md:hidden">
              <FaSearch className="text-amber-600 text-sm" />
            </div>

            {!isSellerDashboard && (
              <>
                <Link to="/wishlist" className="relative hover:text-amber-600 cursor-pointer transition">
                  <PiHeartStraight size={22} />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                <Link to="/cart" className="relative hover:text-amber-600 cursor-pointer transition">
                  <FaOpencart size={24} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </Link>
              </>
            )}

            <div className="relative" ref={userRef}>
              <div
                onClick={() => setUserDropdown(!userDropdown)}
                className="hover:text-amber-600 transition cursor-pointer flex items-center justify-center p-1"
              >
                {profileImg ? (
                  <img src={profileImg} alt="Profile" className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border border-amber-600/20 shadow-sm" />
                ) : (
                  <FaUser size={18} />
                )}
              </div>

              <AnimatePresence>
                {userDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-3 w-48 bg-white border border-stone-100 shadow-xl rounded-xl overflow-hidden z-[60]"
                  >
                    <div className="p-2 flex flex-col">
                      <Link to="/my-account" onClick={() => setUserDropdown(false)} className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-stone-500 hover:text-amber-600 hover:bg-stone-50 transition rounded-lg flex items-center gap-3">
                        <FaUser size={12} /> My Account
                      </Link>
                      <Link to="/seller-login" onClick={() => setUserDropdown(false)} className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-stone-500 hover:text-amber-600 hover:bg-stone-50 transition rounded-lg flex items-center gap-3">
                        <FaShopify size={12} /> Seller Portal
                      </Link>
                      <div className="h-[1px] bg-stone-50 my-1 mx-2" />

                      {localStorage.getItem("user") ? (
                        <button
                          onClick={() => {
                            localStorage.removeItem("user");
                            setUserDropdown(false);
                            navigate("/login");
                          }}
                          className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition rounded-lg text-left"
                        >
                          Sign Out
                        </button>
                      ) : (
                        <Link to="/login" onClick={() => setUserDropdown(false)} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-stone-900 hover:text-amber-600 transition rounded-lg">
                          Sign In
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="md:hidden">
              {open ? (
                <FaTimes size={22} onClick={() => setOpen(false)} className="cursor-pointer" />
              ) : (
                <FaBars size={22} onClick={() => setOpen(true)} className="cursor-pointer" />
              )}
            </div>
          </div>
        </div>

        {open && (
          <div className="md:hidden mt-4 flex flex-col gap-4 px-4 bg-stone-100 pb-6 pt-4 rounded-b-2xl absolute left-0 right-0 z-50 border-t border-stone-200">
            <div className="flex items-center bg-stone-200 rounded-full px-4 py-2.5 mb-2">
              <FaSearch className="text-stone-500 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent outline-none w-full text-stone-900 placeholder-stone-500"
              />
            </div>

            {/* Mobile Search Results */}
            {searchQuery.length > 0 && (
              <div className="max-h-60 overflow-y-auto mb-4 bg-white rounded-xl border border-stone-200 p-2">
                {searchResults.length > 0 ? (
                  searchResults.map(p => (
                    <div key={p.id} onClick={() => handleSearchResultClick(p.id)} className="flex items-center gap-3 p-3 border-b border-stone-50 last:border-none">
                      <img src={p.variants[0].img} className="w-10 h-10 object-contain" alt={p.name} />
                      <div>
                        <div className="text-xs font-bold text-stone-900">{p.name}</div>
                        <div className="text-[10px] text-stone-400 font-bold">{p.variants[0].price}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-stone-400">No matches</div>
                )}
              </div>
            )}

            {!isSellerDashboard && (
              <>
                <Link to="/category/Audio" onClick={() => setOpen(false)} className="border-b border-stone-200 pb-2 text-stone-700 font-medium">Audio</Link>
                <Link to="/category/Wearables" onClick={() => setOpen(false)} className="border-b border-stone-200 pb-2 text-stone-700 font-medium">Wearables</Link>
                <Link to="/category/Computing" onClick={() => setOpen(false)} className="border-b border-stone-200 pb-2 text-stone-700 font-medium">Computing</Link>
                <Link to="/category/Accessories" onClick={() => setOpen(false)} className="border-b border-stone-200 pb-2 text-stone-700 font-medium">Accessories</Link>
              </>
            )}

            <div className="flex gap-6 pt-4 text-stone-700">
              {!isSellerDashboard && (
                <>
                  <Link to="/wishlist" onClick={() => setOpen(false)} className="relative">
                    <PiHeartStraight size={20} />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-stone-900 text-stone-50 text-[10px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                  <Link to="/cart" onClick={() => setOpen(false)} className="relative">
                    <FaOpencart size={24} />
                    {cart.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-stone-900 text-stone-50 text-[10px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                        {cart.reduce((total, item) => total + item.quantity, 0)}
                      </span>
                    )}
                  </Link>
                </>
              )}
              <div className="flex flex-col gap-5 w-full pt-2">
                <Link to="/my-account" onClick={() => setOpen(false)} className="flex items-center gap-3 text-stone-700">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {profileImg ? (
                      <img src={profileImg} alt="Profile" className="w-full h-full rounded-full object-cover border border-amber-600/20 shadow-sm" />
                    ) : (
                      <FaUser size={18} />
                    )}
                  </div>
                  <span className="text-sm font-bold">My Account</span>
                </Link>
                <Link to="/seller-login" onClick={() => setOpen(false)} className="flex items-center gap-3 text-stone-700">
                  <FaShopify size={18} />
                  <span className="text-sm font-bold">Seller Portal</span>
                </Link>

                {localStorage.getItem("user") ? (
                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      setOpen(false);
                      navigate("/login");
                    }}
                    className="flex items-center gap-3 text-red-600 font-black pt-2 border-t border-stone-200 mt-2 text-left w-full"
                  >
                    <span className="text-sm">Sign Out</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-3 pt-2 border-t border-stone-200 mt-2 text-left">
                    <Link to="/login" onClick={() => setOpen(false)} className="text-stone-900 font-black text-sm">
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}