import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CreditCard, Wallet, Plus, ArrowUpRight, 
  ArrowRight, Shield, Globe, Lock,
  ChevronLeft, Loader2, CheckCircle2,
  Trash2, AlertCircle, ShieldCheck,
  ArrowDown, Store, Download, ArrowLeftRight, Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { getApiUrl } from "@/config";
import { toast } from "sonner";
import Navbar from "@/components/camemark/Navbar";

const CardsWallet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Cards & Wallet | CaMark";
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("camemark_token");
    const userStr = localStorage.getItem("camemark_user");

    if (!token || token === "null" || (!token && !userStr)) {
      navigate("/signin");
      return;
    } else if (userStr) {
      const user = JSON.parse(userStr);
      setSession({ user });
      fetchUserData(user.id || user.email, user);
    }
  };

  const fetchUserData = async (userId: string, parsedUser?: any) => {
    const token = localStorage.getItem("camemark_token");
    let profileData = null, walletData = null, cardsData = [];

    if (token) {
      const headers = { "Authorization": `Bearer ${token}` };
      const [wRes, cRes] = await Promise.all([
        fetch(getApiUrl("/api/user-data?action=wallets"), { headers }).catch(()=>null),
        fetch(getApiUrl("/api/user-data?action=cards"), { headers }).catch(()=>null)
      ]);

      if (wRes && wRes.ok) walletData = await wRes.json();
      if (cRes && cRes.ok) cardsData = await cRes.json();
    }

    const currentUser = parsedUser || session?.user;
    if (currentUser) {
      setProfile({
        id: userId,
        full_name: currentUser.fullName || currentUser.full_name || currentUser.email?.split('@')[0] || 'VALUED CUSTOMER',
        signup_role: currentUser.role || 'buyer',
      });
    }

    if (walletData) setWallet(walletData);
    else if (session?.user?.wallet) setWallet(session.user.wallet);
    else setWallet({ balance: 0, currency: "XAF" });

    setCards(cardsData || []);
    if (cardsData?.length > 0 && !selectedCardId) {
      setSelectedCardId(cardsData[0].id);
    }
    setLoading(false);
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const amount = (e.currentTarget as any).amount.value;
    const token = localStorage.getItem("camemark_token");
    
    toast.info("Simulating Secure Payment Gateway...");
    setTimeout(async () => {
      try {
        const res = await fetch(getApiUrl("/api/user-data?action=wallets"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ amount: parseFloat(amount) })
        });
        
        if (res.ok) {
          toast.success(`Successfully topped up ${wallet?.currency} ${amount}`);
          setIsTopupOpen(false);
          fetchData();
        } else {
          toast.error("Failed to process topup.");
        }
      } catch (e) {
        toast.error("Network error.");
      }
      setLoading(false);
    }, 2000);
  };

  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [pendingCardType, setPendingCardType] = useState<'virtual' | 'physical'>('virtual');
  const [pendingCardFee, setPendingCardFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("web");
  const [phone, setPhone] = useState("");
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [issueTransactions, setIssueTransactions] = useState<any[]>([]);
  const [issueSubject, setIssueSubject] = useState("");
  const [issueMessage, setIssueMessage] = useState("");
  const [issueTransactionId, setIssueTransactionId] = useState("");

  const handleInitiateCardCreate = (type: 'virtual' | 'physical') => {
    const fee = type === 'virtual' ? 2500 : 5000;
    setPendingCardType(type);
    setPendingCardFee(fee);
    setIsCardModalOpen(false);
    setIsPaymentGatewayOpen(true);
  };

  const handleCreateCard = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      const tranzakRes = await fetch(getApiUrl("/api/tranzak-payment"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: paymentMethod,
          amount: pendingCardFee,
          currencyCode: wallet?.currency || "XAF",
          description: `Card Issuance (${pendingCardType})`,
          mobileWalletNumber: phone
        })
      });

      const tranzakData = await tranzakRes.json();
      if (!tranzakRes.ok) {
         toast.error(tranzakData.error || "Payment initialization failed");
         setLoading(false);
         return;
      }

      const token = localStorage.getItem("camemark_token");
      const cardNumber = "5592 " + Math.floor(Math.random() * 8999 + 1000) + " " + Math.floor(Math.random() * 8999 + 1000) + " " + Math.floor(Math.random() * 8999 + 1000);
      const randomCvv = Math.floor(Math.random() * 899 + 100).toString();
      const currentYear = new Date().getFullYear() % 100;
      const randomExpiry = Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0') + "/" + (currentYear + Math.floor(Math.random() * 4 + 1)).toString();
      
      const res = await fetch(getApiUrl("/api/user-data?action=cards"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          card_number: cardNumber,
          card_holder_name: profile?.full_name || session?.user?.fullName || 'VALUED CUSTOMER',
          expiry_date: randomExpiry,
          cvv: randomCvv,
          type: pendingCardType,
          fee: 0 
        })
      });

      if (res.ok) {
        toast.success(`🎉 ${pendingCardType.toUpperCase()} card generated!`);
        setIsPaymentGatewayOpen(false);
        fetchData();

        if (paymentMethod === "web" && tranzakData?.data?.paymentUrl) {
           window.location.href = tranzakData.data.paymentUrl;
        } else if (paymentMethod === "momo") {
           toast.success("Please check your phone to authorize the Mobile Money payment.");
        } else if (paymentMethod === "qr") {
           toast.success("Payment initiated via QR. Please scan to complete.");
        }
      } else {
        toast.error("Failed to generate card.");
      }
    } catch (e) {
      toast.error("Network error.");
    }
    setLoading(false);
  };

  if (loading && !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate("/dashboard")} className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-emerald-50 transition-colors">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cards & Wallet</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-emerald-900/10 bg-gradient-to-br from-[#064E3B] to-[#022C22] text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Wallet className="h-32 w-32" />
              </div>
              <CardContent className="p-8 relative z-10">
                <p className="text-emerald-100/60 text-xs font-bold uppercase tracking-widest mb-2">Total Balance</p>
                <h2 className="text-4xl font-black mb-10">{wallet?.currency} {wallet?.balance?.toLocaleString()}</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => setIsTopupOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl h-14 font-bold shadow-lg shadow-emerald-500/20">
                    <Plus className="h-5 w-5 mr-2" /> Top Up
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-2xl h-14 font-bold backdrop-blur-md">
                    <ArrowRight className="h-5 w-5 mr-2" /> Transfer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
               <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                 Quick Actions
               </h4>
               <div className="grid grid-cols-3 gap-3">
                 <QuickAction icon={Plus} label="Add Money" onClick={() => setIsTopupOpen(true)} />
                 <QuickAction icon={ArrowUpRight} label="Send Money" />
                 <QuickAction icon={Store} label="Pay Merchant" />
                 <QuickAction icon={Download} label="Withdraw" />
                 <QuickAction icon={ArrowLeftRight} label="Transfer" />
                 <QuickAction icon={Receipt} label="Request" />
               </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
               <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <Shield className="h-4 w-4 text-emerald-600" /> Security Info
               </h4>
               <ul className="space-y-3 text-xs text-gray-500 font-medium">
                 <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> PCI-DSS Compliant</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> 256-bit Encryption</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> 2FA Protection</li>
               </ul>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Your Cards</h3>
              <Button onClick={() => setIsCardModalOpen(true)} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-2xl font-bold px-6">
                <Plus className="h-4 w-4 mr-2" /> New Card
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.length > 0 ? cards.map((c) => (
                <Card 
                  key={c.id} 
                  onClick={() => setSelectedCardId(c.id)}
                  className={`relative rounded-2xl w-full max-w-[340px] aspect-[1.586/1] border-none shadow-2xl text-white overflow-hidden group transition-all duration-300 mx-auto sm:mx-0 cursor-pointer ${selectedCardId === c.id ? 'ring-4 ring-emerald-500 scale-[1.02]' : 'hover:-translate-y-1'} ${c.status === 'frozen' ? 'bg-gray-800 opacity-80 grayscale' : 'bg-[#023E20]'}`}
                >
                  {c.status === 'frozen' && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <div className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2">
                        <Lock className="h-4 w-4 text-white" />
                        <span className="text-white font-bold tracking-widest uppercase text-xs">Frozen</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                  <CardContent className="p-5 h-full flex flex-col relative z-10">
                    
                    <div className="flex justify-between items-start">
                      <div className="text-[13px] font-sans font-bold tracking-wide mt-1">
                        <span className="text-yellow-400">CaMark</span><span className="text-white"> Card</span>
                      </div>
                      <div className="flex -space-x-3">
                        <div className="h-[22px] w-[22px] rounded-full bg-[#EA001B] z-10 opacity-95"></div>
                        <div className="h-[22px] w-[22px] rounded-full bg-[#F79E1B] z-0 opacity-95"></div>
                      </div>
                    </div>
                    
                    <div className="mt-3 mb-4">
                      <svg width="36" height="26" viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="30" rx="5" fill="#FCD34D"/>
                        <rect x="2" y="2" width="36" height="26" rx="4" fill="none" stroke="#D97706" strokeWidth="1"/>
                        <path d="M 13 2 L 13 28 M 27 2 L 27 28 M 2 10 L 13 10 M 2 20 L 13 20 M 27 10 L 38 10 M 27 20 L 38 20 M 17 2 L 17 10 M 23 2 L 23 10 M 17 28 L 17 20 M 23 28 L 23 20" stroke="#D97706" strokeWidth="1"/>
                      </svg>
                    </div>

                     <div className="mt-auto">
                       <p className="text-lg font-mono font-medium tracking-[0.15em] text-gray-200 drop-shadow-sm">
                         {c.card_number ? c.card_number.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim() : '5592 1234 5678 9010'}
                       </p>
                     </div>
                    
                    <div className="flex justify-between items-end mt-2">
                      <div className="flex flex-col font-mono">
                        <div className="flex items-center gap-4 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] text-gray-300 leading-none mt-1">VALID</span>
                            <span className="text-xs font-semibold tracking-wider text-gray-100">{c.expiry_date || '**/**'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] text-gray-300 leading-none mt-1">CVV</span>
                            <span className="text-xs font-semibold tracking-wider text-gray-100">{c.cvv || '***'}</span>
                          </div>
                        </div>
                        <p className="text-[11px] font-semibold tracking-widest text-gray-200 uppercase">
                           {(c.card_holder_name === 'CHRISTOPHER NGUEMA' ? null : c.card_holder_name) || profile?.full_name || session?.user?.fullName || 'VALUED CUSTOMER'}
                        </p>
                      </div>
                      
                      <div className="text-white font-sans italic font-black text-2xl tracking-tighter select-none">
                        VISA
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-2 p-12 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">No Active Cards</h4>
                  <p className="text-xs text-gray-500 max-w-xs">Generate your first virtual or physical card to start transacting globally.</p>
                </div>
              )}
            </div>

            {cards.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <QuickAction 
                   icon={cards.find(c => c.id === selectedCardId)?.status === 'frozen' ? ShieldCheck : Lock} 
                   label={cards.find(c => c.id === selectedCardId)?.status === 'frozen' ? "Unfreeze Card" : "Freeze Card"} 
                   onClick={async () => {
                      if (!selectedCardId) return;
                      const c = cards.find(x => x.id === selectedCardId);
                      if (!c) return;
                      const newStatus = c.status === 'frozen' ? 'active' : 'frozen';
                      toast.loading("Updating card status...");
                      try {
                        const token = localStorage.getItem("camemark_token");
                        const res = await fetch(getApiUrl("/api/user-data?action=update-card-status"), {
                          method: "POST",
                          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                          body: JSON.stringify({ cardId: selectedCardId, status: newStatus })
                        });
                        toast.dismiss();
                        if (res.ok) {
                          toast.success(`Card has been ${newStatus}.`);
                          fetchData();
                        } else {
                          toast.error("Failed to update status.");
                        }
                      } catch (e) {
                        toast.dismiss();
                        toast.error("Network error.");
                      }
                   }}
                 />
                 <QuickAction icon={AlertCircle} label="Report Issue" onClick={async () => {
                    if (!selectedCardId) {
                      toast.error("Please select a card first");
                      return;
                    }
                    setIsReportIssueOpen(true);
                    setIssueSubject("");
                    setIssueMessage("");
                    setIssueTransactionId("");
                    try {
                      const token = localStorage.getItem("camemark_token");
                      const res = await fetch(getApiUrl(`/api/user-data?action=card-transactions&cardId=${selectedCardId}`), {
                        headers: { "Authorization": `Bearer ${token}` }
                      });
                      if (res.ok) {
                        setIssueTransactions(await res.json());
                      }
                    } catch (e) {
                      console.error("Failed to fetch txs", e);
                    }
                 }} />
                 <QuickAction icon={Globe} label="International" />
                 <QuickAction icon={Trash2} label="Delete Card" color="text-red-500" onClick={async () => {
                    if (!selectedCardId) return;
                    if (!window.confirm("Are you sure you want to delete this card? This action cannot be undone.")) return;
                    toast.loading("Deleting card...");
                    try {
                      const token = localStorage.getItem("camemark_token");
                      const res = await fetch(getApiUrl("/api/user-data?action=update-card-status"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ cardId: selectedCardId, status: 'deleted' })
                      });
                      toast.dismiss();
                      if (res.ok) {
                        toast.success("Card deleted.");
                        setSelectedCardId(null);
                        fetchData();
                      } else {
                        toast.error("Failed to delete card.");
                      }
                    } catch (e) {
                      toast.dismiss();
                      toast.error("Network error.");
                    }
                 }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center">Top Up Wallet</DialogTitle>
            <DialogDescription className="text-center text-xs text-gray-500">Securely top up your balance using our payment simulator.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTopup} className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400">Amount ({wallet?.currency})</Label>
              <Input name="amount" type="number" placeholder="50,000" className="h-16 text-3xl font-black text-center rounded-2xl bg-gray-50 border-none" required />
            </div>
            
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase text-gray-400">Select Simulator Payment Method</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Mastercard', 'Visa', 'Momo', 'PayPal'].map(m => (
                  <button type="button" key={m} className="p-3 border rounded-xl text-xs font-bold hover:border-emerald-500 hover:bg-emerald-50 transition-all">{m}</button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full h-14 bg-[#064E3B] hover:bg-emerald-950 text-white rounded-2xl font-bold shadow-xl shadow-emerald-900/20" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Payment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl p-8">
           <DialogHeader>
              <DialogTitle className="text-2xl font-black text-center">Request New Card</DialogTitle>
              <DialogDescription className="text-center text-xs text-gray-500">Choose between a virtual or physical card to extend your buying power.</DialogDescription>
           </DialogHeader>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
              <div className="border border-gray-100 rounded-3xl p-6 hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group" onClick={() => handleInitiateCardCreate('virtual')}>
                 <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CreditCard className="h-6 w-6" />
                 </div>
                 <h4 className="font-bold text-gray-900">Virtual Card</h4>
                 <p className="text-[10px] text-gray-400 mt-1 mb-4 leading-relaxed">Instant delivery, perfect for online global shopping.</p>
                 <p className="text-xs font-black text-emerald-600">Fee: {wallet?.currency} 2,500</p>
              </div>
              <div className="border border-gray-100 rounded-3xl p-6 hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group" onClick={() => handleInitiateCardCreate('physical')}>
                 <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Truck className="h-6 w-6" />
                 </div>
                 <h4 className="font-bold text-gray-900">Physical Card</h4>
                 <p className="text-[10px] text-gray-400 mt-1 mb-4 leading-relaxed">Doorstep delivery, usable at any ATM worldwide.</p>
                 <p className="text-xs font-black text-emerald-600">Fee: {wallet?.currency} 5,000</p>
              </div>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentGatewayOpen} onOpenChange={setIsPaymentGatewayOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> CameMark Payment Gateway
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-200">
                256-bit Encrypted
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Complete your card request payment of <strong className="text-emerald-700 font-extrabold text-sm">{wallet?.currency} {pendingCardFee.toLocaleString()}</strong> using your selected channel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCard} className="space-y-4 mt-2">
            <div className="space-y-1 pt-2 border-gray-100">
              <Label className="text-xs font-bold text-gray-500 uppercase">Payment Method</Label>
              <select 
                className="w-full h-11 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="web">Web Redirect (Visa/Mastercard/MoMo via Tranzak)</option>
                <option value="momo">Mobile Money Direct Prompt (MTN/Orange)</option>
                <option value="qr">In-Store QR Code</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Selected Gateway Channel:</span>
                <span className="font-extrabold text-gray-900 uppercase">TRANZAK ({paymentMethod})</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Product(s):</span>
                <span className="font-bold text-gray-800 line-clamp-1 max-w-[200px]">
                  {pendingCardType === 'virtual' ? 'Virtual Card Issuance' : 'Physical Card Issuance & Delivery'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                <span className="font-extrabold text-gray-700">Total Payable:</span>
                <span className="font-black text-emerald-700 text-sm">{wallet?.currency} {pendingCardFee.toLocaleString()}</span>
              </div>
            </div>

            {paymentMethod === 'momo' && (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">
                  Mobile Money Number
                </Label>
                <Input 
                  type="text"
                  required
                  placeholder="+237 6xx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-xl bg-gray-50 px-3 text-xs font-mono font-bold border border-gray-200"
                />
                <p className="text-[10px] text-gray-400 mt-1">A payment prompt USSD push will be sent to your mobile phone.</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-black h-12 rounded-2xl text-xs sm:text-sm mt-2 shadow-lg shadow-emerald-950/20">
              {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : `Pay ${wallet?.currency} ${pendingCardFee.toLocaleString()} Now →`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isReportIssueOpen} onOpenChange={setIsReportIssueOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center">Report an Issue</DialogTitle>
            <DialogDescription className="text-center text-xs text-gray-500">Let us know if you're experiencing problems with your card or a specific transaction.</DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
             e.preventDefault();
             if (!selectedCardId) return;
             toast.loading("Submitting report...");
             setLoading(true);
             try {
                const token = localStorage.getItem("camemark_token");
                const res = await fetch(getApiUrl("/api/user-data?action=report-issue"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                  body: JSON.stringify({
                    cardId: selectedCardId,
                    transactionId: issueTransactionId || null,
                    subject: issueSubject,
                    message: issueMessage
                  })
                });
                toast.dismiss();
                if (res.ok) {
                  toast.success("Issue reported successfully. Support will contact you shortly.");
                  setIsReportIssueOpen(false);
                } else {
                  toast.error("Failed to submit issue report.");
                }
             } catch (e) {
                toast.dismiss();
                toast.error("Network error.");
             }
             setLoading(false);
          }} className="space-y-4 py-4">
             <div className="space-y-2">
               <Label className="text-xs font-bold uppercase text-gray-400">Subject</Label>
               <Input required placeholder="E.g., Duplicate Charge" value={issueSubject} onChange={(e) => setIssueSubject(e.target.value)} className="rounded-xl border-gray-200" />
             </div>
             
             {issueTransactions.length > 0 && (
               <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase text-gray-400">Select Transaction (Optional)</Label>
                 <select value={issueTransactionId} onChange={(e) => setIssueTransactionId(e.target.value)} className="w-full rounded-xl border border-gray-200 p-2 text-sm bg-gray-50">
                   <option value="">-- No specific transaction --</option>
                   {issueTransactions.map(tx => (
                     <option key={tx.id} value={tx.id}>
                       {new Date(tx.createdAt).toLocaleDateString()} - {tx.merchant} (-{tx.amount} {tx.currency})
                     </option>
                   ))}
                 </select>
               </div>
             )}

             <div className="space-y-2">
               <Label className="text-xs font-bold uppercase text-gray-400">Description</Label>
               <Textarea required placeholder="Please describe the issue in detail..." value={issueMessage} onChange={(e) => setIssueMessage(e.target.value)} className="rounded-xl border-gray-200 min-h-[100px]" />
             </div>

             <Button type="submit" disabled={loading} className="w-full h-12 bg-[#064E3B] hover:bg-emerald-950 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 mt-4">
               {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Ticket"}
             </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, color = "text-gray-600", onClick }: any) => (
  <button onClick={onClick} type="button" className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-50 rounded-3xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group shadow-sm">
    <div className={`h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <span className="text-[10px] font-bold text-gray-700">{label}</span>
  </button>
);

const Truck = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 17h4"/><path d="M14 17h1"/><path d="M22 17h-2"/><path d="M20 17h-2"/><path d="M4 17H2"/><path d="M1 13h15v4H1z"/><path d="M16 8h4.4a2 2 0 0 1 1.6 1.1l1 2.9h-7V8z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
);

export default CardsWallet;
