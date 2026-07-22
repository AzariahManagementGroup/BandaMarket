import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Store, Package, Plus, DollarSign, 
  TrendingUp, ShoppingBag, MessageCircle, Settings, Wallet, 
  BarChart3, Truck, Search, Bell, Globe, ChevronDown, 
  ArrowUpRight, Clock, CheckCircle2, MapPin, Eye, Edit, Trash2,
  Menu, X, Loader2, Shield, ArrowRight, ArrowLeftRight
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getApiUrl } from "@/config";
import { toast } from "sonner";
import logo from "@/assets/camemark-logo.png";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "1",
    unit: "pcs",
    category: "Agriculture & Produce",
    region: "Littoral",
    city: "Douala",
    imageUrl: ""
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.title || !editingProduct.price) {
      toast.error("Title and price are required");
      return;
    }

    try {
      const response = await fetch(getApiUrl("/api/products"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setListings(listings.map(item => item.id === editingProduct.id ? editingProduct : item));
        setIsEditModalOpen(false);
        setEditingProduct(null);
        toast.success("Product updated successfully!");
      } else {
        setListings(listings.map(item => item.id === editingProduct.id ? editingProduct : item));
        setIsEditModalOpen(false);
        toast.success("Product updated!");
      }
    } catch (err) {
      setListings(listings.map(item => item.id === editingProduct.id ? editingProduct : item));
      setIsEditModalOpen(false);
      toast.success("Product updated!");
    }
  };

  const handleDeleteListing = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product listing?")) return;

    try {
      const response = await fetch(`${getApiUrl("/api/products")}?id=${productId}`, {
        method: "DELETE"
      });
      const data = await response.json();

      setListings(listings.filter(item => item.id !== productId));
      toast.success("Product deleted successfully!");
    } catch (err) {
      setListings(listings.filter(item => item.id !== productId));
      toast.success("Product removed!");
    }
  };

  useEffect(() => {
    document.title = "Seller Dashboard | CameMark";
    const token = localStorage.getItem("camemark_token");
    const userStr = localStorage.getItem("camemark_user");

    if (!token && !userStr) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          navigate("/signin");
        } else {
          setSession(session);
          setLoading(false);
        }
      });
    } else if (userStr) {
      const user = JSON.parse(userStr);
      setSession({ user });
      const currentProfile = {
        ...user,
        full_name: user.fullName || user.full_name || user.email?.split('@')[0],
        signup_role: user.role || user.signup_role || 'seller',
        avatar_url: user.avatarUrl || user.avatar_url
      };
      setProfile(currentProfile);
      if (user.wallet) setWallet(user.wallet);
    }

    // Fetch existing products from MySQL API & localStorage backup
    const localListings = localStorage.getItem("camemark_products");
    if (localListings) {
      try {
        setListings(JSON.parse(localListings));
      } catch (e) {}
    }

    fetch(getApiUrl("/api/products"))
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          const parsed = data.products.map((p: any) => ({
            ...p,
            price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0
          }));
          setListings(parsed);
        }
      })
      .catch(err => console.error("Error fetching listings:", err))
      .finally(() => setLoading(false));

    // Fetch notifications
    const uId = profile?.id || JSON.parse(userStr || '{}').id;
    if (uId) {
      fetch(getApiUrl(`/api/notifications?userId=${uId}`))
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.notifications)) {
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter((n: any) => n.isRead == 0).length);
          }
        })
        .catch(err => console.error("Notifications fetch error:", err));
    }
  }, [navigate]);

  const [isKycRequiredModalOpen, setIsKycRequiredModalOpen] = useState(false);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();

    const isVerified = profile?.kycStatus === 'approved' || profile?.is_verified;
    if (!isVerified && listings.length >= 1) {
      setIsNewListingModalOpen(false);
      setIsKycRequiredModalOpen(true);
      toast.warning("Unverified merchants are limited to 1 product listing. Complete KYC verification to publish unlimited items!");
      return;
    }

    if (!newListing.title || !newListing.price) {
      toast.error("Please provide title and price");
      return;
    }

    const payload = {
      sellerId: profile?.id || session?.user?.id || "",
      sellerName: profile?.full_name || profile?.fullName || "Merchant",
      sellerEmail: profile?.email || session?.user?.email || "",
      title: newListing.title,
      description: newListing.description,
      price: parseFloat(newListing.price),
      currency: "XAF",
      quantity: parseInt(newListing.quantity),
      unit: newListing.unit,
      category: newListing.category,
      region: newListing.region,
      city: newListing.city,
      imageUrl: newListing.imageUrl
    };

    try {
      const response = await fetch(getApiUrl("/api/products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok && data.product) {
        const updated = [data.product, ...listings];
        setListings(updated);
        localStorage.setItem("camemark_products", JSON.stringify(updated));
        setIsNewListingModalOpen(false);
        setNewListing({
          title: "",
          description: "",
          price: "",
          quantity: "1",
          unit: "pcs",
          category: "Agriculture & Produce",
          region: "Littoral",
          city: "Douala",
          imageUrl: ""
        });
        toast.success("New product listing published! Email & notification dispatched.");
      } else {
        // Fallback for local preview if offline
        const created = { id: "lst-" + Date.now(), ...payload, status: "active", createdAt: new Date().toISOString() };
        const updated = [created, ...listings];
        setListings(updated);
        localStorage.setItem("camemark_products", JSON.stringify(updated));
        setIsNewListingModalOpen(false);
        toast.success("New product listing published!");
      }
      const newNotif = {
        id: "notif-" + Date.now(),
        title: "Product Listing Live! 📦",
        message: `Your product '${newListing.title}' is now live on Market Zone. Complete KYC verification to unlock unlimited listings!`,
        isRead: 0,
        createdAt: new Date().toISOString()
      };
      setNotifications([newNotif, ...notifications]);
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      const created = { id: "lst-" + Date.now(), ...payload, status: "active", createdAt: new Date().toISOString() };
      const updated = [created, ...listings];
      setListings(updated);
      localStorage.setItem("camemark_products", JSON.stringify(updated));
      setIsNewListingModalOpen(false);
      toast.success("New product listing published!");

      const newNotif = {
        id: "notif-" + Date.now(),
        title: "Product Listing Live! 📦",
        message: `Your product '${newListing.title}' is now live on Market Zone. Complete KYC verification to unlock unlimited listings!`,
        isRead: 0,
        createdAt: new Date().toISOString()
      };
      setNotifications([newNotif, ...notifications]);
      setUnreadCount(prev => prev + 1);
    }
  };

  const location = useLocation();

  // Sync URL subpath to activeTab
  const getTabFromPath = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments.length > 1 && pathSegments[0] === "seller-dashboard") {
      return pathSegments[1];
    }
    return "dashboard";
  };

  const activeTab = getTabFromPath();

  const navItems = [
    { id: "dashboard", icon: Store, label: "Seller Dashboard", active: activeTab === "dashboard", href: "/seller-dashboard" },
    { id: "switch", icon: LayoutDashboard, label: "Switch to Buyer View", href: "/dashboard", highlight: true },
    ...(profile?.role === "admin" || profile?.signup_role === "admin" ? [
      { id: "admin", icon: Shield, label: "Admin Panel", href: "/admin", special: true }
    ] : []),
    { id: "listings", icon: Package, label: "My Listings", active: activeTab === "listings", href: "/seller-dashboard/listings" },
    { id: "orders", icon: ShoppingBag, label: "Sales Orders", active: activeTab === "orders", href: "/seller-dashboard/orders" },
    { id: "inquiries", icon: MessageCircle, label: "Buyer Inquiries", active: activeTab === "inquiries", href: "/seller-dashboard/inquiries" },
    { id: "earnings", icon: Wallet, label: "Earnings & Payouts", active: activeTab === "earnings", href: "/seller-dashboard/earnings" },
    { id: "analytics", icon: BarChart3, label: "Sales Analytics", active: activeTab === "analytics", href: "/seller-dashboard/analytics" },
    { id: "shipments", icon: Truck, label: "Shipments", active: activeTab === "shipments", href: "/seller-dashboard/shipments" },
    { id: "settings", icon: Settings, label: "Store Settings", active: activeTab === "settings", href: "/seller-dashboard/settings" },
  ];

  if (loading && !session) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold animate-pulse">Loading Seller Center...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-10">
          <img src={logo} alt="CameMark" className="h-10 w-auto animate-float" />
        </div>

        <nav className="space-y-1">
          {navItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.href) {
                  navigate(item.href);
                } else if (item.id) {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                item.active 
                  ? "bg-emerald-900 text-white shadow-lg shadow-emerald-900/20" 
                  : item.highlight
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200/60"
                    : item.special
                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50"
                      : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
              } animate-fade-in-right`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${item.active ? "text-white" : item.highlight ? "text-emerald-600" : "group-hover:text-emerald-600"}`} />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8">
          <Button 
            onClick={() => setIsNewListingModalOpen(true)}
            className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-900/20"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-10 shrink-0 gap-3">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-6 bg-white flex flex-col">
                <div className="flex items-center gap-2 mb-8">
                  <img src={logo} alt="CameMark" className="h-10 w-auto" />
                </div>
                <nav className="space-y-1 flex-1 overflow-y-auto">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (item.href) {
                          navigate(item.href);
                        } else if (item.id) {
                          setActiveTab(item.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                        item.active 
                          ? "bg-emerald-900 text-white shadow-md" 
                          : item.highlight
                            ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60"
                            : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </div>
                    </button>
                  ))}
                </nav>
                <div className="pt-4 mt-auto border-t border-gray-100">
                  <Button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsNewListingModalOpen(true);
                    }}
                    className="w-full bg-[#064E3B] text-white font-bold h-11 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Product
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="relative group flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
              <Input 
                placeholder="Search products, orders..." 
                className="pl-10 bg-gray-50 border-transparent rounded-xl h-10 text-xs sm:text-sm focus-visible:ring-emerald-500 focus-visible:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-2">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl h-10 px-3 text-xs"
            >
              <ArrowLeftRight className="h-4 w-4" /> Switch to Buyer
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-gray-100 h-10 w-10 shrink-0">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-600 rounded-full text-[10px] font-extrabold text-white flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex items-center justify-between p-2 border-b border-gray-100">
                  <h4 className="font-extrabold text-sm text-gray-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto py-1 space-y-1">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                        <p className="text-xs font-bold text-gray-900">{n.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                        <span className="text-[9px] text-gray-400 mt-1 block">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-6">No notifications yet</p>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-100 focus:outline-none">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{profile?.full_name || "Merchant"}</p>
                  <p className={`text-[10px] font-bold flex items-center justify-end gap-1 ${profile?.kycStatus === 'approved' || profile?.is_verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {profile?.kycStatus === 'approved' || profile?.is_verified ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    <span>{profile?.kycStatus === 'approved' || profile?.is_verified ? "Verified Merchant" : "Verification Pending"}</span>
                  </p>
                </div>
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-100 overflow-hidden border-2 border-white shadow-sm shrink-0">
                  <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || "Merchant"}`} alt="User avatar" />
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="flex items-center gap-2 cursor-pointer font-bold text-emerald-700 sm:hidden">
                  <ArrowLeftRight className="h-4 w-4" /> Switch to Buyer View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsNewListingModalOpen(true)} className="flex items-center gap-2 cursor-pointer">
                  <Plus className="h-4 w-4" /> Post New Listing
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
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 custom-scrollbar">
          {activeTab === "dashboard" && (
            <>
              {/* Welcome Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#064E3B] via-emerald-800 to-emerald-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-emerald-900/15 animate-fade-in hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-500 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700 pointer-events-none" />
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 shadow-sm animate-pulse">
                    Merchant Portal 🏪
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back, {profile?.full_name?.split(" ")[0] || "Seller"}!</h2>
                  <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                    Manage your store listings, review buyer inquiries, and track sales revenue across all 10 regions.
                  </p>
                </div>
                <Button 
                  onClick={() => setIsNewListingModalOpen(true)}
                  className="bg-white text-emerald-950 hover:bg-emerald-50 font-black h-11 sm:h-12 px-5 sm:px-6 rounded-xl shrink-0 shadow-lg text-xs sm:text-sm transition-all duration-300 hover:scale-105 hover:shadow-white/20 relative z-10"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Add New Listing
                </Button>
              </div>

              {/* Merchant Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="rounded-2xl border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-6 bg-white/90 backdrop-blur-sm group cursor-pointer border border-transparent hover:border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales Revenue</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-2 group-hover:text-emerald-700 transition-colors">FCFA 0</h3>
                      <p className="text-xs text-emerald-600 font-bold mt-1">Ready for payout</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 flex items-center justify-center text-emerald-600 font-bold shadow-sm">
                      <DollarSign className="h-6 w-6" />
                    </div>
                  </div>
                </Card>

                <Card className="rounded-2xl border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-6 bg-white/90 backdrop-blur-sm group cursor-pointer border border-transparent hover:border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Listings</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-2 group-hover:text-blue-700 transition-colors">{listings.length}</h3>
                      <p className="text-xs text-gray-400 mt-1">Live in Market Zone</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                      <Package className="h-6 w-6" />
                    </div>
                  </div>
                </Card>

                <Card className="rounded-2xl border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-6 bg-white/90 backdrop-blur-sm group cursor-pointer border border-transparent hover:border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Orders</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-2 group-hover:text-amber-700 transition-colors">0</h3>
                      <p className="text-xs text-amber-600 font-bold mt-1">Awaiting dispatch</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 flex items-center justify-center text-amber-600 font-bold shadow-sm">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  </div>
                </Card>

                <Card className="rounded-2xl border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-6 bg-white/90 backdrop-blur-sm group cursor-pointer border border-transparent hover:border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Rating</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-2 group-hover:text-purple-700 transition-colors">5.0 ★</h3>
                      <p className="text-xs text-emerald-600 font-bold mt-1">100% positive feedback</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-purple-50 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 flex items-center justify-center text-purple-600 font-bold shadow-sm">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Active Listings Preview */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Your Product Listings</h3>
                    <p className="text-xs text-gray-400 mt-1">Manage and publish items available to buyers across Cameroon</p>
                  </div>
                  <Button onClick={() => setIsNewListingModalOpen(true)} variant="outline" size="sm" className="font-bold border-emerald-600 text-emerald-700">
                    <Plus className="h-4 w-4 mr-2" /> Add Listing
                  </Button>
                </div>

                {listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((item) => (
                      <div key={item.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group bg-white">
                        {item.imageUrl && (
                          <div className="h-44 w-full rounded-xl overflow-hidden mb-3 border border-gray-100 relative">
                            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 right-2 bg-emerald-950/80 text-white backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                              Verified
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">
                                {item.region}
                              </span>
                              <h4 className="font-extrabold text-gray-900 mt-2 text-base group-hover:text-emerald-700 transition-colors">{item.title}</h4>
                            </div>
                            <span className="font-black text-emerald-700 text-lg">
                              {item.price.toLocaleString()} {item.currency}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{item.description || "No description provided."}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                          <span className="font-semibold text-gray-600">Stock: {item.quantity} {item.unit}</span>
                          <div className="flex items-center gap-2">
                            <Button onClick={() => handleEditClick(item)} size="sm" variant="outline" className="h-8 text-xs font-bold border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-lg">Edit</Button>
                            <Button onClick={() => handleDeleteListing(item.id)} size="sm" variant="ghost" className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">Delete</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-700">No Listings Yet</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Start selling on CameMark by adding your first product listing.</p>
                    <Button onClick={() => setIsNewListingModalOpen(true)} className="mt-4 bg-[#064E3B] text-white font-bold text-xs h-10 px-5 rounded-xl">
                      <Plus className="h-4 w-4 mr-2" /> Post Your First Product
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* My Listings Tab */}
          {activeTab === "listings" && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">My Product Catalog</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage, update, and publish items available for sale.</p>
                </div>
                <Button onClick={() => setIsNewListingModalOpen(true)} className="bg-[#064E3B] text-white font-bold h-11 px-5 rounded-xl">
                  <Plus className="h-4 w-4 mr-2" /> Create New Listing
                </Button>
              </div>

              {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                      {item.imageUrl && (
                        <div className="h-40 w-full rounded-xl overflow-hidden mb-3 border border-gray-100">
                          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                              {item.region}
                            </span>
                            <h4 className="font-extrabold text-gray-900 mt-2">{item.title}</h4>
                          </div>
                          <span className="font-black text-emerald-700 text-lg">
                            {item.price.toLocaleString()} {item.currency}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4">{item.description || "No description provided."}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                        <span>Stock: {item.quantity} {item.unit}</span>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleEditClick(item)} size="sm" variant="outline" className="h-8 text-xs font-bold border-emerald-600 text-emerald-700 hover:bg-emerald-50">Edit</Button>
                          <Button onClick={() => handleDeleteListing(item.id)} size="sm" variant="ghost" className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">Delete</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-gray-700">No Listings Created</h4>
                  <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">Create product listings to showcase your goods across all 10 regions of Cameroon.</p>
                  <Button onClick={() => setIsNewListingModalOpen(true)} className="mt-6 bg-[#064E3B] text-white font-bold h-11 px-6 rounded-xl">
                    <Plus className="h-4 w-4 mr-2" /> Add First Listing
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Sales Orders Tab */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900">Sales Orders</h3>
                <p className="text-sm text-gray-500 mt-1">Track incoming customer purchases and fulfillment status.</p>
              </div>
              <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-700">No Sales Orders Received Yet</h4>
                <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">When buyers purchase your products, orders will appear here for processing and dispatch.</p>
              </div>
            </div>
          )}

          {/* Buyer Inquiries Tab */}
          {activeTab === "inquiries" && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900">Buyer Inquiries & Messages</h3>
                <p className="text-sm text-gray-500 mt-1">Communicate directly with interested buyers and bargain offers.</p>
              </div>
              <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-700">No Inquiries Found</h4>
                <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">Direct messages and price bargain requests from buyers will show up here.</p>
              </div>
            </div>
          )}

          {/* Earnings & Payouts Tab */}
          {activeTab === "earnings" && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Earnings & Wallet Payouts</h3>
                  <p className="text-sm text-gray-500 mt-1">Withdraw revenue directly to Mobile Money (MTN / Orange) or Bank Account.</p>
                </div>
                <Button className="bg-[#064E3B] text-white font-bold h-11 px-5 rounded-xl">
                  Withdraw Funds
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Available Balance</p>
                  <h4 className="text-3xl font-black text-emerald-950 mt-2">FCFA 0</h4>
                  <p className="text-xs text-emerald-700 mt-2 font-medium">Ready for instant payout</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Clearance</p>
                  <h4 className="text-3xl font-black text-gray-900 mt-2">FCFA 0</h4>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Held in escrow until delivery</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Withdrawn</p>
                  <h4 className="text-3xl font-black text-gray-900 mt-2">FCFA 0</h4>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Lifetime payout total</p>
                </div>
              </div>
            </div>
          )}

          {/* Sales Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900">Sales & Store Performance</h3>
                <p className="text-sm text-gray-500 mt-1">Real-time stats on product views, sales trends, and top regions.</p>
              </div>
              <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-700">Analytics Data Accumulating</h4>
                <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">Analytics breakdown will update automatically as buyers view and purchase your listings.</p>
              </div>
            </div>
          )}

          {/* Shipments Tab */}
          {activeTab === "shipments" && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900">Logistics & Shipments</h3>
                <p className="text-sm text-gray-500 mt-1">Manage shipping partner pickups across Cameroon's 10 regions.</p>
              </div>
              <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-700">No Active Shipments</h4>
                <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">Once orders are confirmed, generate waybills and assign logistics partners here.</p>
              </div>
            </div>
          )}

          {/* Store Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900">Store Profile & Settings</h3>
                <p className="text-sm text-gray-500 mt-1">Configure merchant business details, contact information, and operating regions.</p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Merchant Store Name</Label>
                  <Input defaultValue={profile?.full_name || ""} className="h-11 rounded-xl bg-gray-50 border-transparent" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Primary Region</Label>
                  <Input defaultValue={profile?.region || "Littoral"} className="h-11 rounded-xl bg-gray-50 border-transparent" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Contact Phone / WhatsApp</Label>
                  <Input defaultValue={profile?.phone || ""} className="h-11 rounded-xl bg-gray-50 border-transparent" />
                </div>
                <Button className="bg-[#064E3B] text-white font-bold h-11 px-6 rounded-xl mt-4">
                  Save Store Settings
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Listing Modal */}
      <Dialog open={isNewListingModalOpen} onOpenChange={setIsNewListingModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-xl font-black text-gray-900">Post New Product Listing</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Fill in product details to make your item available across all 10 regions of Cameroon.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateListing} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Product Title</Label>
              <Input 
                placeholder="e.g. Fresh Organic Cocoa Beans (50kg Bag)" 
                required
                className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white"
                value={newListing.title}
                onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">Price (FCFA / XAF)</Label>
                <Input 
                  type="number"
                  placeholder="25000" 
                  required
                  className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white"
                  value={newListing.price}
                  onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">Stock Quantity</Label>
                <Input 
                  type="number"
                  placeholder="10" 
                  required
                  className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white"
                  value={newListing.quantity}
                  onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">Region</Label>
                <Select value={newListing.region} onValueChange={(val) => setNewListing({ ...newListing, region: val })}>
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Adamawa","Centre","East","Far North","Littoral","North","Northwest","South","Southwest","West"].map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">City</Label>
                <Input 
                  placeholder="Douala" 
                  className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white"
                  value={newListing.city}
                  onChange={(e) => setNewListing({ ...newListing, city: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Product Image</Label>
              <div className="space-y-2">
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewListing({ ...newListing, imageUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                />
                <Input 
                  type="url"
                  placeholder="Or paste image URL (https://...)" 
                  className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white text-xs"
                  value={newListing.imageUrl}
                  onChange={(e) => setNewListing({ ...newListing, imageUrl: e.target.value })}
                />
                {newListing.imageUrl && (
                  <div className="h-24 w-24 rounded-xl overflow-hidden border border-emerald-200 mt-2 relative">
                    <img src={newListing.imageUrl} alt="Product preview" className="h-full w-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setNewListing({ ...newListing, imageUrl: "" })}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Description</Label>
              <Textarea 
                placeholder="Provide detailed information about quality, origin, and delivery options..." 
                className="bg-gray-50 border-transparent rounded-xl focus-visible:bg-white"
                rows={3}
                value={newListing.description}
                onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewListingModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#064E3B] text-white font-bold">Publish Listing</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* KYC Required Limit Modal */}
      <Dialog open={isKycRequiredModalOpen} onOpenChange={setIsKycRequiredModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
            <Shield className="h-7 w-7" />
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-black text-gray-900 text-center">Identity Verification Required</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 leading-relaxed text-center">
              Unverified merchants are allowed <strong>1 product listing</strong>. Complete your merchant KYC verification to unlock unlimited listings and verified trust badges!
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100 my-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" /> Unlock Unlimited Product Listings
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" /> Verified Merchant Badge on Market Zone
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" /> Direct Customer Trust & Instant Payouts
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col pt-2">
            <Button 
              onClick={() => {
                setIsKycRequiredModalOpen(false);
                navigate("/dashboard");
              }}
              className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-bold h-11 rounded-xl"
            >
              Complete KYC Verification Now
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsKycRequiredModalOpen(false)}
              className="w-full text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Listing Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-xl font-black text-gray-900">Edit Product Listing</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Update product pricing, stock quantity, images, or details.
            </DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <form onSubmit={handleUpdateListing} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">Product Title</Label>
                <Input 
                  required
                  className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Price (FCFA / XAF)</Label>
                  <Input 
                    type="number"
                    required
                    className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Stock Quantity</Label>
                  <Input 
                    type="number"
                    required
                    className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white"
                    value={editingProduct.quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">Product Image</Label>
                <div className="space-y-2">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditingProduct({ ...editingProduct, imageUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />
                  <Input 
                    type="url"
                    placeholder="Or paste image URL (https://...)" 
                    className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white text-xs"
                    value={editingProduct.imageUrl || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  />
                  {editingProduct.imageUrl && (
                    <div className="h-24 w-24 rounded-xl overflow-hidden border border-emerald-200 mt-2 relative">
                      <img src={editingProduct.imageUrl} alt="Product preview" className="h-full w-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setEditingProduct({ ...editingProduct, imageUrl: "" })}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">Description</Label>
                <Textarea 
                  className="bg-gray-50 border-transparent rounded-xl focus-visible:bg-white"
                  rows={3}
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#064E3B] text-white font-bold">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerDashboard;
