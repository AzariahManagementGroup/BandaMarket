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

const LANGS = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "XAF", "NGN", "ZAR", "KES"];

const NewNavbar = () => {
  const { t, i18n } = useTranslation();
  const [cartCount, setCartCount] = useState(0);
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState({ name: "United States", code: "US", flag: "https://flagcdn.com/w20/us.png" });
  const [currency, setCurrency] = useState("USD");
  const [countrySearch, setCountrySearch] = useState("");
  const [allLanguages, setAllLanguages] = useState<{code: string, label: string}[]>(LANGS);
  const [allCurrencies, setAllCurrencies] = useState<string[]>(CURRENCIES);
  const [langSearch, setLangSearch] = useState("");
  const [currencySearch, setCurrencySearch] = useState("");
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

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags,currencies,languages")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((c: any) => ({
          name: c.name.common,
          code: c.cca2,
          flag: c.flags.png
        })).sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountries(formatted);

        // Extract unique currencies
        const currenciesMap = new Set<string>();
        data.forEach((c: any) => {
          if (c.currencies) {
            Object.keys(c.currencies).forEach(cur => currenciesMap.add(cur));
          }
        });
        const extractedCurrencies = Array.from(currenciesMap).sort();
        if (extractedCurrencies.length > 0) {
          setAllCurrencies(extractedCurrencies);
        }

        // Extract unique languages
        const languagesMap = new Map<string, string>();
        data.forEach((c: any) => {
          if (c.languages) {
            Object.entries(c.languages).forEach(([code, name]) => {
              if (!languagesMap.has(code)) {
                languagesMap.set(code, name as string);
              }
            });
          }
        });
        const extractedLanguages = Array.from(languagesMap.entries()).map(([code, label]) => ({
          code,
          label
        })).sort((a, b) => a.label.localeCompare(b.label));
        
        if (extractedLanguages.length > 0) {
          setAllLanguages(extractedLanguages);
        }
      })
      .catch(err => console.error("Error fetching countries", err));
  }, []);

  // Filtered lists for search
  const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
  const filteredLanguages = allLanguages.filter(l => l.label.toLowerCase().includes(langSearch.toLowerCase()) || l.code.toLowerCase().includes(langSearch.toLowerCase()));
  const filteredCurrencies = allCurrencies.filter(c => c.toLowerCase().includes(currencySearch.toLowerCase()));

  // Current selected language display
  const currentLangDisplay = allLanguages.find(l => l.code === i18n.language) || allLanguages.find(l => l.code === 'eng') || allLanguages[0];

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
                <img src={selectedCountry.flag} alt={selectedCountry.code} className="h-3 ml-1" />
                <span className="ml-1 max-w-[100px] truncate">{selectedCountry.name}</span>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto bg-white text-black p-2 shadow-xl z-50 border">
                {countries.map(c => (
                  <DropdownMenuItem key={c.code} onClick={() => setSelectedCountry(c)} className="cursor-pointer flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded">
                    <img src={c.flag} alt={c.code} className="h-3 w-4 object-cover" />
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
                {allLanguages.map((l) => (
                  <DropdownMenuItem key={l.code} onClick={() => {
                    localStorage.setItem('camemark_lang', l.code);
                    i18n.changeLanguage(l.code);
                  }} className="cursor-pointer text-sm hover:bg-gray-100 p-2 rounded">
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
                {allCurrencies.map((c) => (
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
      `}} />
    </header>
  );
};

export default NewNavbar;
