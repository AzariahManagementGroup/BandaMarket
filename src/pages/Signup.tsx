import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  ShoppingCart, Store, Sprout, Wrench, Truck, Globe2, Building2,
  ShieldCheck, Wallet, MapPin, TrendingUp, Eye, EyeOff, ArrowRight, Loader2,
} from "lucide-react";
import logo from "@/assets/camemark-logo.png";
import map from "@/assets/cameroon-map.png";

import { getApiUrl } from "@/config";

const COUNTRY_REGIONS: Record<string, string[]> = {
  "Cameroon": ["Adamawa","Centre","East","Far North","Littoral","North","Northwest","South","Southwest","West"],
  "Nigeria": ["Lagos","Abuja","Kano","Rivers","Oyo","Other"],
  "Chad": ["N'Djamena","Moundou","Sarh","Abéché","Other"],
  "Gabon": ["Estuaire","Haut-Ogooué","Moyen-Ogooué","Ngounié","Other"],
  "France": ["Île-de-France","Auvergne-Rhône-Alpes","Nouvelle-Aquitaine","Occitanie","Other"],
  "USA": ["California","Texas","New York","Florida","Illinois","Other"],
  "Other": ["Other"]
};
const ROLES = [
  { id: "buyer", label: "Buyer", icon: ShoppingCart },
  { id: "seller", label: "Seller", icon: Store },
  { id: "farmer", label: "Farmer / Cooperative", icon: Sprout },
  { id: "service", label: "Service Provider", icon: Wrench },
  { id: "logistics", label: "Logistics Partner", icon: Truck },
  { id: "diaspora", label: "Diaspora Buyer", icon: Globe2 },
  { id: "org", label: "Organization", icon: Building2 },
];

const schema = z.object({
  fullName: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(6, "Invalid phone").max(20),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirm: z.string(),
  country: z.string().min(1, "Select country"),
  region: z.string().min(1, "Select region"),
  city: z.string().trim().min(1, "City required").max(100),
  role: z.string().min(1, "Pick a role"),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

const Signup = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [agree, setAgree] = useState({ tos: false, wallet: false, privacy: false });
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", confirm: "",
    country: "Cameroon", region: "", city: "", role: "buyer", referral: "",
    phoneCode: "+237", currency: "XAF"
  });

  useEffect(() => {
    document.title = "Sign Up — CameMark | Cameroon's Digital Marketplace";
    
    // Auto-fill referral code from URL parameter ?ref=...
    const refParam = searchParams.get("ref") || searchParams.get("referral");
    if (refParam) {
      setForm(f => ({ ...f, referral: refParam }));
      toast({ title: `Referral code detected!`, description: `Referred by: ${refParam}` });
    }

    // Geo-detection for country and currency
    const detectLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.country_name) {
          const country = data.country_name;
          const phoneCode = data.country_calling_code || "+237";
          const currency = data.currency || "XAF";
          
          setForm(f => ({ 
            ...f, 
            country: COUNTRY_REGIONS[country] ? country : "Other",
            phoneCode,
            currency
          }));
          
          toast({ title: `Location detected: ${country}`, description: `Setting currency to ${currency}` });
        }
      } catch (err) {
        console.error("Geo-detection failed:", err);
      }
    };
    
    detectLocation();
  }, [searchParams]);

  const handle = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCountryChange = (v: string) => {
    // Simple mapping for common countries' calling codes if needed, 
    // but we'll let user edit the code if they want or rely on initial detection
    setForm((f) => ({ ...f, country: v, region: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree.tos || !agree.wallet || !agree.privacy) {
      toast({ title: "Please accept all agreements", variant: "destructive" });
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: `${form.phoneCode}${form.phone}`,
          country: form.country,
          region: form.region,
          city: form.city,
          role: form.role,
          referralCode: form.referral,
          language: i18n.language,
          preferredCurrency: form.currency
        })
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Unable to connect to PHP API on Namecheap. Please ensure public/.htaccess and public/api/index.php are uploaded.");
      }

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast({ title: data.error || "Signup failed", variant: "destructive" });
        return;
      }

      if (data.requires_otp) {
        setRequiresOtp(true);
        setOtpEmail(form.email);
        toast({ title: "OTP sent to your email. Please verify." });
        return;
      }

      localStorage.setItem("camemark_token", data.token);
      localStorage.setItem("camemark_user", JSON.stringify(data.user));

      if (form.referral) {
        try {
          fetch(getApiUrl("/api/referrals"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "claim",
              refCode: form.referral,
              newUserId: data.user?.id,
              newUserName: data.user?.fullName || form.fullName,
              newUserEmail: data.user?.email || form.email
            })
          });
        } catch (e) {}
      }

      toast({ title: "Account created successfully!" });
      navigate("/dashboard");
    } catch (err: any) {
      setLoading(false);
      toast({ title: err.message || "Failed to connect to server", variant: "destructive" });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/auth/verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpEmail,
          otp: otpCode,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP code");

      localStorage.setItem("camemark_token", data.token);
      localStorage.setItem("camemark_user", JSON.stringify(data.user));

      if (form.referral) {
        try {
          fetch(getApiUrl("/api/referrals"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "claim",
              refCode: form.referral,
              newUserId: data.user?.id,
              newUserName: data.user?.fullName || form.fullName,
              newUserEmail: data.user?.email || form.email
            })
          });
        } catch (e) {}
      }

      toast({ title: "OTP verified successfully! Welcome." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: err.message || "OTP verification failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    toast({ title: "Google Auth is temporarily disabled during migration.", variant: "destructive" });
  };

  const benefits = t("signup.benefits", { returnObjects: true }) as string[];
  const benefitDesc = t("signup.benefitDesc", { returnObjects: true }) as string[];
  const benefitIcons = [ShieldCheck, Wallet, MapPin, TrendingUp];

  return (
    <div className="min-h-screen bg-leaf relative overflow-hidden">
      {/* Floating background blobs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl animate-float" />
      <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-secondary/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      {/* Mini header */}
      <header className="container py-5 flex items-center justify-between animate-fade-in relative z-10">
        <Link to="/" className="flex items-center gap-2 group hover-scale relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-colors animate-pulse" />
          <img src={logo} alt="CameMark Logo — Cameroon's Premier Digital Marketplace and Regional Trading Hub" className="h-12 w-auto animate-float drop-shadow-xl relative z-10" />
        </Link>
        <Link to="/" className="text-sm font-semibold text-primary story-link">← Home</Link>
      </header>

      <main className="container pb-16 grid gap-10 lg:grid-cols-2 items-start">
        {/* Left: brand panel */}
        <section className="space-y-6 animate-fade-in-right">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 backdrop-blur px-4 py-1.5 text-xs font-semibold text-primary">
            🇨🇲 {t("hero.badge")}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            {t("signup.title")}{" "}
            <span className="gradient-flag-anim">{t("signup.brand")}</span>
          </h1>
          <p className="text-muted-foreground max-w-md">{t("signup.sub")}</p>

          <div className="relative rounded-3xl overflow-hidden border border-border bg-card/60 backdrop-blur p-4 shadow-card hover-lift">
            <img src={map} alt="Cameroon regions map" className="w-full h-56 object-contain animate-float" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {benefits.map((b, i) => {
              const Icon = benefitIcons[i];
              return (
                <div
                  key={b}
                  className="rounded-xl bg-card border border-border p-4 card-tilt animate-scale-in"
                  style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                >
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-bold">{b}</div>
                  <p className="text-xs text-muted-foreground mt-1">{benefitDesc[i]}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: form panel */}
        <section className="rounded-3xl bg-card border border-border shadow-elegant p-6 md:p-8 animate-scale-in">
          {requiresOtp ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold">Verify Your Email</h2>
              <p className="text-sm text-muted-foreground mb-6">Enter the 6-digit OTP sent to {otpEmail}</p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">6-Digit Security Code</Label>
                  <Input 
                    type="text" 
                    placeholder="123456" 
                    maxLength={6}
                    required 
                    className="h-12 border-border rounded-xl focus-visible:ring-primary transition-all tracking-widest text-lg font-bold text-center"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary-glow text-primary-foreground rounded-xl font-bold transition-all hover-lift"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify OTP & Complete Signup"}
                </Button>

                <button 
                  type="button"
                  onClick={() => setRequiresOtp(false)}
                  className="w-full text-xs font-bold text-muted-foreground hover:text-foreground transition-colors pt-2"
                >
                  ← Back to Signup
                </button>
              </form>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold">{t("signup.panelTitle")}</h2>
              <p className="text-sm text-muted-foreground mb-6">{t("signup.panelSub")}</p>

              <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("signup.fullName")}>
                <Input value={form.fullName} onChange={(e) => handle("fullName", e.target.value)} placeholder={t("signup.placeholders.name")} required />
              </Field>
              <Field label={t("signup.phone")}>
                <div className="flex gap-2">
                  <Input 
                    value={form.phoneCode} 
                    onChange={(e) => handle("phoneCode", e.target.value)} 
                    className="w-20 text-xs font-semibold px-2"
                    placeholder="+237"
                  />
                  <Input 
                    value={form.phone} 
                    onChange={(e) => handle("phone", e.target.value)} 
                    placeholder="612345678" 
                    required 
                    className="flex-1"
                  />
                </div>
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("signup.email")}>
                <Input type="email" value={form.email} onChange={(e) => handle("email", e.target.value)} placeholder={t("signup.placeholders.email")} required />
              </Field>
              <Field label={t("signup.password")}>
                <div className="relative">
                  <Input type={showPwd ? "text" : "password"} value={form.password} onChange={(e) => handle("password", e.target.value)} placeholder={t("signup.placeholders.pwd")} required />
                  <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </div>

            <Field label={t("signup.confirm")}>
              <Input type={showPwd ? "text" : "password"} value={form.confirm} onChange={(e) => handle("confirm", e.target.value)} placeholder={t("signup.placeholders.confirm")} required />
            </Field>

            <div className="grid sm:grid-cols-3 gap-4">
              <Field label={t("signup.country")}>
                <Select value={form.country} onValueChange={handleCountryChange}>
                  <SelectTrigger className="transition-all focus:ring-primary/50 hover:border-primary/50"><SelectValue placeholder={t("signup.placeholders.country")} /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {Object.keys(COUNTRY_REGIONS).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("signup.region")}>
                <Select value={form.region} onValueChange={(v) => handle("region", v)}>
                  <SelectTrigger className="transition-all focus:ring-primary/50 hover:border-primary/50"><SelectValue placeholder={t("signup.placeholders.region")} /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {(COUNTRY_REGIONS[form.country] || []).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("signup.city")}>
                <Input value={form.city} onChange={(e) => handle("city", e.target.value)} placeholder={t("signup.placeholders.city")} required />
              </Field>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">{t("signup.role")}</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => {
                  const active = form.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handle("role", r.id)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold border transition-smooth hover-scale ${
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-card"
                          : "bg-card border-border text-foreground hover:border-primary/40"
                      }`}
                    >
                      <r.icon className="h-3.5 w-3.5" />
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("signup.language")}>
                <div className="flex gap-2">
                  {[{code:"en",label:"English"},{code:"fr",label:"Français"}].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => i18n.changeLanguage(l.code)}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold border transition-smooth ${
                        i18n.language?.startsWith(l.code)
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border hover:bg-primary/5"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={t("signup.referral")}>
                <Input value={form.referral} onChange={(e) => handle("referral", e.target.value)} placeholder={t("signup.placeholders.referral")} />
              </Field>
            </div>

            <div className="space-y-2 pt-2">
              <CheckboxRow checked={agree.tos} onChange={(v) => setAgree((a) => ({ ...a, tos: v }))} label={t("signup.tos")} />
              <CheckboxRow checked={agree.wallet} onChange={(v) => setAgree((a) => ({ ...a, wallet: v }))} label={t("signup.wallet")} />
              <CheckboxRow checked={agree.privacy} onChange={(v) => setAgree((a) => ({ ...a, privacy: v }))} label={t("signup.privacy")} />
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full bg-primary hover:bg-primary-glow text-primary-foreground shadow-elegant group">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("signup.create")} <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">{t("signup.or")}</span></div>
            </div>

            <Button type="button" variant="outline" size="lg" onClick={google} className="w-full border-border hover:bg-primary/5 hover-scale">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              {t("signup.google")}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              {t("signup.have")}{" "}
            <Link to="/signin" className="text-primary font-semibold story-link">{t("signup.signin")}</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold text-foreground/80">{label}</Label>
    {children}
  </div>
);

const CheckboxRow = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label className="flex items-start gap-2 text-xs text-foreground/80 cursor-pointer">
    <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5" />
    <span>{label}</span>
  </label>
);

export default Signup;
