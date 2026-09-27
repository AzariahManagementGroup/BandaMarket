import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import logo from "@/assets/camemark-logo.png";
import { getApiUrl } from "@/config";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Initialize resetToken from navigation state if available
  const resetToken = location.state?.resetToken || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    document.title = "Reset Password — Banda Market";
    if (!resetToken) {
      toast.error("Invalid reset session. Please request a new code.");
      navigate("/forgot-password");
    }
  }, [resetToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      toast.success("Password has been successfully reset! You can now log in.");
      navigate("/signin");
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
            Reset Password
          </h1>
          <p className="text-gray-500 mt-2">
            Enter the 6-digit code sent to your email and choose a new password
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-emerald-900/5 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  minLength={6}
                  className="pl-12 pr-12 h-12 bg-gray-50 border-transparent rounded-xl focus-visible:ring-emerald-500 focus-visible:bg-white transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword((s) => !s)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  minLength={6}
                  className="pl-12 pr-12 h-12 bg-gray-50 border-transparent rounded-xl focus-visible:ring-emerald-500 focus-visible:bg-white transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 mt-2 bg-[#064E3B] hover:bg-emerald-950 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover-lift"
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/signin" className="text-sm text-gray-500 hover:text-emerald-600 font-medium transition-colors">
              ← Cancel & Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
