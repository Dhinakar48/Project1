import { Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import Home from "./Home"
import ProductDetails from "./ProductDetails"
import Cart from "./Cart"
import Wishlist from "./Wishlist"
import CategoryPage from "./CategoryPage"
import ShopAll from "./ShopAll"
import ScrollToTop from "./ScrollToTop"
import SellerLogin from "./SellerLogin"
import SellerDashboard from "./SellerDashboard/SellerDashboard"
import SellerRegister from "./SellerRegister"
import PortalSelection from "./PortalSelection"
import Login from "./Login"
import UserRegister from "./UserRegister"


function App () {
  const location = useLocation();
  const authPaths = ["/seller-login", "/seller-register", "/seller-dashboard", "/portal-selection", "/login", "/signup"];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <div className="overflow-x-hidden bg-white text-stone-900 min-h-screen">
      <ScrollToTop />
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/shop-all" element={<ShopAll />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/seller-register" element={<SellerRegister />} />
        <Route path="/portal-selection" element={<PortalSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<UserRegister />} />
      </Routes>






      {!isAuthPage && <Footer />}
    </div>
  )
}

export default App