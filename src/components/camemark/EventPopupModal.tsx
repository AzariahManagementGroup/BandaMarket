import { useState, useEffect } from "react";
import { X, Sparkles, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/config";

const EventPopupModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [banner, setBanner] = useState<{
    imageUrl: string;
    title: string;
    linkUrl: string;
  }>({
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    title: "Cameroon E-Commerce Forum 2026",
    linkUrl: "/#forum-2026"
  });

  useEffect(() => {
    // Check if user dismissed popup in this session
    const isDismissed = sessionStorage.getItem("camemark_event_popup_dismissed");
    
    // Fetch custom banner set by Admin from backend API
    fetch(getApiUrl("/api/popup-banner"))
      .then(res => res.json())
      .then(data => {
        if (data && data.banner) {
          if (data.banner.enabled === 0) return; // Disabled by admin
          setBanner({
            imageUrl: data.banner.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
            title: data.banner.title || "Cameroon E-Commerce Forum 2026",
            linkUrl: data.banner.linkUrl || "/#forum-2026"
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!isDismissed) {
          // Open popup smoothly 1.5 seconds after launch
          const timer = setTimeout(() => setIsOpen(true), 1200);
          return () => clearTimeout(timer);
        }
      });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("camemark_event_popup_dismissed", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#04382A] via-[#064E3B] to-emerald-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 animate-scale-in">
        
        {/* Cancel / Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 h-9 w-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/20"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Dynamic Admin Image Banner */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-emerald-950">
          <img 
            src={banner.imageUrl} 
            alt={banner.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04382A] via-[#04382A]/40 to-transparent" />
          
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black uppercase tracking-wider shadow-lg">
            <Sparkles className="h-3 w-3" /> Official Forum 2026
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-4 -mt-6 relative z-10">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{banner.title}</h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1 leading-relaxed">
              "Accelerating Digital Trade – Linking Local Enterprise to Global Markets"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-emerald-200">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Calendar className="h-3.5 w-3.5 text-amber-400" /> 18–20th Nov 2026
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <MapPin className="h-3.5 w-3.5 text-amber-400" /> Yaoundé Conference Center
            </span>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <a 
              href={banner.linkUrl}
              onClick={handleClose}
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black h-12 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-transform hover:scale-[1.02]"
            >
              Register for Event <ArrowRight className="h-4 w-4" />
            </a>
            <Button 
              onClick={handleClose} 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 h-12 rounded-2xl text-xs font-bold px-4"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPopupModal;
