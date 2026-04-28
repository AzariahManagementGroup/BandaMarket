import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CreditCard, Wallet, Plus, ArrowUpRight, 
  ArrowRight, Shield, Globe, Lock,
  ChevronLeft, Loader2, CheckCircle2,
  Trash2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/camemark/Navbar";

const CardsWallet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Cards & Wallet | CaMark";
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/signin");
      return;
    }

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    const { data: walletData } = await supabase.from("wallets").select("*").eq("profile_id", session.user.id).single();
    const { data: cardsData } = await supabase.from("cards").select("*").eq("profile_id", session.user.id);

    setProfile(profileData);
    setWallet(walletData);
    setCards(cardsData || []);
    setLoading(false);
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const amount = (e.currentTarget as any).amount.value;
    
    // Simulate payment gateway
    toast.info("Simulating Secure Payment Gateway...");
    setTimeout(async () => {
      const { error } = await supabase
        .from("wallets")
        .update({ balance: (wallet?.balance || 0) + parseFloat(amount) })
        .eq("profile_id", profile.id);

      if (!error) {
        toast.success(`Successfully topped up ${wallet?.currency} ${amount}`);
        setIsTopupOpen(false);
        fetchData();
      }
      setLoading(false);
    }, 2000);
  };

  const handleCreateCard = async (type: 'virtual' | 'physical') => {
    setLoading(true);
    const fee = type === 'virtual' ? 2500 : 5000;
    
    if (wallet.balance < fee) {
      toast.error("Insufficient funds in wallet.");
      setLoading(false);
      return;
    }

    const cardNumber = "5592 " + Math.floor(Math.random() * 8999 + 1000) + " " + Math.floor(Math.random() * 8999 + 1000) + " " + Math.floor(Math.random() * 8999 + 1000);
    
    const { error } = await supabase.from("cards").insert({
      profile_id: profile.id,
      card_number: cardNumber,
      card_holder_name: profile.full_name,
      expiry_date: "12/28",
      cvv: "321",
      type: type
    });

    if (!error) {
      await supabase.from("wallets").update({ balance: wallet.balance - fee }).eq("profile_id", profile.id);
      toast.success(`${type.toUpperCase()} card generated!`);
      setIsCardModalOpen(false);
      fetchData();
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
          {/* Wallet Overview */}
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

          {/* Cards Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Your Cards</h3>
              <Button onClick={() => setIsCardModalOpen(true)} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-2xl font-bold px-6">
                <Plus className="h-4 w-4 mr-2" /> New Card
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.length > 0 ? cards.map((c) => (
                <Card key={c.id} className="rounded-[2rem] bg-[#1E293B] border-none shadow-xl text-white overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-8 relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-12">
                      <div className="h-10 w-16 bg-white/10 rounded-lg backdrop-blur-md flex items-center justify-center font-bold text-xs uppercase italic tracking-tighter">
                        {c.type}
                      </div>
                      <CreditCard className="h-6 w-6 text-emerald-400" />
                    </div>
                    
                    <div className="space-y-1 mb-8">
                       <p className="text-lg font-mono font-bold tracking-[0.3em]">{c.card_number.replace(/\d(?=\d{4})/g, "*")}</p>
                       <div className="flex gap-4 opacity-60">
                         <p className="text-[10px] font-bold">EXP: {c.expiry_date}</p>
                         <p className="text-[10px] font-bold">CVV: ***</p>
                       </div>
                    </div>
                    
                    <div className="flex justify-between items-end mt-auto">
                      <p className="text-sm font-bold uppercase tracking-widest">{c.card_holder_name}</p>
                      <div className="h-8 w-12 bg-white/20 rounded-md backdrop-blur-md" />
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

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <QuickAction icon={Lock} label="Freeze Card" />
               <QuickAction icon={AlertCircle} label="Report Issue" />
               <QuickAction icon={Globe} label="International" />
               <QuickAction icon={Trash2} label="Delete Card" color="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Topup Modal */}
      <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center">Top Up Wallet</DialogTitle>
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

      {/* Card Request Modal */}
      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl p-8">
           <DialogHeader>
              <DialogTitle className="text-2xl font-black text-center">Request New Card</DialogTitle>
           </DialogHeader>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
              <div className="border border-gray-100 rounded-3xl p-6 hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group" onClick={() => handleCreateCard('virtual')}>
                 <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CreditCard className="h-6 w-6" />
                 </div>
                 <h4 className="font-bold text-gray-900">Virtual Card</h4>
                 <p className="text-[10px] text-gray-400 mt-1 mb-4 leading-relaxed">Instant delivery, perfect for online global shopping.</p>
                 <p className="text-xs font-black text-emerald-600">Fee: {wallet?.currency} 2,500</p>
              </div>
              <div className="border border-gray-100 rounded-3xl p-6 hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group" onClick={() => handleCreateCard('physical')}>
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
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, color = "text-gray-600" }) => (
  <button className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-50 rounded-3xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group shadow-sm">
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
