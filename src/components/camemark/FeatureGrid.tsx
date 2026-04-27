import { ShoppingCart, Wallet, CreditCard, MessagesSquare, Sprout, Truck, Map, Globe2 } from "lucide-react";

const features = [
  { icon: ShoppingCart, title: "Marketplace", desc: "Buy and sell anything from farms to factories. Trusted. Verified. Local." },
  { icon: Wallet, title: "CamRency Wallet", desc: "Secure multi-currency wallet for fast, safe payments." },
  { icon: CreditCard, title: "CaMark Card", desc: "Spend anywhere with your CaMark Card — local and global access." },
  { icon: MessagesSquare, title: "Bargain & Negotiate", desc: "Chat, negotiate and close the best deals with confidence." },
  { icon: Sprout, title: "Farmers & Cooperatives", desc: "Empowering farmers with markets, tools and better prices." },
  { icon: Truck, title: "Logistics Network", desc: "Integrated delivery network across all 10 regions." },
  { icon: Map, title: "Regional Economic Blocs", desc: "Trade within and across Cameroon's 10 digital economic blocs." },
  { icon: Globe2, title: "AfCFTA Ready Trade", desc: "Access continental markets through AfCFTA pathways." },
];

const FeatureGrid = () => {
  return (
    <section className="container py-12">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="group relative rounded-2xl bg-card border border-border p-5 hover-lift animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">{f.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;