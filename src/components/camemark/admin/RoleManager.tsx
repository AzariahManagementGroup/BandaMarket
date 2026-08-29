import { useEffect, useState } from "react";
import { getApiUrl } from "@/config";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ShieldCheck, Info } from "lucide-react";

const MODULES = [
  { id: "marketplace", name: "Marketplace", description: "Access to buying/selling zones" },
  { id: "users", name: "User Management", description: "Manage platform users and roles" },
  { id: "orders", name: "Order Tracking", description: "View and manage shipments" },
  { id: "finance", name: "Financial Tools", description: "Access to wallets and transactions" },
  { id: "logistics", name: "Logistics Hub", description: "Delivery partner management" },
];

const RoleManager = () => {
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("camemark_token");
      const res = await fetch(getApiUrl("/api/admin/roles"), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRolePermissions(data || []);
      } else {
        toast.error("Failed to load roles");
      }
    } catch (e) {
      toast.error("Failed to load roles");
    }
    setLoading(false);
  };

  const togglePermission = async (roleId: string, moduleId: string, currentModules: string[]) => {
    let newModules: string[];
    if (currentModules.includes(moduleId)) {
      newModules = currentModules.filter(m => m !== moduleId);
    } else {
      newModules = [...currentModules, moduleId];
    }

    // Special case for super_admin "all"
    if (currentModules.includes("all")) return;

    try {
      const token = localStorage.getItem("camemark_token");
      const res = await fetch(getApiUrl("/api/admin/roles"), {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ roleId, modules: newModules })
      });
      if (res.ok) {
        toast.success("Permission updated");
        fetchPermissions();
      } else {
        toast.error("Update failed");
      }
    } catch (e) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="hidden md:flex bg-primary/5 border border-primary/10 rounded-2xl p-6 gap-4 items-start">
        <Info className="h-6 w-6 text-primary shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-primary">About Permissions</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Permissions are role-based. Toggling a module here instantly updates access levels for all users assigned to that role.
            Super Admin roles have permanent "all" access.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-48">Role</TableHead>
              {MODULES.map(module => (
                <TableHead key={module.id} className="text-center min-w-[120px]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs">{module.name}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={MODULES.length + 1} className="h-24 text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              rolePermissions.map((rp) => (
                <TableRow key={rp.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`h-4 w-4 ${rp.role === "super_admin" ? "text-amber-500" : "text-primary"}`} />
                      <span className="font-bold uppercase text-xs tracking-wider">{rp.role.replace("_", " ")}</span>
                    </div>
                  </TableCell>
                  {MODULES.map(module => {
                    const hasAccess = rp.modules.includes(module.id) || rp.modules.includes("all");
                    const isSuperAdmin = rp.role === "super_admin";
                    return (
                      <TableCell key={module.id} className="text-center">
                        <Switch 
                          checked={hasAccess} 
                          disabled={isSuperAdmin}
                          onCheckedChange={() => togglePermission(rp.id, module.id, rp.modules)}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RoleManager;
