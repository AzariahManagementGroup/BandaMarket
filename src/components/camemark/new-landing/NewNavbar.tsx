import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Heart, Menu, ChevronDown, Globe, Shield, Headphones, Truck, CheckCircle } from "lucide-react";
import logo from "@/assets/camemark-logo.png";
import { getCartItems } from "@/utils/cart";

const NewNavbar = () => {
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const updateCount = () => {
      const items = getCartItems();
      const count = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
      setCartCount(count);
    };
    updateCount();
    window.addEventListener("cart_updated", updateCount);
    return () => window.removeEventListener("cart_updated", updateCount);
  }, []);

  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="bg-[#0b3624] text-white/90 text-xs py-2 hidden lg:block border-b border-white/10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-500" />
              <span>Free Delivery Across Africa</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-500" />
              <span>Verified Sellers</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-amber-500" />
              <span>24/7 Customer Support</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer">
              <Globe className="h-3 w-3" />
              <span>Ship to</span>
              <img src="https://flagcdn.com/w20/us.png" alt="US" className="h-3 ml-1" />
              <span className="ml-1">United States</span>
              <ChevronDown className="h-3 w-3" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <span>English (EN)</span>
              <ChevronDown className="h-3 w-3" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <span>USD</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white py-4 border-b">
        <div className="container mx-auto px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <img src={logo} alt="Banda Market" className="h-10 md:h-12 w-auto object-contain" />
          </Link>

          {/* Search Bar */}
          <div className="flex-grow max-w-3xl flex items-center w-full order-3 lg:order-2">
            <div className="flex w-full border-2 border-amber-500 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="px-4 py-2 bg-white flex items-center gap-2 cursor-pointer border-r text-sm text-gray-700 min-w-max hidden md:flex">
                All Categories <ChevronDown className="h-4 w-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search for products, brands and more..." 
                className="flex-grow px-4 py-2 outline-none text-sm min-w-0"
              />
              <button className="bg-amber-500 hover:bg-amber-600 transition-colors px-6 py-2 text-white flex items-center justify-center">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-6 order-2 lg:order-3">
            <div className="flex items-center gap-2 cursor-pointer hover:text-amber-500 transition-colors" onClick={() => navigate('/signin')}>
              <User className="h-6 w-6 text-gray-700" />
              <div className="hidden lg:block text-sm leading-tight">
                <span className="block text-gray-500 text-xs">Sign In</span>
                <span className="font-semibold text-gray-800">Account <ChevronDown className="inline h-3 w-3" /></span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 cursor-pointer hover:text-amber-500 transition-colors hidden sm:flex">
              <Heart className="h-6 w-6 text-gray-700" />
              <div className="hidden lg:block text-sm font-semibold text-gray-800">Wishlist</div>
            </div>

            <div className="flex items-center gap-2 cursor-pointer hover:text-amber-500 transition-colors relative" onClick={() => navigate('/cart')}>
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-700" />
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div className="hidden lg:block text-sm font-semibold text-gray-800">Cart</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-[#0b3624] text-white">
        <div className="container mx-auto px-4 flex items-center overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 bg-[#0f4d34] px-4 py-3 cursor-pointer hover:bg-opacity-80 shrink-0 font-semibold text-sm">
            <Menu className="h-5 w-5 mr-1" /> All Categories <ChevronDown className="h-4 w-4 ml-1" />
          </div>
          
          <nav className="flex items-center whitespace-nowrap ml-6 space-x-6 text-sm font-medium py-3">
            <a href="#" className="hover:text-amber-500 transition-colors">Deals</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Banda Brands</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Made in Africa</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Global Store</a>
            <a href="#" className="flex items-center text-amber-500 hover:text-amber-400 font-semibold gap-1 border border-amber-500/30 bg-amber-500/10 px-3 py-1 rounded-full transition-colors -my-1">
              <span className="text-sm">🎓</span> Banda Academy
            </a>
            <a href="#" className="hover:text-amber-500 transition-colors">New Arrivals</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Seller Center</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Help</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NewNavbar;
