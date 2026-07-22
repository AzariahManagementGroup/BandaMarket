import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, ShoppingBag, List, MessageCircle, 
  Settings, Wallet, Heart, Map, Truck, 
  Search, Bell, Globe, ChevronDown, 
  Plus, ArrowUpRight, Clock, CheckCircle2,
  Package, MapPin, Store, ArrowRight,
  TrendingUp, CreditCard, ExternalLink,
  Menu, X, Loader2, Shield, GraduationCap, Radio, Layers, WifiOff
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/camemark-logo.png";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    document.title = "Dashboard | CameMark";
    const token = localStorage.getItem("camemark_token");
    const userStr = localStorage.getItem("camemark_user");

    if (!token && !userStr) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          navigate("/signin");
        } else {
          setSession(session);
          setLoading(false);
          fetchDashboardData(session.user.id);
        }
      });
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        fetchDashboardData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel(`notifications-${session.user.id}`)
      .on("postgres_changes", 
        { event: "INSERT", schema: "public", table: "notifications", filter: `profile_id=eq.${session.user.id}` }, 
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
          toast.info(payload.new.title, { description: payload.new.message });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      setProfile(profileData);

      // Determine Currency by Country
      let detectedCurrency = "XAF";
      if (profileData?.country === "Nigeria") detectedCurrency = "NGN";
      else if (profileData?.country === "USA") detectedCurrency = "USD";
      else if (profileData?.country === "UK") detectedCurrency = "GBP";

      // 2. Fetch Wallet
      let { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("profile_id", userId)
        .maybeSingle();
      
      // Update wallet currency if it doesn't match detected currency
      if (walletData && walletData.currency !== detectedCurrency) {
        const { data: updatedWallet } = await supabase
          .from("wallets")
          .update({ currency: detectedCurrency })
          .eq("id", walletData.id)
          .select()
          .maybeSingle();
        walletData = updatedWallet;
      }
      setWallet(walletData);

      // ... existing orders/products fetch ...
      // (Simplified for brevity, ensuring I don't delete code)
      const { data: ordersData } = await supabase.from("orders").select(`*, order_items(*, products(*))`).eq("buyer_id", userId).order("created_at", { ascending: false }).limit(5);
      setOrders(ordersData || []);
      const { data: productsData } = await supabase.from("products").select("*").eq("status", "active").limit(6);
      setRecommended(productsData || []);
      const { data: bargainData } = await supabase.from("products").select("*").eq("is_bargain", true).limit(4);
      setBargains(bargainData || []);
      const { data: deliveryData } = await supabase.from("deliveries").select(`*, orders(*)`).order("created_at", { ascending: false }).limit(4);
      setDeliveries(deliveryData || []);
      const { data: farmerData } = await supabase.from("profiles").select("*").eq("signup_role", "farmer").limit(3);
      setFarmers(farmerData || []);
      const { data: notifData, count } = await supabase.from("notifications").select("*", { count: "exact" }).eq("profile_id", userId).eq("is_read", false).order("created_at", { ascending: false });
      setNotifications(notifData || []);
      setUnreadCount(count || 0);
      const { data: cardData } = await supabase.from("cards").select("*").eq("profile_id", userId).maybeSingle();
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

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
    } else {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", session.user.id);
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Profile picture updated!");
    }
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

    const { error: uploadError } = await supabase.storage
      .from('avatars') // Using same bucket for now, or you can use 'ids'
      .upload(filePath, file);

    if (uploadError) {
      toast.error("ID Upload failed: " + uploadError.message);
    } else {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from("profiles").update({ id_card_url: publicUrl }).eq("id", session.user.id);
      setProfile({ ...profile, id_card_url: publicUrl });
      toast.success("ID image uploaded successfully!");
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const updates = Object.fromEntries(formData.entries());
    
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", session.user.id);

    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated successfully!");
      setIsProfileModalOpen(false);
      fetchDashboardData(session.user.id);
    }
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
        const { error } = await supabase
          .from("wallets")
          .update({ balance: (wallet?.balance || 0) + amount })
          .eq("profile_id", session.user.id);
        
        if (!error) {
          await supabase.from("notifications").insert({
            profile_id: session.user.id,
            title: "Wallet Topped Up",
            message: `Successfully added ${wallet?.currency} ${amount.toLocaleString()} to your wallet.`
          });
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
    await supabase.from("wallets").update({ balance: wallet.balance - fee }).eq("profile_id", session.user.id);

    const cardNumber = "5592 " + Math.floor(Math.random() * 8999 + 1000) + " " + Math.floor(Math.random() * 8999 + 1000) + " " + Math.floor(Math.random() * 8999 + 1000);
    const expiry = "12/28";
    const cvv = Math.floor(Math.random() * 899 + 100).toString();

    const { error } = await supabase.from("cards").insert({
      profile_id: session.user.id,
      card_number: cardNumber,
      card_holder_name: profile.full_name,
      expiry_date: expiry,
      cvv: cvv,
      type: type
    });

    if (error) toast.error(error.message);
    else {
      toast.success(`${type.toUpperCase()} Card generated successfully!`);
      fetchDashboardData(session.user.id);
    }
    setLoading(false);
  };

  const [activeNavTab, setActiveNavTab] = useState<string>("dashboard");

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Buyer Dashboard", href: "/dashboard" },
    { id: "offline", icon: WifiOff, label: "COCF Offline 📶", href: "/offline-commerce", cocf: true },
    { id: "academy", icon: GraduationCap, label: "Camer Market Academy 🎓", href: "/academy", academy: true },
    { id: "seller", icon: Store, label: "Switch to Seller View", href: "/seller-dashboard", highlight: true },
    ...(profile?.role === "admin" || 
        profile?.role === "super_admin" || 
        profile?.signup_role === "admin" ||
        session?.user?.email === "info@azariahmg.com" ? [
      { id: "admin", icon: Shield, label: "Admin Panel", href: "/admin", special: true }
    ] : []),
    { id: "marketplace", icon: ShoppingBag, label: "Marketplace", href: "/market-zone" },
    { id: "categories", icon: Layers, label: "Categories", href: "/market-zone?tab=categories" },
    { id: "bargains", icon: MessageCircle, label: "Bargains", href: "/market-zone?tab=bargains" },
    { id: "orders", icon: Package, label: "Orders", href: "/dashboard?tab=orders" },
    { id: "wallet", icon: Wallet, label: "Wallet", href: "/cards-wallet" },
    { id: "saved", icon: Heart, label: "Saved Items", href: "/market-zone?tab=saved" },
    { id: "regions", icon: Map, label: "Regions", href: "/market-zone?tab=regions" },
    { id: "logistics", icon: Truck, label: "Logistics", href: "/#logistics" },
    { id: "messages", icon: MessageCircle, label: "Messages", badge: unreadCount, href: "/dashboard?tab=messages" },
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
              <Button size="sm" className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white text-[11px] rounded-lg">
                Invite Now <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
              <Input 
                placeholder="Search products, farmers, orders, regions..." 
                className="pl-12 bg-gray-50 border-transparent rounded-xl h-11 focus-visible:ring-emerald-500 focus-visible:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="relative p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                <Bell className="h-6 w-6" />
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
              <DropdownMenuTrigger className="flex items-center gap-3 pl-4 border-l border-gray-100 focus:outline-none">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{profile?.full_name || "Account"}</p>
                  <p className={`text-[10px] font-bold flex items-center justify-end gap-1 ${profile?.is_verified ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {profile?.is_verified ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    <span className="capitalize">{profile?.signup_role?.replace('_', ' ') || 'User'}</span> • {profile?.is_verified ? "Verified" : "Pending"}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-100 overflow-hidden border-2 border-white shadow-sm">
                  <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || "Felix"}`} alt="User avatar" />
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
                  supabase.auth.signOut().then(() => navigate("/signin"));
                }} className="flex items-center gap-2 cursor-pointer text-red-600">
                  <X className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button className="lg:hidden p-2 text-gray-600" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
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
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Discover products, services, and regional goods across Cameroon.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <ShoppingCart className="h-4 w-4 text-emerald-700" /> Cart (1 item)
                  </span>
                </div>
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {[
                  { name: "Agriculture", icon: "🌾", active: true },
                  { name: "Food & Beverages", icon: "🥖" },
                  { name: "Fashion", icon: "👗" },
                  { name: "Beauty", icon: "💄" },
                  { name: "Electronics", icon: "📱" },
                  { name: "Home", icon: "🏠" },
                  { name: "Construction", icon: "🏗️" },
                  { name: "Services", icon: "🔧" },
                  { name: "Handmade", icon: "🏺" },
                  { name: "Wholesale", icon: "📦" }
                ].map((cat, idx) => (
                  <button 
                    key={idx}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
                      cat.active ? "bg-[#064E3B] text-white shadow-md" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Filters & Sorting Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm text-xs font-bold">
                <div className="flex flex-wrap items-center gap-2">
                  <Select defaultValue="all-cat">
                    <SelectTrigger className="h-9 w-36 bg-gray-50 border-gray-200 text-xs">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-cat">All Categories</SelectItem>
                      <SelectItem value="agric">Agriculture</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="all-reg">
                    <SelectTrigger className="h-9 w-36 bg-gray-50 border-gray-200 text-xs">
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-reg">All Regions</SelectItem>
                      <SelectItem value="littoral">Littoral (Douala)</SelectItem>
                      <SelectItem value="centre">Centre (Yaoundé)</SelectItem>
                      <SelectItem value="southwest">South West (Buea)</SelectItem>
                    </SelectContent>
                  </Select>

                  <span className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-pointer hover:bg-gray-100">
                    Bargain Available
                  </span>
                  <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl cursor-pointer font-bold">
                    ✓ Verified Sellers
                  </span>
                  <span className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-pointer hover:bg-gray-100">
                    Farm Fresh
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button className="text-gray-400 hover:text-gray-600 text-xs">Clear Filters</button>
                  <Button size="sm" className="bg-[#064E3B] hover:bg-emerald-950 text-white font-extrabold text-xs h-9 px-4 rounded-xl">
                    Apply Filters
                  </Button>
                </div>
              </div>

              {/* 3-Column Main Marketplace Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                
                {/* Left 3 Columns: Product Grid */}
                <div className="xl:col-span-3 space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
                    <span>Showing 1-12 of 1,248 products</span>
                    <div className="flex items-center gap-2">
                      <span>Sort By:</span>
                      <span className="text-gray-900 font-black">Recommended</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {[
                      { id: 1, title: "Red Palm Oil (1L)", seller: "Best Palm Cooperative", region: "South West", price: 2100, tag: "Farm Fresh", img: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80", rating: "4.8 (126)", isBargain: false },
                      { id: 2, title: "Organic Cocoa Beans (1kg)", seller: "Cocoa Farmers Union", region: "Centre", price: 3500, tag: "Bargain", img: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80", rating: "4.7 (98)", isBargain: true },
                      { id: 3, title: "Plantains (1 Bunch)", seller: "Green Valley Farms", region: "Littoral", price: 800, tag: "Farm Fresh", img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80", rating: "4.6 (76)", isBargain: false },
                      { id: 4, title: "Fresh Tomatoes (1kg)", seller: "Healthy Fields Co-op", region: "North West", price: 1600, tag: "Farm Fresh", img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80", rating: "4.7 (112)", isBargain: false },
                      { id: 5, title: "Robusta Coffee (1kg)", seller: "Highland Coffee Farmers", region: "Ouest", price: 4200, tag: "Bargain", img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80", rating: "4.8 (89)", isBargain: true },
                      { id: 6, title: "Handmade Basket", seller: "Artisans du Cameroun", region: "Adamawa", price: 3600, tag: "Handmade", img: "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=400&q=80", rating: "4.7 (64)", isBargain: false }
                    ].map((prod) => (
                      <div key={prod.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                        <div className="h-44 bg-gray-100 relative overflow-hidden">
                          <img src={prod.img} alt={prod.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm ${
                            prod.tag === "Bargain" ? "bg-amber-400 text-amber-950" : "bg-emerald-600 text-white"
                          }`}>
                            {prod.tag}
                          </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="font-extrabold text-gray-900 text-sm line-clamp-1">{prod.title}</h4>
                            <p className="text-[11px] text-gray-400 mt-0.5">{prod.seller} • <span className="text-emerald-700 font-bold">{prod.region}</span></p>
                            <span className="text-[10px] text-amber-500 font-bold mt-1 block">★ {prod.rating}</span>
                          </div>
                          <div>
                            <span className="text-base font-black text-gray-900 block">FCFA {prod.price.toLocaleString()}</span>
                            <div className="flex items-center gap-2 mt-2">
                              <button 
                                onClick={() => navigate(`/checkout?productId=${prod.id}`)}
                                className="h-9 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center shrink-0"
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </button>
                              <Button 
                                onClick={() => navigate(`/checkout?productId=${prod.id}`)}
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
                      <p className="text-[9px] text-gray-400">Across Cameroon</p>
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
                      <span className="text-[10px] text-emerald-700 font-bold cursor-pointer">View all</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { title: "Fresh Pineapples (1pc)", price: "FCFA 1,200", old: "FCFA 1,800", off: "-33%", img: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=150&q=80" },
                        { title: "Cameroon Peppers (500g)", price: "FCFA 800", old: "FCFA 1,200", off: "-33%", img: "https://images.unsplash.com/photo-1588879460405-59427f7f4577?auto=format&fit=crop&w=150&q=80" },
                        { title: "Dry Okra (250g)", price: "FCFA 900", old: "FCFA 1,400", off: "-36%", img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=150&q=80" }
                      ].map((b, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                          <div className="flex items-center gap-2.5">
                            <img src={b.img} alt={b.title} className="h-10 w-10 rounded-xl object-cover" />
                            <div>
                              <p className="font-extrabold text-gray-900 text-[11px] line-clamp-1">{b.title}</p>
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-emerald-700 text-xs">{b.price}</span>
                                <span className="text-[9px] text-gray-400 line-through">{b.old}</span>
                                <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1 rounded">{b.off}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-1 rounded-lg">Bargain</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Widget 2: Top Rated Sellers */}
                  <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-gray-900">Top Rated Sellers</h4>
                      <span className="text-[10px] text-emerald-700 font-bold cursor-pointer">View all</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { rank: 1, name: "Best Palm Cooperative", location: "South West", rating: "4.8 (126)" },
                        { rank: 2, name: "Green Valley Farms", location: "Littoral", rating: "4.8 (98)" },
                        { rank: 3, name: "Highland Coffee Farmers", location: "Ouest", rating: "4.7 (89)" },
                        { rank: 4, name: "Healthy Fields Co-op", location: "North West", rating: "4.7 (112)" }
                      ].map((s) => (
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

                  {/* Widget 3: Cameroon 10 Economic Blocs Map */}
                  <div className="bg-[#064E3B] text-white rounded-3xl p-5 space-y-3 shadow-lg relative overflow-hidden">
                    <h4 className="font-black text-sm text-amber-400">Explore Cameroon's 10 Economic Blocs</h4>
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
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Find quality products, support local farmers, and enjoy secure shopping across Cameroon.</p>
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
                  value="12" 
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
        </main>
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
        <SheetContent side="left" className="p-0 bg-white border-r-0 w-72">
          <SheetHeader className="p-6 bg-[#064E3B] text-white text-left">
            <div className="flex items-center gap-2 mb-2">
              <img src={logo} alt="CameMark" className="h-8 w-auto brightness-0 invert" />
            </div>
            <SheetTitle className="text-white text-lg font-black">CameMark Dashboard</SheetTitle>
            <SheetDescription className="text-emerald-100 text-[10px]">
              {profile?.full_name || "Buyer"} • {profile?.signup_role?.replace('_', ' ') || "User"}
            </SheetDescription>
          </SheetHeader>
          
          <nav className="p-4 space-y-1">
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
                  supabase.auth.signOut().then(() => navigate("/"));
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

