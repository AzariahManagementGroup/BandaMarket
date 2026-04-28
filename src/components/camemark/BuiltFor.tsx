import farmer from "@/assets/farmer.jpg";
import { TrendingUp, Package, CheckCircle2, ArrowRight } from "lucide-react";

const Sparkline = () => (
  <svg viewBox="0 0 200 50" className="w-full h-12 mt-3">
    <path
      d="M0 40 L25 35 L50 38 L75 22 L100 28 L125 15 L150 20 L175 8 L200 12"
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="[stroke-dasharray:300] [stroke-dashoffset:300] animate-[shimmer_2.5s_ease-out_forwards]"
      style={{ animation: "fade-in 1.2s ease-out forwards" }}
    />
    <path
      d="M0 40 L25 35 L50 38 L75 22 L100 28 L125 15 L150 20 L175 8 L200 12 L200 50 L0 50 Z"
      fill="hsl(var(--primary))"
      opacity="0.1"
    />
  </svg>
);

const BuiltFor = () => {
  return (
    <section className="container py-20">
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-3xl md:text-5xl font-extrabold text-foreground">
          Built for <span className="text-gradient-flag">Sellers, Farmers & Partners</span>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Tools that empower every player in Cameroon's economy — from rural growers to urban logistics partners.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Seller Dashboard */}
        <div className="rounded-3xl bg-card border border-border p-6 shadow-card hover-lift animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">Seller Dashboard</h3>
              <p className="text-xs text-muted-foreground">Sales This Month</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3" /> +25%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-foreground mt-2">F245,000.00</div>
          <Sparkline />
          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div className="rounded-xl bg-muted p-3">
              <Package className="h-4 w-4 text-primary" />
              <div className="font-bold mt-1">156</div>
              <div className="text-[10px] text-muted-foreground">Orders</div>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <div className="font-bold mt-1">42</div>
              <div className="text-[10px] text-muted-foreground">Products</div>
            </div>
          </div>
          <a href="#" className="story-link mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
            Go to Dashboard <ArrowRight className="h-3 w-3" />
          </a>
        </div>

        {/* Farmer */}
        <div className="group rounded-3xl bg-card border border-border overflow-hidden shadow-card hover-lift animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <img src={farmer} alt="Cameroonian farmer holding fresh produce" loading="lazy" className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="p-6">
            <h3 className="font-bold text-foreground">Farmer Marketplace</h3>
            <p className="text-xs text-muted-foreground mb-3">Sell directly to thousands of buyers.</p>
            <ul className="text-xs space-y-1 text-foreground/80">
              <li>✓ Add Products</li>
              <li>✓ View Orders</li>
              <li>✓ Track Earnings</li>
            </ul>
            <a href="#" className="story-link mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Go to Marketplace <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Logistics */}
        <div className="rounded-3xl bg-card border border-border p-6 shadow-card hover-lift animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">Logistics Partner</h3>
              <p className="text-xs text-muted-foreground">Deliveries This Week</p>
            </div>
            <div className="text-2xl font-extrabold text-primary">128</div>
          </div>
          <Sparkline />
          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div className="rounded-xl bg-muted p-3">
              <div className="text-[10px] text-muted-foreground">Active Deliveries</div>
              <div className="font-bold mt-1">34</div>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <div className="text-[10px] text-muted-foreground">Completed</div>
              <div className="font-bold mt-1">94</div>
            </div>
          </div>
          <a href="#" className="story-link mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
            Go to Logistics Portal <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default BuiltFor;