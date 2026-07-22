import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Menu, ChevronDown } from "lucide-react";
import logo from "@/assets/camemark-logo.png";

const LANGS = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

const REGIONS = ["Adamawa","Centre","East","Far North","Littoral","North","Northwest","South","Southwest","West"];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchRole(data.session.user.id);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
      else setRole(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("role, signup_role").eq("id", userId).single();
    const finalRole = data?.role || data?.signup_role || "buyer";
    setRole(finalRole);
  };

  const links = [
    { key: "home", label: t("nav.home"), href: "/" },
    { key: "marketplace", label: t("nav.marketplace"), href: "/market-zone" },
    { key: "regions", label: t("nav.regions"), href: "#regions", caret: true },
    { key: "wallet", label: t("nav.wallet"), href: "#wallet" },
    { key: "logistics", label: t("nav.logistics"), href: "#logistics" },
    { key: "about", label: t("nav.about"), href: "#about" },
    { key: "contact", label: t("nav.contact"), href: "#contact" },
  ];

  const current = LANGS.find((l) => l.code === i18n.language?.split("-")[0]) ?? LANGS[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.lang = current.code;
    document.documentElement.dir = current.code === "ar" ? "rtl" : "ltr";
  }, [current.code]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-smooth ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-card"
          : "bg-background/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="container flex h-24 md:h-28 items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group shrink-0 relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-colors animate-pulse" />
          <img
            src={logo}
            alt="CameMark Logo — Cameroon's Premier Digital Marketplace and Regional Trading Hub"
            className="h-24 md:h-32 w-auto animate-float drop-shadow-xl group-hover:scale-110 transition-all duration-500 relative z-10"
          />
        </a>

        {/* Desktop full menu */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold">
          {links.map((l) => {
            if (l.key === "regions") {
              return (
                <DropdownMenu key={l.key}>
                  <DropdownMenuTrigger className="story-link inline-flex items-center gap-1 text-foreground/85 hover:text-primary transition-smooth outline-none">
                    {l.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover z-50">
                    {REGIONS.map((r) => (
                      <DropdownMenuItem key={r} onClick={() => navigate(`/market-zone?region=${r}`)}>
                        {r}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            return (
              <a
                key={l.key}
                href={l.href}
                className="story-link inline-flex items-center gap-1 text-foreground/85 hover:text-primary transition-smooth"
              >
                {l.label}
              </a>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-primary transition-smooth border border-border rounded-md px-2.5 py-1.5">
              <Globe className="h-4 w-4" />
              {current.code.toUpperCase()}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover z-50">
              {LANGS.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => {
                  localStorage.setItem('camemark_lang', l.code);
                  i18n.changeLanguage(l.code);
                }}>
                  <span className="mr-2">{l.flag}</span>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {session ? (
            <div className="flex items-center gap-2">
              {(role === "admin" || role === "super_admin" || session?.user?.email === "info@azariahmg.com") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="hidden sm:inline-flex border-primary/30 text-primary hover:bg-primary/5 font-bold text-xs uppercase tracking-tight"
                  onClick={() => navigate("/admin")}
                >
                  Admin
                </Button>
              )}
              <Button
                size="sm"
                className="hidden sm:inline-flex bg-primary hover:bg-primary-glow shadow-card text-primary-foreground animate-pulse-glow"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex border-primary/30 text-foreground hover:bg-primary/5"
                onClick={() => navigate("/signin")}
              >
                {t("nav.signin")}
              </Button>
              <Button
                size="sm"
                className="hidden sm:inline-flex bg-primary hover:bg-primary-glow shadow-card text-primary-foreground animate-pulse-glow"
                onClick={() => navigate("/signup")}
              >
                {t("nav.getStarted")}
              </Button>
            </>
          )}

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
              <div className="px-5 pt-5 pb-4 border-b border-border bg-leaf relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 blur-xl animate-pulse" />
                <img src={logo} alt="CameMark Logo — Cameroon's Premier Digital Marketplace and Regional Trading Hub" className="h-24 w-auto mb-3 animate-float drop-shadow-md relative z-10" />
                {/* Breadcrumb on mobile */}
                <Breadcrumb className="relative z-10">
                  <BreadcrumbList className="text-[10px] font-bold">
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/" className="text-emerald-900">
                        HOME
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-emerald-900/30" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-emerald-800 opacity-60">MARKET</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Mobile nav links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                  {links.map((l, i) => (
                    <li key={l.key}>
                      {l.href.startsWith("/") ? (
                        <Link
                          to={l.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-foreground/85 hover:bg-primary/5 hover:text-primary transition-smooth"
                        >
                          {l.label}
                          {l.caret && <ChevronDown className="h-4 w-4 opacity-60" />}
                        </Link>
                      ) : (
                        <a
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-foreground/85 hover:bg-primary/5 hover:text-primary transition-smooth"
                        >
                          {l.label}
                          {l.caret && <ChevronDown className="h-4 w-4 opacity-60" />}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 px-4 space-y-2">
                  <div className="text-[11px] uppercase font-bold text-muted-foreground">Language</div>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          localStorage.setItem('camemark_lang', l.code);
                          i18n.changeLanguage(l.code);
                        }}
                        className={`text-left text-xs font-semibold border rounded-lg px-3 py-2 transition-smooth ${
                          current.code === l.code
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-primary/5"
                        }`}
                      >
                        <span className="mr-1.5">{l.flag}</span>{l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </nav>

              {/* Mobile CTA footer */}
              <div className="border-t border-border p-4 space-y-2 bg-card">
                {session ? (
                  <div className="space-y-2">
                    {(role === "admin" || role === "super_admin") && (
                      <Button
                        variant="outline"
                        className="w-full border-primary/30 text-primary hover:bg-primary/5 font-bold"
                        onClick={() => { setOpen(false); navigate("/admin"); }}
                      >
                        Admin Panel
                      </Button>
                    )}
                    <Button
                      className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
                      onClick={() => { setOpen(false); navigate("/dashboard"); }}
                    >
                      Dashboard
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full border-primary/30 hover:bg-primary/5"
                      onClick={() => { setOpen(false); navigate("/signin"); }}
                    >
                      {t("nav.signin")}
                    </Button>
                    <Button
                      className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
                      onClick={() => { setOpen(false); navigate("/signup"); }}
                    >
                      {t("nav.getStarted")}
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
