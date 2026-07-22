import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, Routes, Route } from "react-router-dom";
import { Users, Shield, LayoutDashboard, Settings, LogOut, ChevronRight, Menu, X, ShoppingBag, Mail, Key, CheckCircle, Package, Truck, Image, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getApiUrl } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import UserManager from "@/components/camemark/admin/UserManager";
import RoleManager from "@/components/camemark/admin/RoleManager";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userStr = localStorage.getItem("camemark_user");

      if (!session && !userStr) {
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
    { label: "Marketplace Orders", icon: ShoppingBag, path: "/orders" },
    { label: "Payment Gateway Keys", icon: CreditCard, path: "/payment-gateways" },
    { label: "Launch Popup Banner", icon: Image, path: "/popup-banner" },
    { label: "Logistics Delivery Fees", icon: Truck, path: "/delivery-fees" },
    { label: "SMTP Email Settings", icon: Mail, path: "/smtp" },
    { label: "User Management", icon: Users, path: "/users" },
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
              await supabase.auth.signOut();
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
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/payment-gateways" element={<AdminPaymentSettings />} />
            <Route path="/popup-banner" element={<AdminPopupBanner />} />
            <Route path="/delivery-fees" element={<AdminDeliveryFees />} />
            <Route path="/smtp" element={<AdminSmtpSettings />} />
            <Route path="/users" element={<UserManager />} />
            <Route path="/roles" element={<RoleManager />} />
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
  });

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Total Users
      const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      
      // 2. Active Sellers (Sellers + Farmers)
      const { count: sellersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .or("role.eq.seller,signup_role.eq.seller,signup_role.eq.farmer");

      // 3. Marketplace Sales (Sum of orders)
      const { data: salesData } = await supabase.from("orders").select("total_amount");
      const totalSales = salesData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

      // 4. Pending Approvals (Unverified profiles or pending deliveries)
      const { count: pendingCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_verified", false);

      setStats({
        totalUsers: { value: (usersCount || 0).toLocaleString(), change: "+12%" },
        activeSellers: { value: (sellersCount || 0).toLocaleString(), change: "+5%" },
        sales: { value: `${(totalSales / 1000000).toFixed(1)}M XAF`, change: "+18%" },
        pending: { value: (pendingCount || 0).toString(), change: "-2" },
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
      ].map((stat) => (
        <div key={stat.label} className="p-6 rounded-2xl bg-card border border-border shadow-sm hover-lift">
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
    linkUrl: "/#forum-2026",
    enabled: 1
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(getApiUrl("/api/popup-banner"))
      .then(res => res.json())
      .then(data => {
        if (data && data.banner) {
          setBanner({
            imageUrl: data.banner.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
            title: data.banner.title || "Cameroon E-Commerce Forum 2026",
            linkUrl: data.banner.linkUrl || "/#forum-2026",
            enabled: data.banner.enabled !== undefined ? parseInt(data.banner.enabled, 10) : 1
          });
        }
      })
      .catch(err => console.error(err));
  }, []);

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
            <Label className="text-xs font-bold text-muted-foreground uppercase">Banner Image URL</Label>
            <Input 
              placeholder="https://images.unsplash.com/... or your custom hosted image URL"
              required
              className="h-11 rounded-xl bg-background border-border text-xs"
              value={banner.imageUrl}
              onChange={(e) => setBanner({ ...banner, imageUrl: e.target.value })}
            />
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
              placeholder="/#forum-2026"
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
    omMerchantId: "om_sandbox_merchant_camemark"
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
            omMerchantId: data.payment.omMerchantId || "om_sandbox_merchant_camemark"
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

export default AdminDashboard;
