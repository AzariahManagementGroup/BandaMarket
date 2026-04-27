import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Globe, Menu, ChevronDown } from "lucide-react";
import logo from "@/assets/camemark-logo.png";

const links = [
  { label: "Home", href: "#" },
  { label: "Marketplace", href: "#marketplace" },
  { label: "Regions", href: "#regions", caret: true },
  { label: "Wallet", href: "#wallet" },
  { label: "Logistics", href: "#logistics" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-smooth ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-card"
          : "bg-background/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="container flex h-16 md:h-20 items-center justify-between gap-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group shrink-0">
          <img
            src={logo}
            alt="CameMark — Cameroon's Digital Marketplace logo"
            className="h-9 md:h-11 w-auto transition-smooth group-hover:scale-105"
          />
        </a>

        {/* Desktop full menu */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="story-link inline-flex items-center gap-1 text-foreground/85 hover:text-primary transition-smooth"
            >
              {l.label}
              {l.caret && <ChevronDown className="h-3.5 w-3.5 opacity-70" />}
            </a>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <button className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-primary transition-smooth border border-border rounded-md px-2.5 py-1.5">
            <Globe className="h-4 w-4" />
            EN
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex border-primary/30 text-foreground hover:bg-primary/5"
          >
            Sign In
          </Button>
          <Button
            size="sm"
            className="hidden sm:inline-flex bg-primary hover:bg-primary-glow shadow-card text-primary-foreground"
          >
            Get Started
          </Button>

          {/* Mobile trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-card hover:bg-primary/5 transition-smooth"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-primary" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88%] sm:w-96 p-0 flex flex-col">
              {/* Mobile header */}
              <div className="px-5 pt-5 pb-4 border-b border-border bg-leaf">
                <img src={logo} alt="CameMark logo" className="h-10 w-auto mb-3" />
                {/* Breadcrumb on mobile */}
                <Breadcrumb>
                  <BreadcrumbList className="text-xs">
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#" className="text-primary font-semibold">
                        CameMark
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#" className="text-foreground/70">
                        Menu
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-foreground">Home</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Mobile nav links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                  {links.map((l, i) => (
                    <li
                      key={l.label}
                      className="animate-fade-in-right"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <a
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-foreground/85 hover:bg-primary/5 hover:text-primary transition-smooth"
                      >
                        {l.label}
                        {l.caret && <ChevronDown className="h-4 w-4 opacity-60" />}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 px-4">
                  <button className="inline-flex items-center gap-2 text-xs font-medium text-foreground/70 border border-border rounded-md px-3 py-1.5">
                    <Globe className="h-4 w-4" /> EN
                  </button>
                </div>
              </nav>

              {/* Mobile CTA footer */}
              <div className="border-t border-border p-4 space-y-2 bg-card">
                <Button
                  variant="outline"
                  className="w-full border-primary/30 hover:bg-primary/5"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
                  onClick={() => setOpen(false)}
                >
                  Get Started
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
