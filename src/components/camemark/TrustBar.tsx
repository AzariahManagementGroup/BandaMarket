import { ShieldCheck, BadgeCheck, Flag, Globe2, Users } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Secure Payments", desc: "Bank-grade security & encryption." },
  { icon: BadgeCheck, title: "Verified Merchants", desc: "Every seller is verified for your protection." },
  { icon: Flag, title: "Regional Pride", desc: "Built in Cameroon, for Cameroonians." },
  { icon: Globe2, title: "Cross-Border Potential", desc: "Tap into African markets through AfCFTA." },
  { icon: Users, title: "Job Creation", desc: "Empowering communities and growing livelihoods." },
];

const TrustBar = () => {
  return (
    <section className="bg-hero text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_70%,white,transparent_40%)]" />
      <div className="container py-10 relative">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((it, i) => (
            <div key={it.title} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground grid place-items-center shrink-0 shadow-glow">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">{it.title}</div>
                <div className="text-xs text-primary-foreground/80">{it.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;