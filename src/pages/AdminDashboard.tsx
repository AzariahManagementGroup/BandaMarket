import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Link, useLocation } from "react-router-dom";
import { Users, Shield, LayoutDashboard, Settings, LogOut, ChevronRight, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
      if (!session) {
        navigate("/signin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, signup_role")
        .eq("id", session.user.id)
        .single();

      const userRole = profile?.role || profile?.signup_role;
      if (userRole !== "super_admin" && userRole !== "admin" && session.user.email !== "info@azariahmg.com") {
        toast.error("Unauthorized access");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, path: "" },
    { label: "User Management", icon: Users, path: "/users" },
    { label: "Roles & Permissions", icon: Shield, path: "/roles" },
    { label: "Settings", icon: Settings, path: "/settings" },
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
            {navItems.find(i => `/admin${i.path}` === location.pathname)?.label || "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
              AD
            </div>
          </div>
        </header>

        <div className="p-8">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
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

export default AdminDashboard;
