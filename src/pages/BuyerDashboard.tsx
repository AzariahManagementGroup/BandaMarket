import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, ShoppingBag, List, MessageCircle, 
  Settings, Wallet, Heart, Map, Truck, 
  Search, Bell, Globe, ChevronDown, 
  Plus, ArrowUpRight, Clock, CheckCircle2,
  Package, MapPin, Store, ArrowRight,
  TrendingUp, CreditCard, ExternalLink,
  Menu, X, Loader2, Shield
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
      setProfile(user);
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

  const navItems = [
    { icon: LayoutDashboard, label: "Buyer Dashboard", active: true, href: "/dashboard" },
    ...(profile?.role === "admin" || 
        profile?.role === "super_admin" || 
        profile?.signup_role === "admin" ||
        session?.user?.email === "info@azariahmg.com" ? [
      { icon: Shield, label: "Admin Panel", href: "/admin", special: true }
    ] : []),
    { icon: ShoppingBag, label: "Marketplace", href: "/market-zone" },
    { icon: List, label: "Categories", href: "#" },
    { icon: MessageCircle, label: "Bargains", href: "#" },
    { icon: List, label: "Orders", href: "#" },
    { icon: Wallet, label: "Wallet", href: "#" },
    { icon: Heart, label: "Saved Items", href: "#" },
    { icon: Map, label: "Regions", href: "#" },
    { icon: Truck, label: "Logistics", href: "#" },
    { icon: MessageCircle, label: "Messages", badge: unreadCount, href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
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
          {navItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => item.href !== "#" && navigate(item.href)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                item.active 
                  ? "bg-[#064E3B] text-white shadow-lg shadow-emerald-900/20" 
                  : item.special
                    ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50"
                    : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
              } animate-fade-in-right`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${item.active ? "text-white" : "group-hover:text-emerald-600"}`} />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
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
                <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" /> Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/cards-wallet")} className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" /> Cards & Wallet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => supabase.auth.signOut().then(() => navigate("/"))} className="flex items-center gap-2 cursor-pointer text-red-600">
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
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 custom-scrollbar">
          {/* Welcome Section */}
          <div className="animate-fade-in">
            <h2 className="text-2xl font-extrabold text-gray-900">Welcome back, {profile?.full_name?.split(" ")[0] || "Buyer"} 👋</h2>
            <p className="text-sm text-gray-500 mt-1">Find quality products, support local, and enjoy secure shopping across Cameroon.</p>
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
              value={orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length.toString()} 
              subValue="Real-time tracking" 
              icon={ShoppingBag} 
              iconColor="text-emerald-600 bg-emerald-50"
              delay={0.2}
            />
            <StatCard 
              title="Saved Items" 
              value="0" 
              subValue="Feature coming soon" 
              icon={Heart} 
              iconColor="text-emerald-600 bg-emerald-50"
              delay={0.3}
            />
            <StatCard 
              title="Monthly Spend" 
              value="FCFA 0" 
              subValue="Tracking your budget" 
              icon={TrendingUp} 
              iconColor="text-emerald-600 bg-emerald-50"
              isTrend
              delay={0.4}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

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
            {/* Left Column: Recommended & Wallet */}
            <div className="xl:col-span-2 space-y-8">
              {/* Recommended Section */}
              <section className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-extrabold text-gray-900">Recommended for You</h3>
                  <div className="flex gap-2">
                    <button className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-emerald-50 transition-colors"><ArrowRight className="h-4 w-4 rotate-180" /></button>
                    <button className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-emerald-50 transition-colors"><ArrowRight className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                  {recommended.length > 0 ? recommended.map((p, i) => (
                    <ProductCard key={p.id} title={p.title} price={p.price.toLocaleString()} rating={(4.5 + Math.random() * 0.5).toFixed(1)} delay={0.6 + (i * 0.1)} />
                  )) : (
                    <div className="p-10 border border-dashed rounded-2xl w-full text-center text-gray-400 font-bold">
                      Finding the best products for you...
                    </div>
                  )}
                </div>
              </section>

              {/* Wallet & Card Section */}
              <div className="grid md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "1.1s" }}>
                <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden hover-lift">
                  <CardContent className="p-6">
                    <h4 className="text-sm font-bold text-gray-600 mb-6">CamRency Wallet</h4>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Balance</p>
                        <p className="text-xl font-extrabold text-gray-900">{wallet?.currency || "FCFA"} {wallet?.balance?.toLocaleString() || "0"}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <WalletAction icon={Plus} label="Add Money" onClick={() => handleWalletAction("add")} />
                      <WalletAction icon={ArrowUpRight} label="Pay Merchant" onClick={() => handleWalletAction("pay")} />
                      <WalletAction icon={ArrowRight} label="Send Money" onClick={() => handleWalletAction("send")} />
                      <WalletAction icon={Wallet} label="Withdraw" onClick={() => handleWalletAction("withdraw")} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl bg-[#0F172A] border-none shadow-xl overflow-hidden group hover-lift relative min-h-[200px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent pointer-events-none" />
                  <CardContent className="p-6 text-white relative z-10 flex flex-col h-full">
                    {!card ? (
                      <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                        <CreditCard className="h-10 w-10 text-emerald-400 mb-2 animate-pulse" />
                        <h4 className="text-sm font-bold mb-1">No Active Card</h4>
                        <p className="text-[10px] text-gray-400 mb-4">Generate your virtual or physical CaMark card today.</p>
                        <Button size="sm" onClick={() => handleWalletAction("add")} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] h-8 px-4 rounded-lg">
                          Create Card
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-10">
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">CaMark Card</p>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-emerald-400" />
                              <span className="text-xs font-bold tracking-widest text-emerald-400">{card.type === 'physical' ? 'PHYSICAL' : 'VIRTUAL'}</span>
                            </div>
                          </div>
                          <div className="h-8 w-12 bg-white/10 rounded-md backdrop-blur-md flex items-center justify-center italic font-bold text-[10px]">VISA</div>
                        </div>
                        
                        <p className="text-lg font-bold tracking-widest mb-6">
                          {card.card_number.replace(/\d(?=\d{4})/g, "*")}
                        </p>
                        
                        <div className="flex justify-between items-end mt-auto">
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase font-bold">Valid Thru</p>
                            <p className="text-xs font-bold tracking-widest">{card.expiry_date}</p>
                          </div>
                          <p className="text-xs font-bold tracking-wider uppercase opacity-80">{card.card_holder_name}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Economic Blocs & Map Card */}
              <div className="grid md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "1.2s" }}>
                <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden hover-lift p-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Explore the 10 Economic Blocs</h4>
                  <p className="text-[10px] text-gray-500 mb-6 leading-relaxed">Discover products and sellers from all 10 regions of Cameroon, each a unique economic hub.</p>
                  <div className="relative h-40 w-full mb-4 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <Map className="h-16 w-16 text-emerald-200 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                       <MapPin className="absolute top-1/4 left-1/3 h-4 w-4 text-emerald-600" />
                       <MapPin className="absolute bottom-1/4 right-1/3 h-4 w-4 text-emerald-600" />
                       <MapPin className="absolute top-1/2 right-1/4 h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                  <Button onClick={() => navigate("/market-zone?regions=true")} variant="outline" className="w-full border-emerald-100 text-emerald-700 hover:bg-emerald-50 rounded-xl h-10 text-xs font-bold">
                    Explore Regions <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Card>

                <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden hover-lift p-6">
                   <div className="flex items-center justify-between mb-6">
                     <h4 className="text-sm font-bold text-gray-900">Farm Fresh Near You</h4>
                     <button className="text-emerald-600 text-[10px] font-bold hover:underline" onClick={() => navigate("/market-zone?role=farmer")}>Browse All Farmers</button>
                   </div>
                   <div className="space-y-4">
                     {farmers.length > 0 ? farmers.map(f => (
                       <SellerRow key={f.id} name={f.full_name} region={`${f.city || ''}, ${f.region || ''}`} rating={(4.5 + Math.random() * 0.5).toFixed(1)} />
                     )) : (
                       <p className="text-[10px] text-gray-400 text-center py-4 italic">No farmers found in your region.</p>
                     )}
                   </div>
                </Card>
              </div>
            </div>

            {/* Right Column: Bargains & Deliveries & Recent Orders */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: "1.3s" }}>
              {/* Bargain Deals */}
              <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-extrabold text-gray-900">Today's Bargain Deals</h3>
                  <button className="text-[10px] font-bold text-emerald-600 hover:underline">View all</button>
                </div>
                <div className="space-y-4">
                  {bargains.length > 0 ? bargains.map(b => (
                    <BargainItem key={b.id} title={b.title} discount={`-${Math.round((1 - b.discount_price/b.price)*100)}%`} price={b.discount_price.toLocaleString()} oldPrice={b.price.toLocaleString()} />
                  )) : (
                    <p className="text-[10px] text-gray-400 text-center py-4 italic">No active bargains today.</p>
                  )}
                </div>
              </section>

              {/* My Deliveries */}
              <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-extrabold text-gray-900">My Deliveries</h3>
                  <button className="text-[10px] font-bold text-emerald-600 hover:underline">View all</button>
                </div>
                <div className="space-y-6 relative">
                  <div className="absolute left-4 top-1 bottom-1 w-[2px] bg-gray-50" />
                  {deliveries.length > 0 ? deliveries.map((d, i) => (
                    <DeliveryStatus 
                      key={d.id} 
                      status={d.status.replace('_', ' ')} 
                      id={d.id.slice(0, 8)} 
                      label={`Order #${d.order_id.slice(0, 6)}`} 
                      time={new Date(d.created_at).toLocaleDateString()} 
                      active={d.status === 'in_transit' || d.status === 'assigned'} 
                      done={d.status === 'delivered'} 
                    />
                  )) : (
                    <p className="text-[10px] text-gray-400 text-center py-4 italic">No active deliveries.</p>
                  )}
                </div>
              </section>

              {/* Recent Orders */}
              <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-extrabold text-gray-900">Recent Orders</h3>
                  <button className="text-[10px] font-bold text-emerald-600 hover:underline">View all</button>
                </div>
                <div className="space-y-4">
                  {orders.length > 0 ? orders.map(o => (
                    <OrderItem key={o.id} id={o.id.slice(0, 8)} date={new Date(o.created_at).toLocaleDateString()} status={o.status} statusColor={o.status === "pending" ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"} />
                  )) : (
                    <p className="text-[10px] text-gray-400 text-center py-4 font-bold">No orders yet.</p>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <section className="animate-fade-in" style={{ animationDelay: "1.4s" }}>
            <h3 className="text-sm font-extrabold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <QuickAction icon={ShoppingBag} label="Browse Market" />
              <QuickAction icon={MessageCircle} label="Start Bargain" />
              <QuickAction icon={Truck} label="Track Order" />
              <QuickAction icon={Map} label="Explore Regions" />
              <QuickAction icon={Store} label="Shop Farmers" />
              <QuickAction icon={Wallet} label="Use Wallet" />
            </div>
          </section>

          {/* Promotional Banner */}
          <div className="rounded-3xl bg-[#064E3B] p-8 relative overflow-hidden group animate-scale-in" style={{ animationDelay: "1.5s" }}>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">Shop with Confidence</h3>
                <p className="text-emerald-100/80 text-sm max-w-md">Secure payments, buyer protection, and reliable delivery across Cameroon.</p>
                <Button className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold rounded-xl px-8 h-12 shadow-lg shadow-amber-900/20">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-40 w-40 md:h-56 md:w-56 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center p-4">
                   <div className="h-full w-full rounded-full overflow-hidden bg-white shadow-xl flex items-center justify-center p-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent" />
                      <CheckCircle2 className="h-16 w-16 text-[#064E3B] relative z-10 animate-bounce" />
                   </div>
                </div>
              </div>
            </div>
          </div>
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

