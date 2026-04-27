import { UserPlus, Wallet, ShoppingBag, Truck } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Create Account", desc: "Sign up in minutes and verify your identity." },
  { icon: Wallet, title: "Open Wallet", desc: "Fund your CamRency wallet and get your CaMark Card." },
  { icon: ShoppingBag, title: "Buy or Sell", desc: "List products, bargain securely and pay safely." },
  { icon: Truck, title: "Deliver & Grow", desc: "We deliver across regions. You grow your business." },
];

const HowItWorks = () => {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card animate-fade-in">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">How It Works</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {steps.map((s, i) => (
          <div key={s.title} className="group relative rounded-2xl border border-border p-4 hover-lift">
            <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold grid place-items-center shadow-glow">
              {i + 1}
            </div>
            <s.icon className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-smooth" />
            <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;