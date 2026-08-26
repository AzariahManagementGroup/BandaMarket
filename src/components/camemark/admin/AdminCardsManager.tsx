import { useState, useEffect } from "react";
import { getApiUrl } from "@/config";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Lock, Unlock, Eye, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminCardsManager = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("camemark_token");
      const res = await fetch(getApiUrl("/api/admin-cards?action=list"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      }
    } catch (err) {
      toast.error("Failed to fetch cards");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleUpdateStatus = async (cardId: string, status: string) => {
    if (status === 'deleted' && !window.confirm("Are you sure you want to delete this card?")) return;
    
    toast.loading("Updating status...");
    try {
      const token = localStorage.getItem("camemark_token");
      const res = await fetch(getApiUrl("/api/admin-cards?action=update-status"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId, status }),
      });
      toast.dismiss();
      if (res.ok) {
        toast.success(`Card status updated to ${status}`);
        fetchCards();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.dismiss();
      toast.error("Network error");
    }
  };

  const handleViewTransactions = async (card: any) => {
    setSelectedCard(card);
    setIsTxModalOpen(true);
    setTransactionsLoading(true);
    try {
      const token = localStorage.getItem("camemark_token");
      const res = await fetch(getApiUrl(`/api/admin-cards?action=transactions&cardId=${card.id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      toast.error("Failed to fetch transactions");
    }
    setTransactionsLoading(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Cards & Wallets</h1>
          <p className="text-muted-foreground">Manage user cards, freeze accounts, and view transactions.</p>
        </div>
        <Button onClick={fetchCards} variant="outline" size="sm">
          Refresh List
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : cards.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No cards found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Cardholder</th>
                    <th className="px-6 py-4 font-medium">Card Info</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cards.map((card) => (
                    <tr key={card.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{card.userName}</div>
                        <div className="text-xs text-muted-foreground">{card.userEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono">{card.card_number}</div>
                        <div className="text-xs text-muted-foreground mt-1">Exp: {card.expiry_date} | CVV: ***</div>
                      </td>
                      <td className="px-6 py-4 capitalize">{card.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${card.status === 'frozen' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {card.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewTransactions(card)}
                          className="h-8 px-2 text-blue-600 hover:text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100"
                        >
                          <Eye className="h-4 w-4 mr-1" /> Txns
                        </Button>
                        
                        {card.status === 'frozen' ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUpdateStatus(card.id, 'active')}
                            className="h-8 px-2 text-emerald-600 hover:text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                          >
                            <Unlock className="h-4 w-4 mr-1" /> Unfreeze
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUpdateStatus(card.id, 'frozen')}
                            className="h-8 px-2 text-orange-600 hover:text-orange-700 border-orange-200 bg-orange-50 hover:bg-orange-100"
                          >
                            <Lock className="h-4 w-4 mr-1" /> Freeze
                          </Button>
                        )}

                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleUpdateStatus(card.id, 'deleted')}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 border-red-200 bg-red-50 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isTxModalOpen} onOpenChange={setIsTxModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Card Transactions</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedCard && (
              <div className="mb-4 p-4 bg-muted rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedCard.userName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{selectedCard.card_number}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${selectedCard.status === 'frozen' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {selectedCard.status || 'active'}
                </div>
              </div>
            )}

            {transactionsLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                No transactions found for this card.
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground text-xs uppercase sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Merchant</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-medium">{tx.merchant}</td>
                        <td className="px-4 py-3 font-bold text-red-600">
                          -{parseFloat(tx.amount).toLocaleString()} {tx.currency}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="capitalize text-xs font-semibold px-2 py-1 bg-gray-100 rounded-md">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCardsManager;
