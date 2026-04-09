import { Routes, Route } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import Home from "./Home"
import ProductDetails from "./ProductDetails"
import Cart from "./Cart"
import Wishlist from "./Wishlist"
import CategoryPage from "./CategoryPage"
import ShopAll from "./ShopAll"
import ScrollToTop from "./ScrollToTop"

function App () {

  return (
    <div className="overflow-x-hidden bg-white text-stone-900 min-h-screen">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/shop-all" element={<ShopAll />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App