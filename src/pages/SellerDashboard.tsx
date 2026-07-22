import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    city: "Douala"
  });

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
      setProfile({
        ...user,
        full_name: user.fullName || user.full_name || user.email?.split('@')[0],
        signup_role: user.role || user.signup_role || 'seller',
        avatar_url: user.avatarUrl || user.avatar_url
      });
      if (user.wallet) setWallet(user.wallet);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.title || !newListing.price) {
      toast.error("Please provide title and price");
      return;
    }

    const created = {
      id: "lst-" + Date.now(),
      title: newListing.title,
      description: newListing.description,
      price: parseFloat(newListing.price),
      currency: "XAF",
      quantity: parseInt(newListing.quantity),
      unit: newListing.unit,
      region: newListing.region,
      city: newListing.city,
      status: "active",
      createdAt: new Date().toISOString()
    };

    setListings([created, ...listings]);
    setIsNewListingModalOpen(false);
    setNewListing({
      title: "",
      description: "",
      price: "",
      quantity: "1",
      unit: "pcs",
      category: "Agriculture & Produce",
      region: "Littoral",
      city: "Douala"
    });
    toast.success("New product listing published successfully!");
  };

  const navItems = [
    { icon: Store, label: "Seller Dashboard", active: true, href: "/seller-dashboard" },
    { icon: LayoutDashboard, label: "Switch to Buyer View", href: "/dashboard", highlight: true },
    ...(profile?.role === "admin" || profile?.signup_role === "admin" ? [
      { icon: Shield, label: "Admin Panel", href: "/admin", special: true }
    ] : []),
    { icon: Package, label: "My Listings", href: "#" },
    { icon: ShoppingBag, label: "Sales Orders", href: "#" },
    { icon: MessageCircle, label: "Buyer Inquiries", href: "#" },
    { icon: Wallet, label: "Earnings & Payouts", href: "#" },
    { icon: BarChart3, label: "Sales Analytics", href: "#" },
    { icon: Truck, label: "Shipments", href: "#" },
    { icon: Settings, label: "Store Settings", href: "#" },
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
              onClick={() => item.href !== "#" && navigate(item.href)}
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
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
              <Input 
                placeholder="Search products, orders, inventory..." 
                className="pl-12 bg-gray-50 border-transparent rounded-xl h-11 focus-visible:ring-emerald-500 focus-visible:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl h-10 px-4"
            >
              <ArrowLeftRight className="h-4 w-4" /> Switch to Buyer
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 pl-4 border-l border-gray-100 focus:outline-none">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{profile?.full_name || "Merchant"}</p>
                  <p className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified Merchant</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-100 overflow-hidden border-2 border-white shadow-sm">
                  <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || "Merchant"}`} alt="User avatar" />
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="flex items-center gap-2 cursor-pointer font-bold text-emerald-700">
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
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 custom-scrollbar">
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#064E3B] to-emerald-800 rounded-3xl p-8 text-white shadow-xl shadow-emerald-900/10">
            <div>
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                Merchant Portal 🏪
              </span>
              <h2 className="text-3xl font-extrabold">Welcome back, {profile?.full_name?.split(" ")[0] || "Seller"}!</h2>
              <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                Manage your store listings, review buyer inquiries, and track sales revenue across all 10 regions.
              </p>
            </div>
            <Button 
              onClick={() => setIsNewListingModalOpen(true)}
              className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold h-12 px-6 rounded-xl shrink-0 shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" /> Add New Listing
            </Button>
          </div>

          {/* Merchant Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-2xl border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales Revenue</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-2">FCFA 0</h3>
                  <p className="text-xs text-emerald-600 font-bold mt-1">Ready for payout</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Listings</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-2">{listings.length}</h3>
                  <p className="text-xs text-gray-400 mt-1">Live in Market Zone</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Orders</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-2">0</h3>
                  <p className="text-xs text-amber-600 font-bold mt-1">Awaiting dispatch</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Rating</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-2">5.0 ★</h3>
                  <p className="text-xs text-emerald-600 font-bold mt-1">100% positive feedback</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Active Listings Section */}
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
                  <div key={item.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
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
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                      <span>Stock: {item.quantity} {item.unit}</span>
                      <span className="text-emerald-600 font-bold">Active</span>
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
        </main>
      </div>

      {/* New Listing Modal */}
      <Dialog open={isNewListingModalOpen} onOpenChange={setIsNewListingModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-6">
          <DialogHeader>
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
    </div>
  );
};

export default SellerDashboard;
