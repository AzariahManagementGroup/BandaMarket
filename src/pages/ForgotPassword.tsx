import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import logo from "@/assets/camemark-logo.png";
import { getApiUrl } from "@/config";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    document.title = "Forgot Password — Banda Market";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request password reset");

      toast.success(data.message || "Reset code sent successfully");
      
      // Navigate to verify OTP page and pass the email
      navigate("/verify-otp", { state: { email } });
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
            Forgot Password?
          </h1>
          <p className="text-gray-500 mt-2">
            Enter your email to receive a password reset code
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-emerald-900/5 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input 
                  type="email" 
                  placeholder="john@example.com" 
                  required 
                  className="pl-12 h-12 bg-gray-50 border-transparent rounded-xl focus-visible:ring-emerald-500 focus-visible:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#064E3B] hover:bg-emerald-950 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover-lift"
              disabled={loading || !email}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Code"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/signin" className="text-sm text-gray-500 hover:text-emerald-600 font-medium transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <Link to="/" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/" className="hover:text-emerald-600 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
