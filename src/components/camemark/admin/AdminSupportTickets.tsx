import { useState, useEffect } from "react";
import { getApiUrl } from "@/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, MessageSquare, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("camemark_token");
      const res = await fetch(getApiUrl("/api/admin-tickets?action=list"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      toast.error("Failed to fetch tickets");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminResponse) return;
    
    setSubmitting(true);
    toast.loading("Sending response...");
    try {
      const token = localStorage.getItem("camemark_token");
      const res = await fetch(getApiUrl("/api/admin-tickets?action=respond"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId: selectedTicket.id, adminResponse }),
      });
      toast.dismiss();
      if (res.ok) {
        toast.success("Response sent and ticket resolved.");
        setIsRespondModalOpen(false);
        fetchTickets();
      } else {
        toast.error("Failed to send response");
      }
    } catch (e) {
      toast.dismiss();
      toast.error("Network error");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">Manage user reports and card issues.</p>
        </div>
        <Button onClick={fetchTickets} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No support tickets found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Subject</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{ticket.userName}</div>
                        <div className="text-xs text-muted-foreground">{ticket.userEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground max-w-[200px] truncate">{ticket.subject}</div>
                        {ticket.card_number && (
                          <div className="text-xs text-muted-foreground mt-1 font-mono">{ticket.card_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {ticket.status === 'open' ? (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setAdminResponse("");
                              setIsRespondModalOpen(true);
                            }}
                            className="h-8 px-3 text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" /> Respond
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setAdminResponse(ticket.adminResponse || "No response recorded");
                              setIsRespondModalOpen(true);
                            }}
                            className="h-8 px-3 text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> View
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRespondModalOpen} onOpenChange={setIsRespondModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.status === 'resolved' ? 'Ticket Details' : 'Respond to Ticket'}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">User Message</p>
              <h4 className="font-bold mb-2">{selectedTicket?.subject}</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket?.message}</p>
            </div>

            {selectedTicket?.status === 'open' ? (
              <form onSubmit={handleRespond} className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Response (Resolves Ticket)</Label>
                  <Textarea 
                    required 
                    value={adminResponse} 
                    onChange={(e) => setAdminResponse(e.target.value)} 
                    placeholder="Type your response here... The user will be notified via email."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsRespondModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Send & Resolve
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Admin Response</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket?.adminResponse}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupportTickets;
