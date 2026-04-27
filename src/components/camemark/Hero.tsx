import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Shield, Truck, Globe2 } from "lucide-react";
import heroImg from "@/assets/hero-marketplace.jpg";

const stats = [
  { icon: MapPin, label: "10 Regions", sub: "Connected" },
  { icon: Shield, label: "100% Secure", sub: "Payments" },
  { icon: Truck, label: "Fast & Reliable", sub: "Logistics across Cameroon" },
  { icon: Globe2, label: "AfCFTA Ready", sub: "Trade beyond borders" },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background flourishes */}
      <div className="absolute inset-0 -z-10 bg-leaf" />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-secondary/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="container py-16 md:py-24 grid gap-12 lg:grid-cols-2 items-center">
        <div className="space-y-7 animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Proudly Cameroonian. Built for Africa. Ready for the World.
          </span>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] text-foreground">
            One Digital Market<br />
            for All 10 Regions<br />
            <span className="text-gradient-flag">of Cameroon</span>
          </h1>

          <div className="space-y-3 max-w-xl">
            <p className="text-lg font-semibold text-foreground/90">
              Cameroon's Digital Market, Wallet & Trade Gateway
            </p>
            <p className="text-base text-muted-foreground italic">Buy. Sell. Bargain. Pay. Deliver. Grow.</p>
            <p className="text-base text-muted-foreground leading-relaxed">
              CameMark connects buyers, sellers, farmers, cooperatives and businesses across all 10 regions
              with secure payments, smart bargains, logistics and regional trade opportunities.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="bg-primary hover:bg-primary-glow shadow-elegant group">
              Start Trading
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/5">
              Explore Regions
              <MapPin className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="rounded-xl bg-card border border-border p-3 hover-lift animate-scale-in"
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                <s.icon className="h-5 w-5 text-primary mb-1.5" />
                <div className="text-xs font-bold text-foreground leading-tight">{s.label}</div>
                <div className="text-[10px] text-muted-foreground">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-fade-in-right" style={{ animationDelay: "0.2s" }}>
          <div className="absolute -inset-6 bg-gradient-to-tr from-primary/20 via-secondary/20 to-accent/20 blur-3xl rounded-full" />
          <img
            src={heroImg}
            alt="CameMark digital marketplace dashboard with Cameroonian produce, wallet card and mobile app"
            width={1280}
            height={896}
            className="relative rounded-3xl shadow-elegant w-full h-auto"
          />
          <div className="absolute -bottom-4 -left-4 rounded-2xl bg-card shadow-elegant border border-border p-3 animate-float" style={{ animationDelay: "1s" }}>
            <div className="text-[10px] text-muted-foreground">Today's volume</div>
            <div className="text-lg font-bold text-primary">F125,000,000</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;