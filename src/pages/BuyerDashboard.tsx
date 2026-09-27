import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, ShoppingBag, ShoppingCart, List, MessageCircle, 
  Settings, Wallet, Heart, Map, Truck, 
  Search, Bell, Globe, ChevronDown, 
  Plus, ArrowUpRight, Clock, CheckCircle2,
  Package, MapPin, Store, ArrowRight,
  TrendingUp, CreditCard, ExternalLink,
  Menu, X, Loader2, Shield, ShieldCheck, GraduationCap, Radio, Layers, WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiUrl } from "@/config";
import { toast } from "sonner";
import logo from "@/assets/camemark-logo.png";
import ProductDetailModal from "@/components/camemark/ProductDetailModal";
import CartBasketDrawer from "@/components/camemark/CartBasketDrawer";
import ReferralModal from "@/components/camemark/ReferralModal";
import { addToCart, getCartItems } from "@/utils/cart";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [card, setCard] = useState<any>(null);
  const [bargains, setBargains] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletAction, setWalletAction] = useState<"add" | "send" | "pay" | "withdraw" | null>(null);

  // Product Detail Modal State
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Database Products & Bargains State
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [bargainDeals, setBargainDeals] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedRegion, setSelectedRegion] = useState<string>("All Regions");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  const [filterBargain, setFilterBargain] = useState<boolean>(false);
  const [filterVerified, setFilterVerified] = useState<boolean>(false);
  const [filterFarmFresh, setFilterFarmFresh] = useState<boolean>(false);

  // Cart Badge Count State
  const [cartCount, setCartCount] = useState<number>(0);
  const [savedItemIds, setSavedItemIds] = useState<number[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const token = localStorage.getItem("camemark_token");
    fetch(getApiUrl("/api/saved_items.php"), { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSavedItemIds(data.savedIds || []);
        }
      })
      .catch(e => console.error("Error fetching saved items", e));
  }, [session?.user?.id]);

  const toggleSaveProduct = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    const token = localStorage.getItem("camemark_token");
    if (!token) return toast.error("Please sign in first");
    
    const isSaved = savedItemIds.includes(productId);
    const method = isSaved ? 'DELETE' : 'POST';
    
    try {
      const res = await fetch(getApiUrl("/api/saved_items.php"), {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success) {
        if (isSaved) {
          setSavedItemIds(prev => prev.filter(id => id !== productId));
          toast.success("Removed from saved items");
        } else {
          setSavedItemIds(prev => [...prev, productId]);
          toast.success("Added to saved items");
        }
      }
    } catch(err) {
      toast.error("Error updating saved items");
    }
  };

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

  const fetchBargainDeals = async () => {
    try {
      const res = await fetch(getApiUrl("/api/bargains"));
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (Array.isArray(data.deals) && data.deals.length > 0) {
          setBargainDeals(data.deals);
          return;
        }
      }
    } catch (e) {
      console.error("Error fetching bargain deals:", e);
    }

    // If API fails, we just don't show bargains (no mockups)
    setBargainDeals([]);
  };

  useEffect(() => {
    fetchBargainDeals();
  }, []);

  const fetchDatabaseProducts = async () => {
    setLoadingProducts(true);
    try {
      const queryParams = [];
      if (selectedCategory && selectedCategory !== "All Categories" && selectedCategory !== "all-cat") {
        queryParams.push(`category=${encodeURIComponent(selectedCategory)}`);
      }
      if (selectedRegion && selectedRegion !== "All Regions" && selectedRegion !== "all-reg") {
        queryParams.push(`region=${encodeURIComponent(selectedRegion)}`);
      }
      if (searchQuery) {
        queryParams.push(`search=${encodeURIComponent(searchQuery)}`);
      }

      const queryString = queryParams.length > 0 ? "?" + queryParams.join("&") : "";
      const res = await fetch(getApiUrl("/api/products" + queryString));
      const contentType = res.headers.get("content-type");

      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (Array.isArray(data.products) && data.products.length > 0) {
          setDbProducts(data.products);
          setLoadingProducts(false);
          return;
        }
      }
    } catch (err) {
      console.error("Error fetching database products:", err);
    }

    // Fallback to local storage or defaults
    const local = localStorage.getItem("camemark_products");
    if (local) {
      try {
        setDbProducts(JSON.parse(local));
      } catch (e) {}
    } else {
      setDbProducts([]); // No mockups
    }
    setLoadingProducts(false);
  };

  useEffect(() => {
    fetchDatabaseProducts();
  }, [selectedCategory, selectedRegion, searchQuery]);

  useEffect(() => {
    document.title = "Dashboard | CameMark";
    const token = localStorage.getItem("camemark_token");
    const userStr = localStorage.getItem("camemark_user");

    if (!token && !userStr) {
      navigate("/signin");
    } else if (userStr) {
      const user = JSON.parse(userStr);
      setSession({ user });
      setProfile({
        ...user,
        full_name: user.fullName || user.full_name || user.email?.split('@')[0],
        signup_role: user.role || user.signup_role || 'buyer',
        avatar_url: user.avatarUrl || user.avatar_url
      });
      if (user.wallet) setWallet(user.wallet);
      setLoading(false);
    } else {
      setLoading(false);
    }

  }, [navigate]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const token = localStorage.getItem("camemark_token");
    if (!token || token === "null") return;

    // Polling for notifications every 15 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch(getApiUrl("/api/user-data?action=notifications"), {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            // Check for new notifications
            const currentNotifIds = new Set(notifications.map(n => n.id));
            const newNotifs = data.filter(n => !currentNotifIds.has(n.id));
            if (newNotifs.length > 0) {
              setNotifications(data);
              setUnreadCount(data.filter((n:any) => !n.is_read && !n.isRead).length);
              newNotifs.forEach((n:any) => {
                toast.info(n.title, { description: n.message });
              });
            }
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [session?.user?.id, notifications]);

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    const token = localStorage.getItem("camemark_token");
    
    try {
      let profileData = null, walletData = null, ordersData = [], productsData = [], bargainData = [], deliveryData = [], farmerData = [], notifData = [], count = 0, cardData = null;

      if (token && token !== "null") {
        // Fetch Profile from local session (since user endpoint might not exist yet)
        profileData = session?.user ? {
          ...session.user,
          full_name: session.user.fullName || session.user.email?.split('@')[0],
        } : null;

        const headers = { "Authorization": `Bearer ${token}` };
        const [wRes, oRes, prRes, nRes, cRes, fRes, dRes] = await Promise.all([
          fetch(getApiUrl("/api/user-data?action=wallets"), { headers }).catch(()=>null),
          fetch(getApiUrl("/api/user-data?action=orders"), { headers }).catch(()=>null),
          fetch(getApiUrl("/api/user-data?action=products"), { headers }).catch(()=>null),
          fetch(getApiUrl("/api/user-data?action=notifications"), { headers }).catch(()=>null),
          fetch(getApiUrl("/api/user-data?action=cards"), { headers }).catch(()=>null),
          fetch(getApiUrl("/api/user-data?action=farmers"), { headers }).catch(()=>null),
          fetch(getApiUrl("/api/user-data?action=deliveries"), { headers }).catch(()=>null),
        ]);

        if (wRes && wRes.ok) walletData = await wRes.json();
        if (oRes && oRes.ok) ordersData = await oRes.json();
        if (prRes && prRes.ok) {
            productsData = await prRes.json();
            bargainData = productsData.filter((p:any) => p.isBargain || p.is_bargain).slice(0, 4);
            productsData = productsData.slice(0,6);
        } else {
            productsData = dbProducts.slice(0, 6);
            bargainData = dbProducts.filter(p => p.isBargain).slice(0, 4);
        }
        if (nRes && nRes.ok) {
            notifData = await nRes.json();
            count = notifData.filter((n:any) => !n.isRead && !n.is_read).length;
        }
        if (cRes && cRes.ok) {
            const cards = await cRes.json();
            if (cards && cards.length > 0) cardData = cards[0];
        }
        if (fRes && fRes.ok) farmerData = (await fRes.json()).slice(0,3);
        if (dRes && dRes.ok) deliveryData = (await dRes.json()).slice(0,4);
      }

      setProfile(profileData);

      // Determine Currency by Country
      let detectedCurrency = "XAF";
      if (profileData?.country === "Nigeria") detectedCurrency = "NGN";
      else if (profileData?.country === "USA") detectedCurrency = "USD";
      else if (profileData?.country === "UK") detectedCurrency = "GBP";

      if (walletData) {
        walletData.currency = detectedCurrency;
        setWallet(walletData);
      } else {
        setWallet({ balance: 0, currency: detectedCurrency });
      }

      setOrders(ordersData);
      setRecommended(productsData);
      setBargains(bargainData);
      setDeliveries(deliveryData);
      setFarmers(farmerData);
      setNotifications(notifData);
      setUnreadCount(count);
      setCard(cardData);

    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;

    const publicUrl = URL.createObjectURL(file);
    toast.success("Avatar upload simulated");
    setProfile({ ...profile, avatar_url: publicUrl });
    toast.success("Profile picture updated!");
    setLoading(false);
  };

  const handleWalletAction = (action: "add" | "send" | "pay" | "withdraw") => {
    setWalletAction(action);
    setIsWalletModalOpen(true);
  };

  const handleIDUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `ids/${session.user.id}-${Math.random()}.${fileExt}`;

    const publicUrl = URL.createObjectURL(file);
    toast.success("ID Card upload simulated");
    setProfile({ ...profile, id_card_url: publicUrl });
    toast.success("ID image uploaded successfully!");
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const updates = Object.fromEntries(formData.entries());
    
    toast.success("Profile updated (simulated)");
    fetchDashboardData(session.user.id);
    setLoading(false);
  };

  const handleProcessTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    
    toast.info(`Processing ${walletAction} via Sandbox Gateway...`);
    
    setTimeout(async () => {
      const formData = new FormData(form);
      const amount = parseFloat(formData.get("amount") as string);
      
      if (walletAction === "add") {
        const error = null;
        if (!error) {
        }
      }
      
      toast.success("Transaction successful!");
      setIsWalletModalOpen(false);
      fetchDashboardData(session.user.id);
      setLoading(false);
    }, 2000);
  };

  const handleCreateCard = async (type: 'virtual' | 'physical') => {
    setLoading(true);
    const fee = type === 'virtual' ? 2500 : 5000;
    
    if ((wallet?.balance || 0) < fee) {
      toast.error(`Insufficient balance. Fee: ${wallet?.currency} ${fee}`);
      setLoading(false);
      return;
    }

    // Process fee

    const cardNumber = "5592 " + Math.floor(Math.random() * 8999 + 1000) + " " + Math.floor(Math.random() * 8999 + 1000) + " " + Math.floor(Math.random() * 8999 + 1000);
    const expiry = "12/28";
    const cvv = Math.floor(Math.random() * 899 + 100).toString();

    const error = null;

    if (error) toast.error(error.message);
    else {
      toast.success(`${type.toUpperCase()} Card generated successfully!`);
      fetchDashboardData(session.user.id);
    }
    setLoading(false);
  };

  const [activeNavTab, setActiveNavTab] = useState<string>("dashboard");

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { id: "marketplace", icon: ShoppingBag, label: "Marketplace", href: "/market-zone" },
    { id: "orders", icon: Package, label: "Orders", href: "/dashboard?tab=orders" },
    { id: "bargains", icon: MessageCircle, label: "Bargains", href: "/market-zone?tab=bargains" },
    { id: "wallet", icon: Wallet, label: "Wallet", href: "/cards-wallet" },
    { id: "saved", icon: Heart, label: "Saved Items", href: "/market-zone?tab=saved" },
    { id: "messages", icon: MessageCircle, label: "Messages", badge: unreadCount, href: "/dashboard?tab=messages" },
    { id: "offline", icon: WifiOff, label: "COCF Offline 📶", href: "/offline-commerce", cocf: true },
    { id: "academy", icon: GraduationCap, label: "Academy 🎓", href: "/academy", academy: true },
    ...(profile?.role === "admin" || 
        profile?.role === "super_admin" || 
        profile?.signup_role === "admin" ||
        session?.user?.email === "info@azariahmg.com" ? [
      { id: "admin", icon: Shield, label: "Admin Panel", href: "/admin", special: true }
    ] : []),
    { id: "settings", icon: Settings, label: "Settings", href: "/dashboard?tab=settings" },
  ];

  if (loading && !session) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  const filteredDbProducts = dbProducts.filter((prod) => {
    if (filterBargain && !prod.isBargain) return false;
    if (filterFarmFresh && prod.tag !== "Farm Fresh") return false;
    if (filterVerified && prod.seller !== "Verified Merchant") return false; // Heuristic based on current seed data
    return true;
  });

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-10">
          <img src={logo} alt="CameMark" className="h-10 w-auto animate-float" />
        </div>

        <nav className="space-y-1">
          {navItems.map((item, i) => {
            const isActive = activeNavTab === item.id || (item.id === "dashboard" && window.location.pathname === "/dashboard" && !window.location.search);
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.id === "cart") {
                    setIsCartDrawerOpen(true);
                    return;
                  }
                  setActiveNavTab(item.id);
                  if (item.id !== "marketplace" && item.id !== "dashboard" && item.href !== "#" && !item.href.startsWith("/dashboard")) {
                    navigate(item.href);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group hover:scale-[1.02] transform ${
                  isActive 
                    ? "bg-[#064E3B] text-white shadow-xl shadow-emerald-950/20 font-black ring-2 ring-emerald-600/30" 
                    : item.cocf
                      ? "bg-[#064E3B]/90 text-amber-300 hover:bg-[#064E3B] font-extrabold border border-amber-400/40 shadow-sm"
                      : item.academy
                        ? "bg-amber-500/10 text-amber-900 hover:bg-amber-500/20 font-extrabold border border-amber-300/50"
                        : item.highlight
                          ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-extrabold border border-emerald-200"
                          : item.special
                            ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/70 font-extrabold"
                            : "text-gray-600 hover:bg-emerald-50/80 hover:text-emerald-900 font-medium"
                } animate-fade-in-right`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "text-white animate-pulse" : item.cocf ? "text-amber-300" : "group-hover:text-emerald-700"
                  }`} />
                  <span className="text-xs sm:text-sm">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-10">
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 relative overflow-hidden group animate-scale-in">
            <div className="absolute -top-4 -right-4 h-20 w-20 bg-emerald-100 rounded-full blur-2xl group-hover:bg-emerald-200 transition-colors" />
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-emerald-900">Refer & Earn</h4>
              <p className="text-[10px] text-emerald-700 mt-1 mb-4">Invite friends and earn CaMark points on every purchase.</p>
              <Button 
                size="sm" 
                onClick={() => setIsReferralModalOpen(true)}
                className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white text-[11px] rounded-lg cursor-pointer"
              >
                Invite Now <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs animate-fade-in" 
          />

          {/* Drawer container */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto custom-scrollbar animate-slide-in-left z-10">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <img src={logo} alt="CameMark" className="h-8 w-auto" />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {navItems.map((item) => {
                const isActive = activeNavTab === item.id || (item.id === "dashboard" && window.location.pathname === "/dashboard" && !window.location.search);
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.id === "cart") {
                        setIsCartDrawerOpen(true);
                        setIsMobileMenuOpen(false);
                        return;
                      }
                      setActiveNavTab(item.id);
                      setIsMobileMenuOpen(false);
                      if (item.id !== "marketplace" && item.id !== "dashboard" && item.href !== "#" && !item.href.startsWith("/dashboard")) {
                        navigate(item.href);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-left ${
                      isActive 
                        ? "bg-[#064E3B] text-white font-extrabold shadow-md" 
                        : item.cocf
                          ? "bg-amber-50 text-amber-900 font-extrabold border border-amber-200"
                          : item.academy
                            ? "bg-amber-500/10 text-amber-900 font-extrabold border border-amber-300/50"
                            : item.highlight
                              ? "bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200"
                              : "text-gray-600 hover:bg-emerald-50/80 hover:text-emerald-900 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-emerald-700"}`} />
                      <span className="text-xs sm:text-sm">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-gray-100 mt-4 shrink-0">
              <Button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/seller-dashboard");
                }} 
                className="w-full bg-emerald-800 text-white font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2"
              >
                <Store className="h-4 w-4" /> Switch to Seller View
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 lg:px-10 shrink-0 gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 max-w-xl">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 transition-colors border border-gray-200 shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative group w-full min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, farmers, orders, regions..." 
                className="pl-10 sm:pl-12 w-full bg-gray-50 border-transparent rounded-xl h-10 sm:h-11 focus-visible:ring-emerald-500 focus-visible:bg-white transition-all text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-2 shrink-0">
            {/* Cart Basket Header Icon Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2 text-gray-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl border border-gray-200 transition-colors shrink-0 cursor-pointer"
              title="Open Cart Basket"
            >
              <ShoppingCart className="h-5 sm:h-6 w-5 sm:w-6 text-emerald-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="relative p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                <Bell className="h-5 sm:h-6 w-5 sm:w-6" />
                {unreadCount > 0 && <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 border-2 border-white rounded-full" />}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white p-2">
                <h4 className="text-sm font-bold p-2 border-b">Notifications</h4>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map((n: any) => (
                    <div key={n.id} className={`p-3 text-xs border-b last:border-0 ${n.is_read ? 'opacity-50' : 'bg-emerald-50'}`}>
                      <p className="font-bold">{n.title}</p>
                      <p className="text-gray-500">{n.message}</p>
                    </div>
                  )) : (
                    <p className="text-center p-4 text-xs text-gray-400">No notifications</p>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-bold text-gray-700 uppercase">EN</span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-100 focus:outline-none shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{profile?.full_name || "Account"}</p>
                  <p className={`text-[10px] font-bold flex items-center justify-end gap-1 ${profile?.is_verified ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {profile?.is_verified ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    <span className="capitalize">{profile?.signup_role?.replace('_', ' ') || 'User'}</span> • {profile?.is_verified ? "Verified" : "Pending"}
                  </p>
                </div>
                <div className="h-9 sm:h-10 w-9 sm:w-10 rounded-xl bg-emerald-100 overflow-hidden border-2 border-white shadow-sm shrink-0 flex items-center justify-center">
                  <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || "Felix"}`} alt="User avatar" className="h-full w-full object-cover" />
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuItem onClick={() => navigate("/seller-dashboard")} className="flex items-center gap-2 cursor-pointer font-bold text-emerald-700">
                  <Store className="h-4 w-4" /> Switch to Seller View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" /> Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/cards-wallet")} className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" /> Cards & Wallet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  localStorage.removeItem("camemark_token");
                  localStorage.removeItem("camemark_user");
                  localStorage.removeItem("camemark_token"); localStorage.removeItem("camemark_user"); navigate("/signin");
                }} className="flex items-center gap-2 cursor-pointer text-red-600">
                  <X className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 custom-scrollbar">
          {activeNavTab === "marketplace" ? (
            <div className="space-y-6 animate-fade-in">
              {/* Marketplace Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Marketplace</h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Discover products, services, and regional goods across Malawi.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate("/checkout")}
                    className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4 text-emerald-700" /> Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                  </button>
                </div>
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {[
                  { name: "All Categories", icon: "🌐" },
                  { name: "Agriculture", icon: "🌾" },
                  { name: "Food & Beverages", icon: "🥖" },
                  { name: "Fashion", icon: "👗" },
                  { name: "Beauty", icon: "💄" },
                  { name: "Electronics", icon: "📱" },
                  { name: "Home", icon: "🏠" },
                  { name: "Construction", icon: "🏗️" },
                  { name: "Services", icon: "🔧" },
                  { name: "Handmade", icon: "🏺" },
                  { name: "Wholesale", icon: "📦" }
                ].map((cat, idx) => {
                  const isActive = selectedCategory === cat.name;
                  return (
                    <button 
                      key={idx}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
                        isActive ? "bg-[#064E3B] text-white shadow-md" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Filters & Sorting Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm text-xs font-bold">
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val)}>
                    <SelectTrigger className="h-9 w-44 bg-gray-50 border-gray-200 text-xs">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Categories">All Categories</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Handmade">Handmade</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedRegion} onValueChange={(val) => setSelectedRegion(val)}>
                    <SelectTrigger className="h-9 w-44 bg-gray-50 border-gray-200 text-xs">
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Regions">All Regions</SelectItem>
                      <SelectItem value="Littoral">Littoral (Douala)</SelectItem>
                      <SelectItem value="Centre">Centre (Yaoundé)</SelectItem>
                      <SelectItem value="South West">South West (Buea)</SelectItem>
                      <SelectItem value="North West">North West (Bamenda)</SelectItem>
                      <SelectItem value="Ouest">Ouest (Bafoussam)</SelectItem>
                    </SelectContent>
                  </Select>

                  <span 
                    onClick={() => setFilterBargain(!filterBargain)}
                    className={`px-3 py-1.5 border rounded-xl cursor-pointer transition-colors ${filterBargain ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                    Bargain Available
                  </span>
                  <span 
                    onClick={() => setFilterVerified(!filterVerified)}
                    className={`px-3 py-1.5 border rounded-xl cursor-pointer transition-colors ${filterVerified ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                    ✓ Verified Sellers
                  </span>
                  <span 
                    onClick={() => setFilterFarmFresh(!filterFarmFresh)}
                    className={`px-3 py-1.5 border rounded-xl cursor-pointer transition-colors ${filterFarmFresh ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                    Farm Fresh
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setSelectedCategory("All Categories");
                      setSelectedRegion("All Regions");
                      setSearchQuery("");
                    }} 
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Clear Filters
                  </button>
                  <Button 
                    onClick={() => fetchDatabaseProducts()}
                    size="sm" 
                    className="bg-[#064E3B] hover:bg-emerald-950 text-white font-extrabold text-xs h-9 px-4 rounded-xl"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>

              {/* 3-Column Main Marketplace Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                
                {/* Left 3 Columns: Product Grid */}
                <div className="xl:col-span-3 space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
                    <span>Showing {filteredDbProducts.length} products</span>
                    <div className="flex items-center gap-2">
                      <span>Sort By:</span>
                      <span className="text-gray-900 font-black">Recommended</span>
                    </div>
                  </div>

                  {loadingProducts ? (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                      <p className="text-xs font-bold">Loading products...</p>
                    </div>
                  ) : filteredDbProducts.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-500 space-y-2">
                      <Package className="h-10 w-10 text-gray-300 mx-auto" />
                      <p className="font-bold text-sm">No products found matching filters.</p>
                      <p className="text-xs text-gray-400">Try clearing your search or selecting another region/category.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {filteredDbProducts.map((prod) => (
                        <div 
                          key={prod.id} 
                          onClick={() => {
                            setSelectedProductForDetail(prod);
                            setIsDetailModalOpen(true);
                          }}
                          className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer"
                        >
                          <div className="h-44 bg-gray-100 relative overflow-hidden">
                            <img src={prod.img || prod.imageUrl} alt={prod.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm ${
                              prod.tag === "Bargain" ? "bg-amber-400 text-amber-950" : "bg-emerald-600 text-white"
                            }`}>
                              {prod.tag || "Verified"}
                            </span>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <h4 className="font-extrabold text-gray-900 text-sm line-clamp-1">{prod.title}</h4>
                              <p className="text-[11px] text-gray-400 mt-0.5">{prod.seller || prod.sellerName} • <span className="text-emerald-700 font-bold">{prod.region}</span></p>
                              <span className="text-[10px] text-amber-500 font-bold mt-1 block">★ {prod.rating || "4.8 (120)"}</span>
                            </div>
                            <div>
                              <span className="text-base font-black text-gray-900 block">FCFA {Number(prod.price).toLocaleString()}</span>
                              <div className="flex items-center gap-2 mt-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(prod);
                                  }}
                                  className="h-9 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center shrink-0 transition-colors"
                                  title="Add to Cart"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => toggleSaveProduct(e, prod.id)}
                                  className={`h-9 px-3 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                                    savedItemIds.includes(prod.id) 
                                      ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100" 
                                      : "border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-red-500"
                                  }`}
                                  title={savedItemIds.includes(prod.id) ? "Unsave" : "Save"}
                                >
                                  <Heart className="h-4 w-4" fill={savedItemIds.includes(prod.id) ? "currentColor" : "none"} />
                                </button>
                                <Button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProductForDetail(prod);
                                    setIsDetailModalOpen(true);
                                  }}
                                  className={`w-full font-extrabold text-xs h-9 rounded-xl ${
                                    prod.isBargain ? "bg-amber-400 hover:bg-amber-500 text-amber-950" : "bg-[#064E3B] hover:bg-emerald-950 text-white"
                                  }`}
                                >
                                  {prod.isBargain ? "Start Bargain" : "View Product"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Guarantees Bar at Bottom */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-6 border-t border-gray-200 text-center text-xs">
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 space-y-1">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 mx-auto" />
                      <p className="font-extrabold text-[11px]">Secure Payments</p>
                      <p className="text-[9px] text-gray-400">Encrypted security</p>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 space-y-1">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto" />
                      <p className="font-extrabold text-[11px]">Verified Sellers</p>
                      <p className="text-[9px] text-gray-400">Verified merchants</p>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 space-y-1">
                      <Truck className="h-5 w-5 text-emerald-600 mx-auto" />
                      <p className="font-extrabold text-[11px]">Fast Delivery</p>
                      <p className="text-[9px] text-gray-400">Across Malawi</p>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 space-y-1">
                      <MessageCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                      <p className="font-extrabold text-[11px]">Bargain & Negotiate</p>
                      <p className="text-[9px] text-gray-400">Get best deals</p>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 space-y-1">
                      <Package className="h-5 w-5 text-emerald-600 mx-auto" />
                      <p className="font-extrabold text-[11px]">Farm Fresh</p>
                      <p className="text-[9px] text-gray-400">Fresh from farms</p>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 space-y-1">
                      <Globe className="h-5 w-5 text-emerald-600 mx-auto" />
                      <p className="font-extrabold text-[11px]">AfCFTA Ready</p>
                      <p className="text-[9px] text-gray-400">Trade across Africa</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Side Widgets */}
                <div className="space-y-6">
                  
                  {/* Widget 1: Today's Bargain Deals */}
                  <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                        🔥 Today's Bargain Deals
                      </h4>
                      <span onClick={() => navigate('/market-zone')} className="text-[10px] text-emerald-700 font-bold cursor-pointer hover:underline">View all</span>
                    </div>

                    <div className="space-y-3">
                      {bargainDeals.length > 0 ? (
                        bargainDeals.map((b, i) => (
                          <div key={b.id || i} className="flex items-center justify-between p-2 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                            <div className="flex items-center gap-2.5">
                              <img src={b.img} alt={b.title} className="h-10 w-10 rounded-xl object-cover" />
                              <div>
                                <p className="font-extrabold text-gray-900 text-[11px] line-clamp-1">{b.title}</p>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-emerald-700 text-xs">{b.formattedPrice || b.price}</span>
                                  { (b.formattedOldPrice || b.old) && (
                                    <span className="text-[9px] text-gray-400 line-through">{b.formattedOldPrice || b.old}</span>
                                  )}
                                  { b.off && (
                                    <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1 rounded">{b.off}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-1 rounded-lg">Bargain</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-4">No bargains available right now.</p>
                      )}
                    </div>
                  </div>

                  {/* Widget 2: Top Rated Sellers */}
                  <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-gray-900">Top Rated Sellers</h4>
                      <span onClick={() => navigate('/market-zone')} className="text-[10px] text-emerald-700 font-bold cursor-pointer hover:underline">View all</span>
                    </div>

                    <div className="space-y-3">
                      {Array.from(new Set(dbProducts.filter(p => p.seller).map(p => p.seller)))
                        .slice(0, 4)
                        .map((sellerName, idx) => {
                          const p = dbProducts.find(p => p.seller === sellerName);
                          return {
                            rank: idx + 1,
                            name: sellerName,
                            location: p?.region || "Malawi",
                            rating: p?.rating || "4.5"
                          };
                        }).map((s) => (
                        <div key={s.rank} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center justify-center">{s.rank}</span>
                            <div>
                              <p className="font-extrabold text-gray-900 text-[11px]">{s.name}</p>
                              <p className="text-[9px] text-gray-400">{s.location} • ★ {s.rating}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold rounded-lg px-2.5">
                            Follow
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Widget 3: Malawi 10 Economic Blocs Map */}
                  <div className="bg-[#064E3B] text-white rounded-3xl p-5 space-y-3 shadow-lg relative overflow-hidden">
                    <h4 className="font-black text-sm text-amber-400">Explore Malawi's 10 Economic Blocs</h4>
                    <p className="text-[11px] text-emerald-100 leading-snug">Trade directly with verified cooperatives across Far North, Littoral, Centre, and South West.</p>
                    <Button 
                      onClick={() => navigate("/market-zone")}
                      className="w-full bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black text-xs h-9 rounded-xl mt-2"
                    >
                      Explore Region →
                    </Button>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Welcome Section */}
              <div className="animate-fade-in space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
                  <span>Welcome back,</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 animate-pulse underline decoration-emerald-400/40">
                    {profile?.full_name?.split(" ")[0] || "taiwo"}
                  </span>
                  <span className="inline-block animate-bounce origin-bottom-right">👋</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Find quality products, support local farmers, and enjoy secure shopping across Malawi.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Wallet Balance" 
                  value={`${wallet?.currency || "FCFA"} ${wallet?.balance?.toLocaleString() || "0"}`} 
                  subValue={`Preferred: ${profile?.preferred_currency || "XAF"}`} 
                  icon={Wallet} 
                  action="Add Money"
                  onClickAction={() => handleWalletAction("add")}
                  delay={0.1}
                />
                <StatCard 
                  title="Active Orders" 
                  value={orders.length.toString()} 
                  subValue="0 items in delivery" 
                  icon={Package} 
                  action="View Orders"
                  onClickAction={() => navigate("/dashboard?tab=orders")}
                  delay={0.2}
                />
                <StatCard 
                  title="Saved Items" 
                  value={savedItemIds.length.toString()} 
                  subValue="Products in wishlist" 
                  icon={Heart} 
                  action="View Saved"
                  onClickAction={() => navigate("/market-zone?tab=saved")}
                  delay={0.3}
                />
                <StatCard 
                  title="Bargain Deals" 
                  value={bargains.length.toString()} 
                  subValue="Active negotiations" 
                  icon={MessageCircle} 
                  action="Explore Deals"
                  onClickAction={() => navigate("/market-zone?tab=bargains")}
                  delay={0.4}
                />
              </div>
            </>
          )}
        </main>

      {/* Card Creation Modal */}
      <Dialog open={!card && isWalletModalOpen && walletAction === "add"} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-center">Get Your CaMark Card</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-6">
            <div className="border border-gray-100 rounded-2xl p-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group" onClick={() => handleCreateCard('virtual')}>
               <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                 <CreditCard className="h-5 w-5" />
               </div>
               <h4 className="text-sm font-bold">Virtual Card</h4>
               <p className="text-[10px] text-gray-400 mt-1">Instant generation. Great for online shopping.</p>
               <p className="text-xs font-extrabold text-emerald-600 mt-3">Fee: {wallet?.currency} 2,500</p>
            </div>
            <div className="border border-gray-100 rounded-2xl p-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group" onClick={() => handleCreateCard('physical')}>
               <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                 <Truck className="h-5 w-5" />
               </div>
               <h4 className="text-sm font-bold">Physical Card</h4>
               <p className="text-[10px] text-gray-400 mt-1">Delivered to your door. Use at ATMs.</p>
               <p className="text-xs font-extrabold text-emerald-600 mt-3">Fee: {wallet?.currency} 5,000</p>
            </div>
          </div>
          <p className="text-[10px] text-center text-gray-400 italic">Fees will be deducted from your CamRency Wallet.</p>
        </DialogContent>
      </Dialog>
    </div>

      {/* Profile Settings Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Advanced KYC & Profile</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Submit your details to become a verified buyer.</DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-4 py-4 border-b border-gray-50 mb-4">
            <div className="relative group">
              <div className="h-20 w-20 rounded-2xl bg-emerald-100 overflow-hidden border-2 border-white shadow-md">
                <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`} alt="Avatar" className="h-full w-full object-cover" />
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-2xl transition-opacity">
                <Plus className="h-6 w-6" />
                <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
              </label>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{profile?.full_name}</h4>
              <p className="text-xs text-gray-500 capitalize">{profile?.signup_role} Account</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* ... form fields ... */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</Label>
                <Input name="full_name" defaultValue={profile?.full_name} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Gender</Label>
                <Select name="gender" defaultValue={profile?.gender}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nationality</Label>
                <Input name="nationality" defaultValue={profile?.nationality} placeholder="e.g. Nigerian" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Occupation</Label>
                <Input name="occupation" defaultValue={profile?.occupation} placeholder="e.g. Software Engineer" className="h-10 rounded-xl" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Residential Address</Label>
              <Input name="address" defaultValue={profile?.address} placeholder="Street, City, State" className="h-10 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ID Type</Label>
                <Select name="id_type" defaultValue={profile?.id_type}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select ID Type" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="national_id">National ID Card</SelectItem>
                    <SelectItem value="passport">International Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                    <SelectItem value="voters_card">Voter's Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ID Number</Label>
                <Input name="tax_id" defaultValue={profile?.tax_id} className="h-10 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Issuing Country</Label>
                <Input name="issuing_country" defaultValue={profile?.issuing_country} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ID Expiry Date</Label>
                <Input name="id_expiry" type="date" defaultValue={profile?.id_expiry} className="h-10 rounded-xl" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tax ID / SSN (Optional)</Label>
              <Input name="tax_id" defaultValue={profile?.tax_id} className="h-10 rounded-xl" />
            </div>

            <div className="space-y-3">
               <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Identity Document Image</Label>
               <div className="border-2 border-dashed border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-gray-50/50">
                  {profile?.id_card_url ? (
                    <div className="relative">
                      <img src={profile.id_card_url} className="h-20 w-32 object-cover rounded-lg border" alt="ID Card" />
                      <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1"><CheckCircle2 className="h-3 w-3" /></div>
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center"><CreditCard className="h-5 w-5 text-emerald-600" /></div>
                  )}
                  <p className="text-[10px] text-gray-500 font-medium">Upload a clear photo of your selected ID</p>
                  <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg relative overflow-hidden">
                     {profile?.id_card_url ? "Replace Image" : "Choose Image"}
                     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleIDUpload} accept="image/*" />
                  </Button>
               </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
              <Button type="button" variant="ghost" onClick={() => setIsProfileModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-10" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Submit KYC"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Wallet Action Modal */}
      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center capitalize">{walletAction} Funds</DialogTitle>
            <DialogDescription className="text-center text-xs text-gray-500">Enter the amount and authorize the transaction via our secure gateway.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProcessTransaction} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Amount ({wallet?.currency})</Label>
              <Input name="amount" type="number" placeholder="0.00" className="text-2xl font-extrabold h-16 text-center rounded-2xl bg-gray-50 border-transparent" required />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Select Payment Gateway</Label>
              <div className="grid grid-cols-3 gap-2">
                {['Paystack', 'Flutterwave', 'PayPal', 'Mobile Money', 'Stripe', 'CaMark Pay'].map(gw => (
                  <button key={gw} type="button" className="p-2 border rounded-xl text-[9px] font-bold hover:border-emerald-500 hover:bg-emerald-50 transition-all">{gw}</button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white rounded-xl h-12 font-bold shadow-lg shadow-emerald-900/20" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Process ${walletAction}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Card Creation Overlay (if no card) */}
      {!card && (
        <Dialog open={false} onOpenChange={() => {}}>
           {/* Placeholder for future if needed */}
        </Dialog>
      )}
      {/* Mobile Menu Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 bg-white border-r-0 w-72 flex flex-col">
          <SheetHeader className="p-6 bg-[#064E3B] text-white text-left">
            <div className="flex items-center gap-2 mb-2">
              <img src={logo} alt="CameMark" className="h-8 w-auto brightness-0 invert" />
            </div>
            <SheetTitle className="text-white text-lg font-black">CameMark Dashboard</SheetTitle>
            <SheetDescription className="text-emerald-100 text-[10px]">
              {profile?.full_name || "Buyer"} • {profile?.signup_role?.replace('_', ' ') || "User"}
            </SheetDescription>
          </SheetHeader>
          
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.href !== "#") navigate(item.href);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                  item.active 
                    ? "bg-emerald-50 text-emerald-900 font-bold" 
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
            
            <div className="pt-6 mt-6 border-t border-gray-100">
              <button 
                onClick={() => {
                  localStorage.removeItem("camemark_token"); localStorage.removeItem("camemark_user"); navigate("/");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
                <span className="text-sm font-bold">Sign Out</span>
              </button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Interactive Product & Bargain Details Modal */}
      <ProductDetailModal 
        product={selectedProductForDetail} 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
      />

      {/* Interactive Cart Basket Drawer */}
      <CartBasketDrawer 
        isOpen={isCartDrawerOpen} 
        onClose={() => setIsCartDrawerOpen(false)} 
      />

      {/* Interactive Refer & Earn Program Modal */}
      <ReferralModal 
        isOpen={isReferralModalOpen} 
        onClose={() => setIsReferralModalOpen(false)} 
        user={profile || session?.user} 
      />
    </div>
  );
};

// Sub-components
const StatCard = ({ title, value, subValue, icon: Icon, action, iconColor = "text-white bg-emerald-600", isTrend = false, delay = 0, onClickAction }) => (
  <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden hover-lift group animate-scale-in" style={{ animationDelay: `${delay}s` }}>
    <CardContent className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
          <h4 className="text-xl font-extrabold text-gray-900 mt-1">{value}</h4>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <p className={`text-[10px] font-bold ${isTrend ? 'text-emerald-600' : 'text-gray-400'}`}>{subValue}</p>
        {action && (
          <button onClick={onClickAction} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 hover:underline">
            {action} <Plus className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    </CardContent>
  </Card>
);

const ProductCard = ({ title, price, rating, delay = 0 }) => (
  <div className="min-w-[180px] w-[200px] bg-white rounded-3xl border border-gray-100 p-3 shadow-sm hover-lift group animate-scale-in" style={{ animationDelay: `${delay}s` }}>
    <div className="h-28 bg-emerald-50 rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden">
       <Package className="h-10 w-10 text-emerald-200" />
       <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/5 transition-colors" />
    </div>
    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{title}</h4>
    <div className="flex items-center justify-between mt-2">
      <p className="text-xs font-extrabold text-emerald-600">FCFA {price}</p>
      <p className="text-[10px] font-bold text-gray-400 flex items-center gap-0.5">⭐ {rating}</p>
    </div>
  </div>
);

const WalletAction = ({ icon: Icon, label, onClick }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-1.5 group cursor-pointer">
    <div className="h-10 w-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-emerald-600 group-hover:text-white transition-all">
      <Icon className="h-4 w-4" />
    </div>
    <span className="text-[9px] font-bold text-gray-500 group-hover:text-emerald-700">{label}</span>
  </div>
);

const SellerRow = ({ name, region, rating }) => (
  <div className="flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center overflow-hidden">
         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-900">{name}</p>
        <p className="text-[9px] text-gray-400">{region}</p>
      </div>
    </div>
    <span className="text-[10px] font-bold text-emerald-600">⭐ {rating}</span>
  </div>
);

const BargainItem = ({ title, discount, price, oldPrice }) => (
  <div className="flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center overflow-hidden">
        <Package className="h-5 w-5 text-emerald-200" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-900 line-clamp-1">{title} <span className="text-red-500 ml-1">{discount}</span></p>
        <p className="text-[10px] text-gray-400 line-through">FCFA {oldPrice}</p>
        <p className="text-[10px] font-bold text-emerald-600">FCFA {price}</p>
      </div>
    </div>
    <button className="text-[10px] font-bold text-emerald-600 border border-emerald-100 rounded-lg px-2 py-1 hover:bg-emerald-600 hover:text-white transition-colors">Bargain</button>
  </div>
);

const DeliveryStatus = ({ status, id, label, time, active = false, done = false }) => (
  <div className="flex items-start gap-3 relative z-10">
    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${done ? 'bg-emerald-600 text-white' : active ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
       {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : active ? <Clock className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <p className={`text-[10px] font-extrabold ${active ? 'text-emerald-600' : 'text-gray-900'}`}>{status}</p>
        <p className="text-[9px] text-gray-400">{time}</p>
      </div>
      <p className="text-[9px] text-gray-400 mt-0.5">Order {id}</p>
      <p className="text-[10px] font-bold text-gray-600">{label}</p>
    </div>
  </div>
);

const OrderItem = ({ id, date, status, statusColor }) => (
  <div className="flex items-center justify-between text-[10px]">
    <div>
      <p className="font-bold text-gray-900">Order {id}</p>
      <p className="text-gray-400">{date}</p>
    </div>
    <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-[8px] ${statusColor}`}>{status}</span>
  </div>
);

const QuickAction = ({ icon: Icon, label }) => (
  <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all hover-lift group">
    <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:text-emerald-600 transition-colors shadow-sm">
      <Icon className="h-5 w-5" />
    </div>
    <span className="text-[10px] font-bold text-gray-600 group-hover:text-emerald-900">{label}</span>
  </button>
);

export default BuyerDashboard;

