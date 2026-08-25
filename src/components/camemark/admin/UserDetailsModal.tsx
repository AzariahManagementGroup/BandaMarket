import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Wallet, History, AlertTriangle, Activity } from "lucide-react";

interface UserDetailsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  details: any;
  loading: boolean;
}

export const UserDetailsModal = ({ user, isOpen, onClose, details, loading }: UserDetailsModalProps) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {user.full_name} 
            {user.status === 'banned' && <Badge variant="destructive">Banned</Badge>}
            {user.warningCount > 0 && <Badge variant="outline" className="text-amber-500 border-amber-500"><AlertTriangle className="w-3 h-3 mr-1"/> {user.warningCount} Warnings</Badge>}
          </DialogTitle>
          <div className="text-sm text-muted-foreground flex gap-4">
            <span>Email: {user.email}</span>
            <span>Role: {user.role}</span>
            <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Tabs defaultValue="wallets" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="wallets" className="text-xs md:text-sm"><Wallet className="w-4 h-4 mr-2" /> Wallets & Funds</TabsTrigger>
              <TabsTrigger value="products" className="text-xs md:text-sm"><Package className="w-4 h-4 mr-2" /> Products</TabsTrigger>
              <TabsTrigger value="user_activity" className="text-xs md:text-sm"><Activity className="w-4 h-4 mr-2" /> Platform Activity</TabsTrigger>
              <TabsTrigger value="logs" className="text-xs md:text-sm"><History className="w-4 h-4 mr-2" /> Admin Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="wallets" className="p-4 border rounded-md mt-2 bg-background/50">
              <h3 className="text-lg font-semibold mb-4">Wallet Balances</h3>
              {details?.wallets?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.wallets.map((w: any, i: number) => (
                    <div key={i} className="p-4 border rounded-lg bg-card shadow-sm flex justify-between items-center">
                      <span className="font-medium">{w.currency}</span>
                      <span className="text-2xl font-bold">{parseFloat(w.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No wallets found for this user.</p>
              )}
            </TabsContent>

            <TabsContent value="products" className="p-4 border rounded-md mt-2 bg-background/50">
              <h3 className="text-lg font-semibold mb-4">Listed Products</h3>
              {details?.products?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.products.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell>{parseFloat(p.price).toLocaleString()} {p.currency}</TableCell>
                        <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">This user has not listed any products.</p>
              )}
            </TabsContent>

            <TabsContent value="user_activity" className="p-4 border rounded-md mt-2 bg-background/50">
              <h3 className="text-lg font-semibold mb-4">User Platform Activity</h3>
              {details?.userLogs?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.userLogs.map((log: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="uppercase text-[10px]">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No platform activity logged for this user.</p>
              )}
            </TabsContent>

            <TabsContent value="logs" className="p-4 border rounded-md mt-2 bg-background/50">
              <h3 className="text-lg font-semibold mb-4">Management Activity Log</h3>
              {details?.logs?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Admin ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.logs.map((log: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="uppercase text-[10px]">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.details}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{log.adminId.substring(0,8)}...</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No administrative actions logged for this user.</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
