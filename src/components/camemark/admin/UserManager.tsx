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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Search, UserPlus, ShieldAlert, MoreHorizontal, Mail, AlertTriangle, Ban, Info, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserDetailsModal } from "./UserDetailsModal";
import { Textarea } from "@/components/ui/textarea";

const ROLES = ["super_admin", "admin", "seller", "buyer", "logistics"];

const UserManager = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddUserOpen, setAddUserOpen] = useState(false);
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Message state for warnings/emails
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageType, setMessageType] = useState<'warn' | 'email'>('warn');
  const [messageContent, setMessageContent] = useState("");
  const [messageTargetUser, setMessageTargetUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("camemark_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : undefined;
      const res = await fetch(getApiUrl("/api/admin/users"), { headers });
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      } else {
        toast.error("Failed to load users");
      }
    } catch (e) {
      toast.error("Failed to load users");
    }
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem("camemark_token");
      const res = await fetch(getApiUrl("/api/admin/users"), {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId, role: newRole })
      });
      if (res.ok) {
        toast.success("Role updated successfully");
        fetchUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update role");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const updateStatus = async (userId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("camemark_token");
      const res = await fetch(getApiUrl("/api/admin/users"), {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ action: "status", userId, status: newStatus })
      });
      if (res.ok) {
        toast.success(`User status changed to ${newStatus}`);
        fetchUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update status");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim() || !messageTargetUser) return;
    try {
      const token = localStorage.getItem("camemark_token");
      const res = await fetch(getApiUrl("/api/admin/users"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          action: messageType, 
          userId: messageTargetUser.id, 
          message: messageContent 
        })
      });
      if (res.ok) {
        toast.success(messageType === 'warn' ? "Warning sent successfully" : "Email sent successfully");
        setIsMessageOpen(false);
        setMessageContent("");
        if (messageType === 'warn') {
          fetchUsers(); // Refresh warning counts
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send message");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const openMessageModal = (user: any, type: 'warn' | 'email') => {
    setMessageTargetUser(user);
    setMessageType(type);
    setMessageContent("");
    setIsMessageOpen(true);
  };

  const viewDetails = async (user: any) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem("camemark_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : undefined;
      const res = await fetch(getApiUrl(`/api/admin/users?action=details&userId=${user.id}`), { headers });
      if (res.ok) {
        const data = await res.json();
        setUserDetails(data);
      } else {
        toast.error("Failed to load details");
      }
    } catch (e) {
      toast.error("Network error");
    }
    setDetailsLoading(false);
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.id?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users by name, email or ID..." 
              className="pl-10 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchUsers} title="Refresh Users">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <Dialog open={isAddUserOpen} onOpenChange={setAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-glow gap-2 shadow-card">
              <UserPlus className="h-4 w-4" /> Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add User Credentials</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                <ShieldAlert className="h-4 w-4 inline mr-1 text-amber-500" /> 
                New users must currently sign up themselves. You can then elevate their role here. 
                In a production environment, this would use a Supabase Admin API.
              </p>
              <Button className="w-full" onClick={() => setAddUserOpen(false)}>Understood</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div>
                      <p className="font-bold text-foreground flex items-center gap-2">
                        {user.full_name || "Unnamed User"}
                        {user.warningCount > 0 && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500 scale-75" title={`${user.warningCount} Warnings`}>
                            <AlertTriangle className="w-3 h-3 mr-1" /> {user.warningCount}
                          </Badge>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.status === 'banned' ? (
                      <Badge variant="destructive" className="uppercase text-[10px]">Banned</Badge>
                    ) : (
                      <Badge variant="secondary" className="uppercase text-[10px] text-green-500">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={user.role} 
                      onValueChange={(val) => updateRole(user.id, val)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {ROLES.map(role => (
                          <SelectItem key={role} value={role} className="text-xs uppercase font-bold">
                            {role.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => viewDetails(user)} className="cursor-pointer">
                          <Info className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openMessageModal(user, 'email')} className="cursor-pointer">
                          <Mail className="mr-2 h-4 w-4" /> Email User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openMessageModal(user, 'warn')} className="cursor-pointer text-amber-500">
                          <AlertTriangle className="mr-2 h-4 w-4" /> Warn User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'banned' ? (
                          <DropdownMenuItem onClick={() => updateStatus(user.id, 'active')} className="cursor-pointer text-green-500">
                            <Ban className="mr-2 h-4 w-4" /> Unban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => updateStatus(user.id, 'banned')} className="cursor-pointer text-red-500">
                            <Ban className="mr-2 h-4 w-4" /> Ban User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No users found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserDetailsModal 
        user={selectedUser}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        details={userDetails}
        loading={detailsLoading}
      />

      <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {messageType === 'warn' ? (
                <span className="flex items-center text-amber-500"><AlertTriangle className="mr-2 h-5 w-5"/> Send Warning</span>
              ) : (
                <span className="flex items-center"><Mail className="mr-2 h-5 w-5"/> Send Email</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              To: <span className="font-medium text-foreground">{messageTargetUser?.full_name} ({messageTargetUser?.email})</span>
            </p>
            <Textarea 
              placeholder={messageType === 'warn' ? "Enter warning reason..." : "Enter your message here..."}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="min-h-[100px] bg-background"
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsMessageOpen(false)}>Cancel</Button>
              <Button 
                onClick={sendMessage} 
                className={messageType === 'warn' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
              >
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManager;
