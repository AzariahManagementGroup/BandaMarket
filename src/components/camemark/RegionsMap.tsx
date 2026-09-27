import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import map from "@/assets/Malawi-map.png";

const leftRegions = ["Far North", "North", "Adamawa", "East", "South"];
const rightRegions = ["Northwest", "West", "Littoral", "Southwest", "Centre"];

const RegionsMap = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card animate-fade-in space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <MapPin className="h-3.5 w-3.5" /> Regional Trade Hub
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-foreground">10 Digital Economic Blocs</h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">One Malawi. One Market. Click any region to browse local producers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
        <ul className="space-y-3 text-left md:text-right text-xs md:text-sm font-bold">
          {leftRegions.map((r) => (
            <li 
              key={r} 
              onClick={() => navigate(`/market-zone?region=${r}`)}
              className="text-foreground/80 hover:text-emerald-700 hover:scale-105 transition-all cursor-pointer flex items-center justify-start md:justify-end gap-2 p-2 rounded-xl hover:bg-emerald-50/80 border border-transparent hover:border-emerald-200/60"
            >
              <span>{r}</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            </li>
          ))}
        </ul>

        <div className="relative flex justify-center py-2">
          <img 
            src={map} 
            alt="Official map of the 10 regions of Malawi" 
            loading="lazy" 
            className="w-56 md:w-72 lg:w-80 h-auto drop-shadow-xl hover:scale-105 transition-transform duration-500 object-contain" 
          />
        </div>

        <ul className="space-y-3 text-left text-xs md:text-sm font-bold">
          {rightRegions.map((r) => (
            <li 
              key={r} 
              onClick={() => navigate(`/market-zone?region=${r}`)}
              className="text-foreground/80 hover:text-emerald-700 hover:scale-105 transition-all cursor-pointer flex items-center justify-start gap-2 p-2 rounded-xl hover:bg-emerald-50/80 border border-transparent hover:border-emerald-200/60"
            >
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2">
        <Button 
          onClick={() => navigate("/market-zone")}
          className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-bold h-11 rounded-xl text-xs"
        >
          Explore All 10 Regions <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RegionsMap;