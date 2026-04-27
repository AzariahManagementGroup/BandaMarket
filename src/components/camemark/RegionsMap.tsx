import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import map from "@/assets/cameroon-map.png";

const regions = [
  ["Far North", "Northwest"],
  ["North", "West"],
  ["Adamawa", "Littoral"],
  ["East", "Southwest"],
  ["South", "Centre"],
];

const RegionsMap = () => {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card animate-fade-in">
      <h2 className="text-2xl font-extrabold text-foreground">10 Digital Economic Blocs</h2>
      <p className="text-sm text-muted-foreground mb-6">One Cameroon. One Market.</p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <ul className="space-y-2 text-right text-sm font-medium">
          {regions.map((r) => (
            <li key={r[0]} className="text-foreground/80 hover:text-primary transition-smooth cursor-pointer">{r[0]}</li>
          ))}
        </ul>
        <div className="relative">
          <img src={map} alt="Map of the 10 regions of Cameroon" loading="lazy" className="w-40 md:w-52 h-auto animate-float" />
        </div>
        <ul className="space-y-2 text-left text-sm font-medium">
          {regions.map((r) => (
            <li key={r[1]} className="text-foreground/80 hover:text-primary transition-smooth cursor-pointer">{r[1]}</li>
          ))}
        </ul>
      </div>

      <Button variant="outline" className="mt-6 border-primary/30 hover:bg-primary/5">
        Explore All Regions <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
};

export default RegionsMap;