import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import logo from "@/assets/camemark-logo.png";
import africa from "@/assets/africa-map.png";

const cols = [
  { title: "Quick Links", items: ["Marketplace", "Regions", "Wallet (CamRency)", "CaMark Card"] },
  { title: "Logistics", items: ["For Farmers", "For Businesses", "Bargain & Negotiate"] },
  { title: "Company", items: ["About Us", "Our Mission", "Careers", "News & Updates"] },
  { title: "Support", items: ["Help Center", "Contact Us", "Terms & Conditions", "Privacy Policy"] },
];

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-14 grid gap-10 lg:grid-cols-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-background rounded-xl px-3 py-2 inline-flex">
            <img src={logo} alt="CameMark" className="h-8 w-auto" loading="lazy" />
          </div>
          <p className="text-sm text-primary-foreground/80 leading-relaxed max-w-xs">
            Cameroon's Digital Marketplace, Wallet & Trade Gateway. Empowering regions. Connecting Cameroon. Building a prosperous future.
          </p>
          <div className="flex gap-2">
            {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
              <a key={i} href="#" aria-label="Social link" className="h-9 w-9 rounded-full bg-primary-foreground/10 grid place-items-center hover:bg-secondary hover:text-secondary-foreground transition-smooth">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="text-sm font-bold mb-3">{c.title}</div>
            <ul className="space-y-2 text-sm text-primary-foreground/75">
              {c.items.map((i) => (
                <li key={i}><a href="#" className="hover:text-secondary transition-smooth">{i}</a></li>
              ))}
            </ul>
          </div>
        ))}
        <div className="rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 p-5 lg:col-span-1">
          <img src={africa} alt="Africa trade gateway" loading="lazy" className="w-20 h-auto mb-3 animate-float" />
          <div className="text-sm font-bold leading-tight">Trade Cameroon. Empower Africa.</div>
          <p className="text-xs text-primary-foreground/75 mt-2">Join thousands of traders and entrepreneurs building the future.</p>
          <Button size="sm" className="mt-3 bg-secondary text-secondary-foreground hover:bg-secondary/90">Get Started Today</Button>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-primary-foreground/70 gap-2">
          <span>© 2025 CameMark. All rights reserved.</span>
          <span>Made in Cameroon. Made for Africa. Made to Grow.</span>
          <span>Proudly Cameroonian 🇨🇲</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;