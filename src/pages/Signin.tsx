import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/camemark-logo.png";

import { getApiUrl } from "@/config";

const Signin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    document.title = "Sign In — CameMark";
    
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  const handle = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/auth/signin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign in");

      localStorage.setItem("camemark_token", data.token);
      localStorage.setItem("camemark_user", JSON.stringify(data.user));

      toast.success("Welcome back to CameMark!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logo} alt="CameMark" className="h-12 w-auto mx-auto mb-6 animate-float" />
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your CameMark account</p>
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
                  value={form.email}
                  onChange={(e) => handle("email", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-bold text-emerald-600 hover:underline uppercase tracking-wider">Forgot Password?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="pl-12 h-12 bg-gray-50 border-transparent rounded-xl focus-visible:ring-emerald-500 focus-visible:bg-white transition-all"
                  value={form.password}
                  onChange={(e) => handle("password", e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#064E3B] hover:bg-emerald-950 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover-lift"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-4 text-gray-400">Or continue with</span></div>
          </div>

          <Button 
            onClick={googleLogin}
            variant="outline" 
            className="w-full h-12 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4 mr-2" />
            Sign in with Google
          </Button>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-emerald-600 font-bold hover:underline">Sign Up</Link>
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Secure Login</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> 256-bit SSL</div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
