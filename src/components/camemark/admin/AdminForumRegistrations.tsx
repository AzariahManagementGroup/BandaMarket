import { useState, useEffect } from "react";
import { getApiUrl } from "@/config";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Mail, Phone, Building2, CheckCircle2, Clock, XCircle } from "lucide-react";

interface ForumRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  city: string;
  country: string;
  category: string;
  payment_status: "paid" | "pending" | "failed";
  amount_paid: string;
  registered_at: string;
}

const AdminForumRegistrations = () => {
  const [registrations, setRegistrations] = useState<ForumRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const token = localStorage.getItem("camemark_token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : undefined;
        
        const res = await fetch(getApiUrl("/api/admin-forum-registrations"), { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.registrations) {
            setRegistrations(data.registrations);
          }
        }
      } catch (err) {
        console.error("Failed to fetch forum registrations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Forum Registrations 2026</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage and view all delegates who have registered for the upcoming Cameroon E-Commerce Forum.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or organization..." 
            className="pl-9 bg-background/50 border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="px-3 py-1.5 bg-background">Total: {registrations.length}</Badge>
           <Badge variant="outline" className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600">Paid: {registrations.filter(r => r.payment_status === 'paid').length}</Badge>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Delegate Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Ticket Category</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                      Loading registrations...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No registrations found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{reg.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground"><Mail className="w-3 h-3 mr-1.5" /> {reg.email}</div>
                        <div className="flex items-center text-xs text-muted-foreground"><Phone className="w-3 h-3 mr-1.5" /> {reg.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm"><Building2 className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> {reg.organization}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm"><MapPin className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> {reg.city}, {reg.country}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium text-xs bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                        {reg.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-sm">
                      {reg.amount_paid}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reg.payment_status)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminForumRegistrations;
