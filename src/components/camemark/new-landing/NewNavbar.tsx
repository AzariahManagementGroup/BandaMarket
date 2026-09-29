import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, ShoppingCart, User, Heart, Menu, ChevronDown, Globe, Shield, Headphones, Truck, CheckCircle } from "lucide-react";
import logo from "@/assets/camemark-logo.png";
import { getCartItems } from "@/utils/cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { COUNTRIES, CURRENCIES, LANGUAGES } from "@/utils/dropdownData";

const NewNavbar = () => {
  const { t, i18n } = useTranslation();
  const [cartCount, setCartCount] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState({ name: "United States", code: "US", flag: "🇺🇸" });
  const [currency, setCurrency] = useState("USD");
  const navigate = useNavigate();

  // Determine current language from cookie or default
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const googtrans = getCookie('googtrans');
  const currentLangCode = googtrans ? googtrans.split('/')[2] : (i18n.language || 'en');
  const currentLangDisplay = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

  const handleLanguageChange = (code: string) => {
    document.cookie = `googtrans=/en/${code}; path=/`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;
    localStorage.setItem('camemark_lang', code);
    i18n.changeLanguage(code);
    window.location.reload();
  };

  useEffect(() => {
    // Add Google Translate Script
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element"
        );
      };
    }
  }, []);

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
      {/* Top Bar with Animation */}
      <div className="bg-[#0b3624] text-white/90 text-xs py-2 hidden lg:block border-b border-white/10 overflow-hidden">
        <div className="container mx-auto px-4 flex justify-between items-center relative">
          
          {/* Animated Marquee Section */}
          <div className="flex-1 overflow-hidden relative">
            <div className="flex items-center gap-8 whitespace-nowrap animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused]">
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
              {/* Duplicate for seamless looping */}
              <div className="flex items-center gap-2" aria-hidden="true">
                <Truck className="h-4 w-4 text-amber-500" />
                <span>Free Delivery Across Africa</span>
              </div>
              <div className="flex items-center gap-2" aria-hidden="true">
                <Shield className="h-4 w-4 text-amber-500" />
                <span>Secure Payments</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-[#0b3624] pl-4 z-10 shadow-[-10px_0_10px_#0b3624]">
            {/* Country Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer hover:text-amber-500 transition-colors outline-none">
                <Globe className="h-3 w-3" />
                <span>Ship to</span>
                <span className="ml-1 text-base leading-none">{selectedCountry.flag}</span>
                <span className="ml-1 max-w-[100px] truncate">{selectedCountry.name}</span>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto bg-white text-black p-2 shadow-xl z-50 border">
                {COUNTRIES.map(c => (
                  <DropdownMenuItem key={c.code} onClick={() => setSelectedCountry(c)} className="cursor-pointer flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded">
                    <span className="text-base leading-none">{c.flag}</span>
                    <span>{c.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer hover:text-amber-500 transition-colors outline-none">
                <span className="max-w-[80px] truncate">{currentLangDisplay?.label || 'Language'}</span>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto bg-white text-black p-2 shadow-xl z-50 border">
                {LANGUAGES.map((l) => (
                  <DropdownMenuItem key={l.code} onClick={() => handleLanguageChange(l.code)} className="cursor-pointer text-sm hover:bg-gray-100 p-2 rounded">
                    {l.label} ({l.code.toUpperCase()})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer hover:text-amber-500 transition-colors outline-none">
                <span>{currency}</span>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto bg-white text-black p-2 shadow-xl z-50 border">
                {CURRENCIES.map((c) => (
                  <DropdownMenuItem key={c} onClick={() => setCurrency(c)} className="cursor-pointer text-sm hover:bg-gray-100 p-2 rounded">
                    {c}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white py-4 border-b">
        <div className="container mx-auto px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <img src={logo} alt="Banda Market" className="h-16 md:h-20 w-auto object-contain" />
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
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
      `}} />
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" className="hidden"></div>
    </header>
  );
};

export default NewNavbar;
