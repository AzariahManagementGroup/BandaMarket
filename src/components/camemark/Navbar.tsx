import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Menu } from "lucide-react";
import logo from "@/assets/camemark-logo.png";

const links = ["Home", "Marketplace", "Regions", "Wallet", "Logistics", "About", "Contact"];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-smooth ${
        scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border shadow-card" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <img src={logo} alt="CameMark logo" className="h-9 w-auto transition-smooth group-hover:scale-105" />
        </a>
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {links.map((l) => (
            <a key={l} href="#" className="story-link text-foreground/80 hover:text-primary transition-smooth">
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden md:inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-primary transition-smooth">
            <Globe className="h-4 w-4" />
            EN
          </button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">Sign In</Button>
          <Button size="sm" className="bg-primary hover:bg-primary-glow shadow-card">Get Started</Button>
          <button className="lg:hidden p-2 -mr-2" aria-label="Menu"><Menu className="h-5 w-5" /></button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;