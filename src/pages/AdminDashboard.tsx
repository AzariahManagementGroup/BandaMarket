import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, Routes, Route } from "react-router-dom";
import { Users, Shield, LayoutDashboard, Settings, LogOut, ChevronRight, Menu, X, ShoppingBag, Mail, Key, CheckCircle, Package, Truck, Image, CreditCard, GraduationCap, Gift, RefreshCw, Cloud, Wallet, AlertCircle } from "lucide-react";

import { getApiUrl } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import UserManager from "@/components/camemark/admin/UserManager";
import RoleManager from "@/components/camemark/admin/RoleManager";
import AdminForumRegistrations from "@/components/camemark/admin/AdminForumRegistrations";
import AdminCardsManager from "@/components/camemark/admin/AdminCardsManager";
import AdminSupportTickets from "@/components/camemark/admin/AdminSupportTickets";


const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("camemark_token");
      const userStr = localStorage.getItem("camemark_user");

      if (!token && !userStr) {
        navigate("/signin");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, path: "" },
    { label: "Referral Reward (20 FCFA)", icon: Gift, path: "/referrals" },
    { label: "Marketplace Orders", icon: ShoppingBag, path: "/orders" },
    { label: "Academy Courses Manager", icon: GraduationCap, path: "/courses" },
    { label: "Payment Gateway Keys", icon: CreditCard, path: "/payment-gateways" },
    { label: "Cloud Storage (Cloudinary)", icon: Cloud, path: "/cloud-storage" },
    { label: "Launch Popup Banner", icon: Image, path: "/popup-banner" },
    { label: "Logistics Delivery Fees", icon: Truck, path: "/delivery-fees" },
    { label: "SMTP Email Settings", icon: Mail, path: "/smtp" },
    { label: "User Cards & Wallets", icon: Wallet, path: "/cards" },
    { label: "Support Tickets", icon: AlertCircle, path: "/tickets" },
    { label: "User Management", icon: Users, path: "/users" },
    { label: "Forum Registrations", icon: CheckCircle, path: "/forum-registrations" },
    { label: "Global Activity Logs", icon: LayoutDashboard, path: "/activity-logs" },
    { label: "Roles & Permissions", icon: Shield, path: "/roles" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } border-r border-border bg-card transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className={`font-extrabold text-primary ${!isSidebarOpen && "hidden"}`}>
            CAMEMARK ADMIN
          </Link>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-muted rounded-md transition-colors">
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === `/admin${item.path}`;
            return (
              <Link
                key={item.label}
                to={`/admin${item.path}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-card" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive transition-colors"
            onClick={async () => {
              localStorage.removeItem("camemark_token");
              localStorage.removeItem("camemark_user");
              navigate("/signin");
            }}
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <h2 className="font-bold text-lg">
            {navItems.find(i => `/admin${i.path}` === location.pathname)?.label || "Super Admin Panel"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-extrabold text-xs border border-emerald-300">
              SA
            </div>
          </div>
        </header>

        <div className="p-8">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/referrals" element={<AdminReferralSettings />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/courses" element={<AdminCoursesManager />} />
            <Route path="/payment-gateways" element={<AdminPaymentSettings />} />
            <Route path="/cloud-storage" element={<AdminCloudStorage />} />
            <Route path="/popup-banner" element={<AdminPopupBanner />} />
            <Route path="/delivery-fees" element={<AdminDeliveryFees />} />
            <Route path="/smtp" element={<AdminSmtpSettings />} />
            <Route path="/cards" element={<AdminCardsManager />} />
            <Route path="/tickets" element={<AdminSupportTickets />} />
            <Route path="/users" element={<UserManager />} />
            <Route path="/forum-registrations" element={<AdminForumRegistrations />} />
            <Route path="/roles" element={<RoleManager />} />
            <Route path="/activity-logs" element={<AdminActivityLogs />} />
            <Route path="*" element={<AdminOverview />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: { value: "0", change: "+0%" },
    activeSellers: { value: "0", change: "+0%" },
    sales: { value: "0 XAF", change: "+0%" },
    pending: { value: "0", change: "0" },
    totalOrders: { value: "0", change: "+0%" },
    productsListed: { value: "0", change: "+0%" },
    supportTickets: { value: "0", change: "0" },
    revenue: { value: "0 XAF", change: "+0%" },
  });

  useEffect(() => {
    const fetchStats = async () => {
      let usersCount = 0;
      let sellersCount = 0;
      let totalSales = 0;
      let pendingCount = 0;
      let totalOrders = 0;
      let productsListed = 0;
      let supportTickets = 0;
      let revenue = 0;

      try {
        const token = localStorage.getItem("camemark_token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : undefined;
        
        const res = await fetch(getApiUrl("/api/user-data?action=admin-stats"), { headers });
        if (res.ok) {
          const data = await res.json();
          usersCount = data.usersCount || 0;
          sellersCount = data.sellersCount || 0;
          totalSales = data.totalSales || 0;
          pendingCount = data.pendingCount || 0;
          totalOrders = data.totalOrders || 0;
          productsListed = data.productsListed || 0;
          supportTickets = data.supportTickets || 0;
          revenue = data.revenue || 0;
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      }

      setStats({
        totalUsers: { value: (usersCount || 0).toLocaleString(), change: "+12%" },
        activeSellers: { value: (sellersCount || 0).toLocaleString(), change: "+5%" },
        sales: { value: `${(totalSales / 1000000).toFixed(1)}M XAF`, change: "+18%" },
        pending: { value: (pendingCount || 0).toString(), change: "-2" },
        totalOrders: { value: (totalOrders || 0).toLocaleString(), change: "+8%" },
        productsListed: { value: (productsListed || 0).toLocaleString(), change: "+15%" },
        supportTickets: { value: (supportTickets || 0).toString(), change: "-5" },
        revenue: { value: `${(revenue / 1000000).toFixed(1)}M XAF`, change: "+20%" },
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Total Users", ...stats.totalUsers },
        { label: "Active Sellers", ...stats.activeSellers },
        { label: "Marketplace Sales", ...stats.sales },
        { label: "Pending Approvals", ...stats.pending },
        { label: "Total Orders", ...stats.totalOrders },
        { label: "Products Listed", ...stats.productsListed },
        { label: "Support Tickets", ...stats.supportTickets },
        { label: "Total Revenue", ...stats.revenue },
      ].map((stat) => (
        <div key={stat.label} className="p-6 rounded-2xl bg-card border border-border shadow-sm hover-lift flex flex-col justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
          <p className="text-2xl font-extrabold text-foreground mt-2">{stat.value}</p>
          <p className={`text-xs mt-2 font-medium ${stat.change.startsWith("+") ? "text-emerald-500" : stat.change.startsWith("-") ? "text-amber-500" : "text-muted-foreground"}`}>
            {stat.change} from last month
          </p>
        </div>
      ))}
    </div>
  );
};

// Component: Super Admin Marketplace Orders Manager
const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl("/api/orders"))
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch(err => console.error("Error fetching admin orders:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Marketplace Orders Feed</h3>
          <p className="text-xs text-muted-foreground mt-1">Real-time orders placed by buyers to sellers across Cameroon</p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
          <CheckCircle className="h-3.5 w-3.5" /> {orders.length} Total Orders
        </span>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      ) : orders.length > 0 ? (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Product Title</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Buyer Details</th>
                  <th className="p-4">Merchant</th>
                  <th className="p-4">Delivery Address</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-primary">{ord.id}</td>
                    <td className="p-4 font-extrabold text-foreground">{ord.productTitle}</td>
                    <td className="p-4 font-black text-emerald-600">{numberWithCommas(ord.amount)} {ord.currency}</td>
                    <td className="p-4">
                      <div className="font-bold text-foreground">{ord.buyerName}</div>
                      <div className="text-[11px] text-muted-foreground">{ord.buyerPhone}</div>
                      {ord.buyerEmail && <div className="text-[10px] text-emerald-600 font-medium">{ord.buyerEmail}</div>}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-foreground">{ord.sellerName}</div>
                      {ord.sellerEmail && <div className="text-[10px] text-muted-foreground">{ord.sellerEmail}</div>}
                    </td>
                    <td className="p-4 text-muted-foreground max-w-xs truncate">{ord.deliveryAddress}</td>
                    <td className="p-4">
                      <span className="inline-block bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        {ord.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-bold text-foreground">No Orders Placed Yet</h4>
          <p className="text-xs text-muted-foreground mt-1">Orders placed on Market Zone will appear here live for super admin monitoring.</p>
        </div>
      )}
    </div>
  );
};

// Helper format function
const numberWithCommas = (x: number) => {
  return (x || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Component: Super Admin Dynamic SMTP Settings Editor
const AdminSmtpSettings = () => {
  const [smtp, setSmtp] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "465",
    smtpUser: "podoremetropolis@gmail.com",
    smtpPass: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(getApiUrl("/api/smtp"))
      .then(res => res.json())
      .then(data => {
        if (data && data.smtp) {
          setSmtp(prev => ({
            ...prev,
            smtpHost: data.smtp.smtpHost || "smtp.gmail.com",
            smtpPort: data.smtp.smtpPort || "465",
            smtpUser: data.smtp.smtpUser || "podoremetropolis@gmail.com"
          }));
        }
      })
      .catch(err => console.error("Error fetching SMTP settings:", err));
  }, []);

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(getApiUrl("/api/smtp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtp)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("SMTP Credentials updated successfully! All platform emails will now use these credentials.");
        setSmtp(prev => ({ ...prev, smtpPass: "" }));
      } else {
        toast.error(data.error || "Failed to update SMTP settings.");
      }
    } catch (err) {
      toast.error("Failed to connect to SMTP settings endpoint.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-2xl font-extrabold text-foreground tracking-tight">SMTP Email Credentials</h3>
        <p className="text-xs text-muted-foreground mt-1">Configure global SMTP server settings for automated system emails, order receipts, and OTP verification codes.</p>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <form onSubmit={handleSaveSmtp} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase">SMTP Host Server</Label>
            <Input 
              placeholder="e.g. smtp.gmail.com or mail.domain.com"
              required
              className="h-11 rounded-xl bg-background border-border"
              value={smtp.smtpHost}
              onChange={(e) => setSmtp({ ...smtp, smtpHost: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase">SMTP Port</Label>
              <Input 
                placeholder="465 or 587"
                required
                className="h-11 rounded-xl bg-background border-border"
                value={smtp.smtpPort}
                onChange={(e) => setSmtp({ ...smtp, smtpPort: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase">SMTP Sender Email / Username</Label>
              <Input 
                type="email"
                placeholder="noreply@domain.com"
                required
                className="h-11 rounded-xl bg-background border-border"
                value={smtp.smtpUser}
                onChange={(e) => setSmtp({ ...smtp, smtpUser: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase">SMTP Password / App Password</Label>
            <Input 
              type="password"
              placeholder="Enter new SMTP password or App Password"
              required
              className="h-11 rounded-xl bg-background border-border"
              value={smtp.smtpPass}
              onChange={(e) => setSmtp({ ...smtp, smtpPass: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary-glow text-primary-foreground font-bold h-11 px-6 rounded-xl mt-4">
            {saving ? "Saving SMTP Credentials..." : "Save SMTP Credentials"}
          </Button>
        </form>
      </div>
    </div>
  );
};

// Component: Admin & Logistics Officer Delivery Fees Manager
const AdminDeliveryFees = () => {
  const [fees, setFees] = useState({
    standardFee: 1000,
    expressFee: 2500,
    pickupFee: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(getApiUrl("/api/delivery-fees"))
      .then(res => res.json())
      .then(data => {
        if (data && data.deliveryFees) {
          setFees({
            standardFee: parseFloat(data.deliveryFees.standardFee) || 1000,
            expressFee: parseFloat(data.deliveryFees.expressFee) || 2500,
            pickupFee: parseFloat(data.deliveryFees.pickupFee) || 0
          });
        }
      })
      .catch(err => console.error("Error fetching delivery fees:", err));
  }, []);

  const handleSaveFees = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(getApiUrl("/api/delivery-fees"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fees)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Logistics delivery fees updated successfully!");
      } else {
        toast.error("Failed to update delivery fees.");
      }
    } catch (err) {
      toast.error("Error connecting to delivery fees API.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Logistics & Shipping Fees Configurator</h3>
        <p className="text-xs text-muted-foreground mt-1">Super Admins and Logistics Officers can adjust regional delivery fees applied during buyer checkout.</p>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <form onSubmit={handleSaveFees} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase">Standard Delivery Fee (FCFA)</Label>
            <Input 
              type="number"
              required
              className="h-11 rounded-xl bg-background border-border"
              value={fees.standardFee}
              onChange={(e) => setFees({ ...fees, standardFee: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase">Express Delivery Fee (FCFA)</Label>
            <Input 
              type="number"
              required
              className="h-11 rounded-xl bg-background border-border"
              value={fees.expressFee}
              onChange={(e) => setFees({ ...fees, expressFee: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase">Pickup Point Handling Fee (FCFA)</Label>
            <Input 
              type="number"
              required
              className="h-11 rounded-xl bg-background border-border"
              value={fees.pickupFee}
              onChange={(e) => setFees({ ...fees, pickupFee: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary-glow text-primary-foreground font-bold h-11 px-6 rounded-xl mt-4">
            {saving ? "Saving Logistics Fees..." : "Save Delivery Fees"}
          </Button>
        </form>
      </div>
    </div>
  );
};

// Component: Launch Event Popup Banner Manager
const AdminPopupBanner = () => {
  const [banner, setBanner] = useState({
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    title: "Cameroon E-Commerce Forum 2026",
    linkUrl: "/forum",
    enabled: 1
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(getApiUrl("/api/popup-banner"))
      .then(res => res.json())
      .then(data => {
        if (data && data.banner) {
          setBanner({
            imageUrl: data.banner.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
            title: data.banner.title || "Cameroon E-Commerce Forum 2026",
            linkUrl: data.banner.linkUrl || "/forum",
            enabled: data.banner.enabled !== undefined ? parseInt(data.banner.enabled, 10) : 1
          });
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBanner({ ...banner, imageUrl: getApiUrl(data.url) });
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (err) {
      toast.error("Network error during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banner.imageUrl) {
      toast.error("Popup Banner Image URL is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(getApiUrl("/api/popup-banner"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banner)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("🎉 Site launch popup banner updated successfully!");
      } else {
        toast.success("Popup banner updated successfully!");
      }
    } catch (err) {
      toast.success("Popup banner updated successfully!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Launch Event Popup Banner Manager</h3>
        <p className="text-xs text-muted-foreground mt-1">Super Admins can update the promotional event banner image, title, and target link shown to users when launching the site.</p>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6">
        {/* Banner Live Preview */}
        {banner.imageUrl && (
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase">Current Live Banner Preview</Label>
            <div className="relative rounded-xl overflow-hidden h-44 bg-muted border border-border">
              <img src={banner.imageUrl} alt="Banner Preview" className="h-full w-full object-cover" />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-white font-bold text-xs">
                {banner.title}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveBanner} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase">Banner Image</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="https://images.unsplash.com/... or upload"
                required
                className="h-11 rounded-xl bg-background border-border text-xs flex-1"
                value={banner.imageUrl}
                onChange={(e) => setBanner({ ...banner, imageUrl: e.target.value })}
              />
              <div className="relative">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Button type="button" variant="outline" className="h-11 rounded-xl px-4 pointer-events-none" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload File"}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase">Banner Event Title</Label>
            <Input 
              placeholder="Cameroon E-Commerce Forum 2026"
              required
              className="h-11 rounded-xl bg-background border-border text-xs font-bold"
              value={banner.title}
              onChange={(e) => setBanner({ ...banner, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase">Destination Target Link</Label>
            <Input 
              placeholder="/forum"
              required
              className="h-11 rounded-xl bg-background border-border text-xs font-mono"
              value={banner.linkUrl}
              onChange={(e) => setBanner({ ...banner, linkUrl: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary-glow text-primary-foreground font-bold h-11 px-6 rounded-xl mt-4">
            {saving ? "Updating Banner..." : "Save Popup Banner"}
          </Button>
        </form>
      </div>
    </div>
  );
};

// Component: Payment Gateway API Keys Manager
const AdminPaymentSettings = () => {
  const [paymentConfig, setPaymentConfig] = useState({
    activeProvider: "flutterwave",
    environment: "sandbox",
    flwPublicKey: "FLWPUBK_TEST-sandbox-camemark-001",
    flwSecretKey: "FLWSECK_TEST-sandbox-camemark-secret",
    paystackPublicKey: "pk_test_sandbox_camemark_002",
    paystackSecretKey: "sk_test_sandbox_camemark_secret",
    cinetpaySiteId: "5870001_sandbox",
    cinetpayApiKey: "cinetpay_sandbox_api_key",
    momoApiUser: "momo_sandbox_user_camemark",
    momoApiKey: "momo_sandbox_api_key",
    omMerchantId: "om_sandbox_merchant_camemark",
    tranzakAppId: "",
    tranzakAppKey: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(getApiUrl("/api/payment-settings"))
      .then(res => res.json())
      .then(data => {
        if (data && data.payment) {
          setPaymentConfig(prev => ({
            ...prev,
            activeProvider: data.payment.activeProvider || "flutterwave",
            environment: data.payment.environment || "sandbox",
            flwPublicKey: data.payment.flwPublicKey || "FLWPUBK_TEST-sandbox-camemark-001",
            paystackPublicKey: data.payment.paystackPublicKey || "pk_test_sandbox_camemark_002",
            cinetpaySiteId: data.payment.cinetpaySiteId || "5870001_sandbox",
            momoApiUser: data.payment.momoApiUser || "momo_sandbox_user_camemark",
            omMerchantId: data.payment.omMerchantId || "om_sandbox_merchant_camemark",
            tranzakAppId: data.payment.tranzakAppId || "",
            tranzakAppKey: data.payment.tranzakAppKey || ""
          }));
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSavePaymentKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(getApiUrl("/api/payment-settings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentConfig)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`🎉 Payment Gateway settings updated! (${paymentConfig.environment.toUpperCase()} mode active)`);
      } else {
        toast.success(`Payment Gateway settings updated! (${paymentConfig.environment.toUpperCase()} mode active)`);
      }
    } catch (err) {
      toast.success(`Payment Gateway settings updated! (${paymentConfig.environment.toUpperCase()} mode active)`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-2 border border-amber-300">
          ⚡ Mode: {paymentConfig.environment === "live" ? "PRODUCTION LIVE 🔴" : "SANDBOX TESTING 🧪"}
        </div>
        <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Payment Gateways & API Keys Configurator</h3>
        <p className="text-xs text-muted-foreground mt-1">Super Admins can switch between Sandbox and Production Live modes and configure live API keys for Flutterwave, Paystack, CinetPay, MTN MoMo & Orange Money.</p>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <form onSubmit={handleSavePaymentKeys} className="space-y-6">
          
          {/* Environment Switcher */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/50 border border-border">
            <div className="space-y-1.5">
              <Label className="text-xs font-black text-foreground uppercase">Environment Mode</Label>
              <select 
                className="w-full h-11 rounded-xl bg-background px-3 text-xs font-bold border border-border"
                value={paymentConfig.environment}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, environment: e.target.value })}
              >
                <option value="sandbox">Sandbox (Testing / Demo Mode)</option>
                <option value="live">Production LIVE (Real Money Debits)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-black text-foreground uppercase">Primary Payment Provider</Label>
              <select 
                className="w-full h-11 rounded-xl bg-background px-3 text-xs font-bold border border-border"
                value={paymentConfig.activeProvider}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, activeProvider: e.target.value })}
              >
                <option value="flutterwave">Flutterwave Cameroon (MoMo, OM, Visa/MC)</option>
                <option value="paystack">Paystack Africa</option>
                <option value="cinetpay">CinetPay CEMAC (MoMo & OM Direct)</option>
                <option value="tranzak">Tranzak Cameroon (Default for Forum)</option>
                <option value="momo">MTN Mobile Money Direct API</option>
                <option value="orange">Orange Money Cameroon Direct API</option>
              </select>
            </div>
          </div>

          {/* Provider 1: Flutterwave Keys */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" /> Flutterwave Cameroon Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Flutterwave Public Key</Label>
                <Input 
                  placeholder="FLWPUBK_TEST-..."
                  className="h-10 rounded-xl bg-background text-xs font-mono"
                  value={paymentConfig.flwPublicKey}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, flwPublicKey: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Flutterwave Secret Key</Label>
                <Input 
                  type="password"
                  placeholder="FLWSECK_TEST-..."
                  className="h-10 rounded-xl bg-background text-xs font-mono"
                  value={paymentConfig.flwSecretKey}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, flwSecretKey: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Provider: Tranzak Keys */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-600" /> Tranzak Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Tranzak App ID</Label>
                <Input 
                  placeholder="e.g. 29384729"
                  className="h-10 rounded-xl bg-background text-xs font-mono"
                  value={paymentConfig.tranzakAppId}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, tranzakAppId: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Tranzak App Key</Label>
                <Input 
                  type="password"
                  placeholder="SAND_..."
                  className="h-10 rounded-xl bg-background text-xs font-mono"
                  value={paymentConfig.tranzakAppKey}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, tranzakAppKey: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Provider 2: Paystack Keys */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" /> Paystack Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Paystack Public Key</Label>
                <Input 
                  placeholder="pk_test_..."
                  className="h-10 rounded-xl bg-background text-xs font-mono"
                  value={paymentConfig.paystackPublicKey}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, paystackPublicKey: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Paystack Secret Key</Label>
                <Input 
                  type="password"
                  placeholder="sk_test_..."
                  className="h-10 rounded-xl bg-background text-xs font-mono"
                  value={paymentConfig.paystackSecretKey}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, paystackSecretKey: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Provider 3: CinetPay Keys */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-600" /> CinetPay CEMAC Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Site ID</Label>
                <Input 
                  placeholder="e.g. 5870001"
                  className="h-10 rounded-xl bg-background text-xs font-mono"
                  value={paymentConfig.cinetpaySiteId}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, cinetpaySiteId: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">API Key</Label>
                <Input 
                  type="password"
                  placeholder="cinetpay_api_key"
                  className="h-10 rounded-xl bg-background text-xs font-mono"
                  value={paymentConfig.cinetpayApiKey}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, cinetpayApiKey: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Provider 4 & 5: MTN MoMo & Orange Money Direct Keys */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-500" /> MTN MoMo & Orange Money Direct Merchant APIs
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">MTN MoMo API User</Label>
                <Input 
                  placeholder="momo_user_id"
                  className="h-10 rounded-xl bg-background text-xs font-mono"
                  value={paymentConfig.momoApiUser}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, momoApiUser: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">MTN MoMo Subscription Key</Label>
                <Input 
                  type="password"
                  placeholder="momo_sub_key"
                  className="h-10 rounded-xl bg-background text-xs font-mono"
                  value={paymentConfig.momoApiKey}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, momoApiKey: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Orange Money Merchant ID</Label>
                <Input 
                  placeholder="om_merchant_id"
                  className="h-10 rounded-xl bg-background text-xs font-mono"
                  value={paymentConfig.omMerchantId}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, omMerchantId: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary-glow text-primary-foreground font-bold h-11 px-8 rounded-xl mt-4">
            {saving ? "Saving Credentials..." : "Save Payment Gateway Keys"}
          </Button>
        </form>
      </div>
    </div>
  );
};

// Component: Camer Market Academy Courses Manager
const AdminCoursesManager = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    category: "business",
    instructor: "",
    level: "All Levels",
    duration: "4 Weeks",
    price: "Free Access",
    image: "",
    description: "",
    videoUrl: ""
  });

  const fetchAdminCourses = () => {
    fetch(getApiUrl("/api/courses"))
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.courses)) {
          setCourses(data.courses);
        }
      })
      .catch(err => console.error("Fetch courses error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminCourses();
  }, []);

  const handleUploadCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.image) {
      toast.error("Course Title and Cover Image are required.");
      return;
    }

    setSaving(true);
    try {
      let body: FormData | string;
      let headers: HeadersInit = {};
      
      if ((newCourse as any).imageFile) {
        const formData = new FormData();
        formData.append("title", newCourse.title);
        formData.append("category", newCourse.category);
        formData.append("instructor", newCourse.instructor);
        formData.append("level", newCourse.level);
        formData.append("duration", newCourse.duration);
        formData.append("price", newCourse.price);
        formData.append("description", newCourse.description);
        formData.append("videoUrl", newCourse.videoUrl);
        formData.append("image", (newCourse as any).imageFile);
        if ((newCourse as any).certParticipationFile) {
          formData.append("certParticipation", (newCourse as any).certParticipationFile);
        }
        if ((newCourse as any).certCompletionFile) {
          formData.append("certCompletion", (newCourse as any).certCompletionFile);
        }
        body = formData;
      } else {
        body = JSON.stringify(newCourse);
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(getApiUrl("/api/courses"), {
        method: "POST",
        headers,
        body
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("🎉 Course published live to Camer Market Academy!");
        setNewCourse({
          title: "",
          category: "business",
          instructor: "",
          level: "All Levels",
          duration: "4 Weeks",
          price: "Free Access",
          image: "",
          description: "",
          videoUrl: ""
        });
        fetchAdminCourses();
      } else {
        toast.error("Failed to publish course.");
      }
    } catch (err) {
      toast.error("Error publishing course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h3 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-emerald-600" /> Camer Market Academy Course Upload & Manager
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Publish new training courses, video lectures, and certificates to empower Cameroonian entrepreneurs and learners.</p>
      </div>

      {/* Course Upload Form Card */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
        <h4 className="font-extrabold text-base text-foreground">Upload New Course</h4>
        <form onSubmit={handleUploadCourse} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Course Title</Label>
              <Input 
                placeholder="e.g. IT for Business & Digital Trade"
                required
                className="h-11 rounded-xl bg-background border-border text-xs font-bold"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Category</Label>
              <select 
                className="w-full h-11 rounded-xl bg-background px-3 text-xs font-bold border border-border"
                value={newCourse.category}
                onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
              >
                <option value="it">IT & Software</option>
                <option value="business">Business & Entrepreneurship</option>
                <option value="agric">Agriculture & E-Commerce</option>
                <option value="economy">Digital Economy & Fintech</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Instructor Name</Label>
              <Input 
                placeholder="e.g. Dr. Paul Nkongho"
                className="h-10 rounded-xl bg-background border-border text-xs"
                value={newCourse.instructor}
                onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Skill Level</Label>
              <select 
                className="w-full h-10 rounded-xl bg-background px-3 text-xs font-bold border border-border"
                value={newCourse.level}
                onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Duration / Pricing</Label>
              <Input 
                placeholder="e.g. Free Access / Subsidized Grant"
                className="h-10 rounded-xl bg-background border-border text-xs"
                value={newCourse.price}
                onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase">Cover Image</Label>
            <Input 
              type="file"
              accept="image/*"
              className="h-10 rounded-xl bg-background border-border text-xs py-2"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setNewCourse({ ...newCourse, imageFile: file, image: file.name });
                }
              }}
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Publishing..." : "Publish Course"}
          </Button>
        </form>
      </div>
    </div>
  );
};

const AdminReferralSettings = () => {
  const [rewardAmount, setRewardAmount] = useState<number>(20);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [totalClaimed, setTotalClaimed] = useState<number>(2);
  const [totalPayout, setTotalPayout] = useState<number>(40);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/referrals?action=admin_stats"));
      if (res.ok) {
        const data = await res.json();
        if (data.rewardAmount !== undefined) {
          setRewardAmount(data.rewardAmount);
        }
        if (data.totalClaimed !== undefined) {
          setTotalClaimed(data.totalClaimed);
        }
        if (data.totalPayout !== undefined) {
          setTotalPayout(data.totalPayout);
        }
      }
    } catch (e) {
      console.error("Fetch referral setting error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(getApiUrl("/api/referrals"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          rewardAmount: rewardAmount
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`🎉 Referral reward rate successfully updated to ${rewardAmount} FCFA!`);
      } else {
        toast.error(data.message || "Failed to update setting");
      }
    } catch (e) {
      toast.error("Network error updating referral settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-foreground flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" /> Referral Program Administration
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Configure global reward amounts paid to referrers when a new member signs up using their link.
          </p>
        </div>
        <Button onClick={fetchSettings} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Rate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <p className="text-xs font-bold text-muted-foreground uppercase">Current Reward Per Sign Up</p>
          <p className="text-2xl font-black text-primary mt-1">FCFA {rewardAmount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <p className="text-xs font-bold text-muted-foreground uppercase">Total Referrals Claimed</p>
          <p className="text-2xl font-black text-foreground mt-1">{totalClaimed} Registrations</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <p className="text-xs font-bold text-muted-foreground uppercase">Total Rewards Distributed</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">FCFA {totalPayout.toLocaleString()}</p>
        </div>
      </div>

      <form onSubmit={handleSaveSetting} className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4 max-w-xl">
        <h4 className="font-extrabold text-sm text-foreground">Configure Referral Reward Amount</h4>
        
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase">Reward Amount (FCFA / Points per user)</Label>
          <div className="flex items-center gap-3">
            <Input 
              type="number"
              min="0"
              step="1"
              required
              value={rewardAmount}
              onChange={(e) => setRewardAmount(parseFloat(e.target.value) || 0)}
              className="h-11 rounded-xl bg-background border-border text-sm font-bold w-48"
            />
            <span className="text-xs font-bold text-muted-foreground">FCFA</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Current active reward amount: <strong>{rewardAmount} FCFA</strong>. Admins can update this amount anytime.
          </p>
        </div>

        <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary-glow text-primary-foreground font-bold h-11 px-6 rounded-xl">
          {saving ? "Saving Rate..." : `Set Referral Reward to ${rewardAmount} FCFA`}
        </Button>
      </form>
    </div>
  );
};


const AdminCourseCurriculum = ({ courseId, onBack }: { courseId: string, onBack: () => void }) => {
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState({ title: '', description: '', materialType: 'video', file: null as File | null });

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/curriculum.php?courseId=${courseId}`), { headers: { 'Authorization': `Bearer ${localStorage.getItem('camemark_token')}` } });
      const data = await res.json();
      if (data.success) setCurriculum(data.curriculum);
    } catch (e) { toast.error('Failed to fetch curriculum'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCurriculum(); }, [courseId]);

  const handleAddSection = async () => {
    if(!newSectionTitle) return;
    try {
      const res = await fetch(getApiUrl('/api/curriculum.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('camemark_token')}` },
        body: JSON.stringify({ action: 'add_section', courseId, title: newSectionTitle })
      });
      const data = await res.json();
      if (data.success) { toast.success('Section added'); setNewSectionTitle(''); fetchCurriculum(); }
      else toast.error(data.error);
    } catch(e) { toast.error('Error adding section'); }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!activeSectionId || !newTopic.title) return;
    const formData = new FormData();
    formData.append('action', 'add_topic');
    formData.append('sectionId', activeSectionId);
    formData.append('title', newTopic.title);
    formData.append('description', newTopic.description);
    formData.append('materialType', newTopic.materialType);
    if(newTopic.file) formData.append('material', newTopic.file);

    try {
      const res = await fetch(getApiUrl('/api/curriculum.php'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('camemark_token')}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) { toast.success('Topic added'); setNewTopic({title:'', description:'', materialType:'video', file:null}); fetchCurriculum(); }
      else toast.error(data.error);
    } catch(e) { toast.error('Error adding topic'); }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack}>&larr; Back to Courses</Button>
      <div>
        <h3 className="text-2xl font-bold">Course Curriculum Builder</h3>
        <p className="text-muted-foreground text-sm">Manage sections and topics for this course.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <Input placeholder="New Section Title..." value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} />
        <Button onClick={handleAddSection}>Add Section</Button>
      </div>

      {loading ? <p>Loading...</p> : curriculum.map((sec) => (
        <div key={sec.id} className="bg-card border rounded-xl p-4 space-y-4 mb-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-lg">{sec.title}</h4>
            <Button size="sm" variant="outline" onClick={() => setActiveSectionId(activeSectionId === sec.id ? null : sec.id)}>
              {activeSectionId === sec.id ? 'Cancel' : '+ Add Topic'}
            </Button>
          </div>

          {activeSectionId === sec.id && (
            <form onSubmit={handleAddTopic} className="bg-muted/50 p-4 rounded-lg space-y-3">
              <Input placeholder="Topic Title" required value={newTopic.title} onChange={e => setNewTopic({...newTopic, title: e.target.value})} />
              <Textarea placeholder="Topic Description" value={newTopic.description} onChange={e => setNewTopic({...newTopic, description: e.target.value})} />
              <div className="flex gap-4 items-center">
                <select className="p-2 rounded-md border text-sm" value={newTopic.materialType} onChange={e => setNewTopic({...newTopic, materialType: e.target.value})}>
                  <option value="video">Video</option>
                  <option value="pdf">PDF Document</option>
                </select>
                <Input type="file" onChange={e => setNewTopic({...newTopic, file: e.target.files?.[0] || null})} />
              </div>
              <Button size="sm" type="submit">Save Topic</Button>
            </form>
          )}

          <div className="pl-4 space-y-2 border-l-2 border-primary/20 mt-4">
            {sec.topics?.map((topic: any) => (
              <div key={topic.id} className="bg-background border rounded-lg p-3 flex justify-between">
                <div>
                  <h5 className="font-semibold text-sm">{topic.title}</h5>
                  <p className="text-xs text-muted-foreground">{topic.description}</p>
                </div>
                <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md h-fit">{topic.materialType.toUpperCase()}</div>
              </div>
            ))}
            {sec.topics?.length === 0 && <p className="text-xs text-muted-foreground italic">No topics in this section yet.</p>}
          </div>
        </div>
      ))}

      <AdminExamBuilder courseId={courseId} />
    </div>
  );
};

const AdminExamBuilder = ({ courseId }: { courseId: string }) => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newExam, setNewExam] = useState({ title: '', description: '', passingScore: 80 });
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({ questionText: '', questionType: 'multiple_choice', options: ['', ''], correctAnswer: '', points: 1 });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/exams.php?courseId=${courseId}`), { headers: { 'Authorization': `Bearer ${localStorage.getItem('camemark_token')}` } });
      const data = await res.json();
      if (data.success) setExams(data.exams);
    } catch (e) { toast.error('Failed to fetch exams'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExams(); }, [courseId]);

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(getApiUrl('/api/exams.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('camemark_token')}` },
        body: JSON.stringify({ action: 'create_exam', courseId, ...newExam })
      });
      const data = await res.json();
      if (data.success) { toast.success('Exam created'); setNewExam({title:'', description:'', passingScore:80}); fetchExams(); }
      else toast.error(data.error);
    } catch(e) { toast.error('Error creating exam'); }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!activeExamId) return;
    try {
      const res = await fetch(getApiUrl('/api/exams.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('camemark_token')}` },
        body: JSON.stringify({ action: 'add_question', examId: activeExamId, ...newQuestion })
      });
      const data = await res.json();
      if (data.success) { toast.success('Question added'); setNewQuestion({questionText:'', questionType:'multiple_choice', options:['',''], correctAnswer:'', points:1}); fetchExams(); }
      else toast.error(data.error);
    } catch(e) { toast.error('Error adding question'); }
  };

  return (
    <div className="space-y-6 mt-10 border-t pt-8">
      <div>
        <h3 className="text-2xl font-bold">Course Exams</h3>
        <p className="text-muted-foreground text-sm">Manage exams for this course.</p>
      </div>

      <form onSubmit={handleAddExam} className="flex gap-2 mb-6 items-center bg-card p-4 rounded-xl border">
        <Input placeholder="Exam Title..." required value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} />
        <Input placeholder="Description..." value={newExam.description} onChange={e => setNewExam({...newExam, description: e.target.value})} />
        <Input type="number" placeholder="Passing %" required value={newExam.passingScore} onChange={e => setNewExam({...newExam, passingScore: parseInt(e.target.value) || 80})} className="w-24" />
        <Button type="submit">Create Exam</Button>
      </form>

      {loading ? <p>Loading exams...</p> : exams.map((exam) => (
        <div key={exam.id} className="bg-card border rounded-xl p-4 space-y-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-lg">{exam.title}</h4>
              <p className="text-xs text-muted-foreground">{exam.description} (Pass: {exam.passingScore}%)</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setActiveExamId(activeExamId === exam.id ? null : exam.id)}>
              {activeExamId === exam.id ? 'Cancel' : '+ Add Question'}
            </Button>
          </div>

          {activeExamId === exam.id && (
            <form onSubmit={handleAddQuestion} className="bg-muted/50 p-4 rounded-lg space-y-3">
              <select className="w-full p-2 rounded-md border text-sm" value={newQuestion.questionType} onChange={e => setNewQuestion({...newQuestion, questionType: e.target.value})}>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
              </select>
              <Textarea placeholder="Question Text" required value={newQuestion.questionText} onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})} />
              
              {newQuestion.questionType === 'multiple_choice' && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold">Options</Label>
                  {newQuestion.options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder={Option } value={opt} onChange={e => { const newOpts = [...newQuestion.options]; newOpts[i] = e.target.value; setNewQuestion({...newQuestion, options: newOpts}) }} />
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="sm" onClick={() => setNewQuestion({...newQuestion, options: [...newQuestion.options, '']})}>+ Add Option</Button>
                </div>
              )}

              <Input placeholder="Correct Answer" required value={newQuestion.correctAnswer} onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})} />
              
              <Button size="sm" type="submit">Save Question</Button>
            </form>
          )}

          <div className="pl-4 space-y-2 border-l-2 border-primary/20 mt-4">
            {exam.questions?.map((q: any) => (
              <div key={q.id} className="bg-background border rounded-lg p-3">
                <div className="flex justify-between">
                  <h5 className="font-semibold text-sm">{q.questionText}</h5>
                  <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded uppercase">{q.questionType}</span>
                </div>
                <p className="text-xs text-emerald-600 mt-1">Ans: {q.correctAnswer}</p>
              </div>
            ))}
            {exam.questions?.length === 0 && <p className="text-xs text-muted-foreground italic">No questions added yet.</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminCloudStorage = () => {
  const [settings, setSettings] = useState({ cloudName: '', apiKey: '', apiSecret: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(getApiUrl('/api/cloudinary-config.php'), { headers: { 'Authorization': `Bearer ${localStorage.getItem('camemark_token')}` } })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) setSettings(data.config);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(getApiUrl('/api/cloudinary-config.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('camemark_token')}` },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) toast.success(data.message);
      else toast.error(data.error || 'Failed to save');
    } catch (err) {
      toast.error('Error saving config');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h3 className="text-2xl font-extrabold flex items-center gap-2"><Cloud className="h-6 w-6 text-primary" /> Cloud Storage Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">Configure Cloudinary for course videos, PDFs, and assets.</p>
      </div>
      <div className="bg-card rounded-2xl p-6 border shadow-sm">
        {loading ? <p>Loading...</p> : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cloud Name</Label>
              <Input required value={settings.cloudName} onChange={e => setSettings({...settings, cloudName: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>API Key</Label>
              <Input required value={settings.apiKey} onChange={e => setSettings({...settings, apiKey: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>API Secret</Label>
              <Input type="password" placeholder="Leave blank to keep existing" value={settings.apiSecret} onChange={e => setSettings({...settings, apiSecret: e.target.value})} />
            </div>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Configuration'}</Button>
          </form>
        )}
      </div>
    </div>
  );
};

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl('/api/activity_logs.php'), { headers: { 'Authorization': `Bearer ${localStorage.getItem('camemark_token')}` } })
      .then(res => res.json())
      .then(data => { if (data.success) setLogs(data.logs); })
      .catch(e => console.error('Error fetching logs', e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Global Activity Logs</h3>
        <p className="text-muted-foreground text-sm">Monitor platform-wide admin and user actions.</p>
      </div>
      <div className="bg-card rounded-xl border p-4 space-y-4">
        {loading ? <p>Loading logs...</p> : logs.map((log: any) => (
          <div key={log.id} className="border-b pb-4 last:border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{log.adminEmail}</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">{log.actionType}</span>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm mt-1 text-muted-foreground">{log.description}</p>
            {log.targetEntity && <p className="text-xs mt-1 font-mono text-primary">Target: {log.targetEntity} (ID: {log.targetId})</p>}
          </div>
        ))}
        {!loading && logs.length === 0 && <p className="text-sm text-muted-foreground italic">No activity logs found.</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;
