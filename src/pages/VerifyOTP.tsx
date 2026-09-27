import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import logo from "@/assets/camemark-logo.png";
import { getApiUrl } from "@/config";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  
  // Initialize email from navigation state if available
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");

  useEffect(() => {
    document.title = "Verify OTP — Banda Market";
    if (!email) {
      toast.error("Session expired. Please request a new code.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/verify-reset-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify OTP");

      toast.success(data.message || "OTP verified successfully!");
      
      // Navigate to reset password page and pass the resetToken
      navigate("/reset-password", { state: { resetToken: data.resetToken } });
    } catch (err: any) {
      toast.error(err.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logo} alt="Banda Market" className="h-12 w-auto mx-auto mb-6 animate-float" />
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Verify Code
          </h1>
          <p className="text-gray-500 mt-2">
            Enter the 6-digit code sent to {email}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-emerald-900/5 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">6-Digit Reset Code</label>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="123456" 
                  maxLength={6}
                  required 
                  className="pl-12 h-12 bg-gray-50 border-transparent rounded-xl focus-visible:ring-emerald-500 focus-visible:bg-white transition-all tracking-widest text-lg font-bold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 mt-2 bg-[#064E3B] hover:bg-emerald-950 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover-lift"
              disabled={loading || !otp}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Code"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-emerald-600 font-medium transition-colors">
              ← Back to Forgot Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
