import { Link } from "react-router-dom";
import { Settings, ShieldAlert } from "lucide-react";
import logo from "@/assets/camemark-logo.png";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 text-center bg-slate-950">
      
      {/* Background glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 animate-fade-in max-w-lg w-full bg-white/5 backdrop-blur-2xl rounded-3xl p-10 md:p-14 shadow-2xl border border-white/10 flex flex-col items-center">
        
        {/* Animated Logo Container */}
        <div className="relative flex items-center justify-center mb-10">
          <div className="absolute inset-[-20px] bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
          <img 
            src={logo} 
            alt="Banda Market Logo" 
            className="h-16 w-auto relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-bounce"
          />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-[length:200%_auto] bg-gradient-to-r from-emerald-400 via-white to-emerald-400 bg-clip-text text-transparent animate-gradient-shift drop-shadow-sm">
          We'll Be Back Soon
        </h1>
        
        <p className="text-slate-300 text-lg mb-10 leading-relaxed font-medium">
          Banda Market is currently undergoing scheduled maintenance to upgrade our infrastructure and bring you a better experience. 
        </p>

        {/* Action Button */}
        <div className="w-full flex flex-col items-center gap-6">
          <Link 
            to="/signin" 
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-sm font-bold text-white transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
            <span>Admin Access</span>
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 mt-12 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
        <Settings className="h-4 w-4 animate-[spin_4s_linear_infinite]" />
        &copy; {new Date().getFullYear()} Banda Market
      </div>
    </div>
  );
};

export default MaintenancePage;
