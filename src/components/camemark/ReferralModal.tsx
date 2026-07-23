import { useState, useEffect } from "react";
import { 
  Gift, Copy, Share2, Send, CheckCircle2, Users, Wallet, 
  Sparkles, ExternalLink, Mail, MessageSquare, ArrowRight, ShieldCheck, RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiUrl } from "@/config";
import { toast } from "sonner";

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

const ReferralModal = ({ isOpen, onClose, user }: ReferralModalProps) => {
  const [loading, setLoading] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const userName = user?.full_name || user?.fullName || "taiwo";
  const userId = user?.id || "user-default";
  const userEmail = user?.email || "";

  // Dynamic Referral State from Database
  const [rewardAmount, setRewardAmount] = useState<number>(20);
  const [refCode, setRefCode] = useState<string>("taiwo");
  const [referralLink, setReferralLink] = useState<string>(`${window.location.origin}/signup?ref=${encodeURIComponent(userName.toLowerCase().replace(/[^a-z0-9]/g, ''))}`);
  const [totalReferred, setTotalReferred] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);

  // Email Invite Form State
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const url = getApiUrl(`/api/referrals?userId=${encodeURIComponent(userId)}&userName=${encodeURIComponent(userName)}&userEmail=${encodeURIComponent(userEmail)}`);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRewardAmount(parseFloat(data.rewardAmount) || 20);
          if (data.refCode) setRefCode(data.refCode);
          if (data.referralLink) setReferralLink(data.referralLink);
          setTotalReferred(data.totalReferred || 0);
          setTotalEarned(data.totalEarned || 0);
          if (Array.isArray(data.recentReferrals)) {
            setRecentReferrals(data.recentReferrals);
          }
        }
      }
    } catch (e) {
      console.error("Fetch referral error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReferralData();
    }
  }, [isOpen, userName]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("📋 Personal referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const message = `🎁 *Join me on CameMark!*\nCameroon's premier digital marketplace to buy & sell farm produce and products.\n\nSign up with my personal link and earn bonus points:\n👉 ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleSendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendEmail) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSendingInvite(true);
    try {
      const res = await fetch(getApiUrl("/api/referrals"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite",
          friendName: friendName || "Friend",
          friendEmail: friendEmail,
          senderName: userName,
          referralLink: referralLink
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`📧 Invitation sent successfully to ${friendEmail}!`);
        setFriendName("");
        setFriendEmail("");
        fetchReferralData();
      } else {
        toast.error(data.message || "Failed to send invitation.");
      }
    } catch (e) {
      toast.error("Error sending invitation.");
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw] bg-white rounded-3xl p-0 overflow-hidden border border-gray-100 shadow-2xl font-sans max-h-[90vh] flex flex-col">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#064E3B] via-emerald-900 to-emerald-950 p-6 text-white relative overflow-hidden shrink-0">
          <div className="absolute -right-6 -top-6 h-32 w-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-black uppercase tracking-wider backdrop-blur-md border border-emerald-700/50">
              <Gift className="h-3.5 w-3.5 text-amber-400" /> Refer & Earn Program
            </span>
            <button onClick={fetchReferralData} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-black mt-3 leading-tight">
            Invite Friends & Earn <span className="text-amber-400 font-extrabold">{rewardAmount} FCFA</span> Per Sign Up!
          </h2>
          <p className="text-xs text-emerald-200 mt-1 font-medium leading-relaxed">
            Share your unique referral link containing your name <strong>({userName})</strong>. When friends register, you instantly earn <strong>{rewardAmount} FCFA</strong>.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-emerald-800/60 text-center">
            <div className="bg-emerald-900/60 p-2 rounded-xl border border-emerald-700/40 backdrop-blur-xs">
              <p className="text-[10px] text-emerald-300 uppercase font-bold">Reward Rate</p>
              <p className="text-sm font-black text-amber-300">FCFA {rewardAmount}</p>
            </div>
            <div className="bg-emerald-900/60 p-2 rounded-xl border border-emerald-700/40 backdrop-blur-xs">
              <p className="text-[10px] text-emerald-300 uppercase font-bold">Total Referred</p>
              <p className="text-sm font-black text-white">{totalReferred} Users</p>
            </div>
            <div className="bg-emerald-900/60 p-2 rounded-xl border border-emerald-700/40 backdrop-blur-xs">
              <p className="text-[10px] text-emerald-300 uppercase font-bold">Total Earned</p>
              <p className="text-sm font-black text-emerald-300">FCFA {totalEarned.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Section 1: Unique Referral Link */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700 uppercase flex items-center justify-between">
              <span>Your Personal Referral Link (with your name)</span>
              <span className="text-[10px] text-emerald-700 font-black uppercase">Ref Code: {refCode}</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input 
                readOnly 
                value={referralLink} 
                className="h-11 rounded-xl bg-gray-50 border-gray-200 text-xs font-mono text-gray-800 font-bold focus-visible:ring-emerald-500"
              />
              <Button 
                onClick={handleCopyLink} 
                className="h-11 px-4 rounded-xl bg-[#064E3B] hover:bg-emerald-950 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-amber-300" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleShareWhatsApp} 
              className="h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Share2 className="h-4 w-4" /> Share on WhatsApp
            </Button>
            <Button 
              onClick={() => {
                const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
                window.open(fbUrl, "_blank");
              }} 
              variant="outline"
              className="h-11 rounded-2xl border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 font-bold text-xs flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4 text-blue-600" /> Share on Facebook
            </Button>
          </div>

          {/* Section 2: Direct Email Invitation */}
          <form onSubmit={handleSendEmailInvite} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
            <h4 className="text-xs font-black text-gray-900 flex items-center gap-2 uppercase tracking-wide">
              <Mail className="h-4 w-4 text-emerald-700" /> Send Direct Email Invitation
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-gray-500 uppercase">Friend's Name</Label>
                <Input 
                  placeholder="e.g. Marie Eto" 
                  value={friendName} 
                  onChange={(e) => setFriendName(e.target.value)} 
                  className="h-10 bg-white rounded-xl text-xs border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-gray-500 uppercase">Friend's Email *</Label>
                <Input 
                  type="email"
                  required
                  placeholder="friend@example.com" 
                  value={friendEmail} 
                  onChange={(e) => setFriendEmail(e.target.value)} 
                  className="h-10 bg-white rounded-xl text-xs border-gray-200"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={sendingInvite}
              className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-extrabold text-xs h-10 rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              {sendingInvite ? "Sending Email..." : "Send Referral Email →"}
            </Button>
          </form>

          {/* Section 3: Recent Referral Activity */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide flex items-center justify-between">
              <span>Recent Referral History</span>
              <span className="text-[10px] font-bold text-emerald-800">Earned: FCFA {totalEarned.toLocaleString()}</span>
            </h4>

            {recentReferrals.length > 0 ? (
              <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                {recentReferrals.map((ref, idx) => (
                  <div key={ref.id || idx} className="p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                        {(ref.referred_user_name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{ref.referred_user_name || 'Registered Member'}</p>
                        <p className="text-[10px] text-gray-400">{ref.referred_user_email || 'Joined via referral link'}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> +FCFA {ref.reward_amount || rewardAmount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400">
                No referrals yet. Copy your referral link above and share it with friends to earn your first <strong>{rewardAmount} FCFA</strong> reward!
              </div>
            )}
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
};

export default ReferralModal;
