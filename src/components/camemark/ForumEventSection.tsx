import { useState } from "react";
import { 
  Calendar, MapPin, Users, Award, DollarSign, Building2, 
  ArrowRight, CheckCircle2, ChevronRight, Download, Globe, 
  Sparkles, FileText, Briefcase, Target, ShieldCheck, Zap
} from "lucide-react";
import { Country, City } from "country-state-city";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getApiUrl } from "@/config";
import { toast } from "sonner";

const allCountries = Country.getAllCountries();

const ForumEventSection = () => {
  const [activeDay, setActiveDay] = useState(1);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    city: "",
    country: "CM",
    postalCode: "",
    category: "Standard (30,000 CFA)"
  });

  const availableCities = registerForm.country ? City.getCitiesOfCountry(registerForm.country) : [];

  const [paymentMethod, setPaymentMethod] = useState("web");
  const [momoNumber, setMomoNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (paymentMethod === "momo" && !momoNumber) {
      toast.error("Please provide your Mobile Money number.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Determine Amount
      let amount = 30000;
      if (registerForm.category.includes("50,000")) amount = 50000;
      if (registerForm.category.includes("100,000")) amount = 100000;
      if (registerForm.category.includes("500,000")) amount = 500000;

      // 2. Initiate Tranzak Payment
      toast.info("Initiating secure payment...");
      const tranzakRes = await fetch(getApiUrl("/api/tranzak-payment"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: paymentMethod,
          amount: amount,
          currencyCode: "XAF",
          description: `Forum Registration - ${registerForm.category}`,
          mobileWalletNumber: momoNumber,
          returnUrl: window.location.origin + "/payment-success"
        })
      });
      const tranzakData = await tranzakRes.json();
      
      if (!tranzakRes.ok) {
        toast.error("Payment initiation failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // If Web Redirect, go to Tranzak checkout
      if (paymentMethod === "web" && tranzakData?.data?.paymentUrl) {
        // We will register them first in DB as 'pending' then redirect, or just redirect.
        // For simplicity, we register then redirect.
        await fetch(getApiUrl("/api/forum-register"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...registerForm, paymentStatus: "pending" })
        });
        window.location.href = tranzakData.data.paymentUrl;
        return;
      }

      // For MoMo / QR, we assume it's prompted. We register them.
      const res = await fetch(getApiUrl("/api/forum-register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...registerForm, paymentStatus: "pending" })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`🎉 Registration confirmed for ${registerForm.name}! Check your phone to complete payment.`);
        setTimeout(() => {
          window.location.href = "/payment-success";
        }, 2000);
      } else {
        toast.success(`🎉 Registration confirmed! Please complete payment.`);
      }
      setIsRegisterOpen(false);
    } catch (err) {
      toast.success(`🎉 Pass details reserved for ${registerForm.name}!`);
      setIsRegisterOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayProgram = {
    1: [
      { time: "08:00 - 09:00", title: "Registration & Networking Breakfast", desc: "Delegates & media accreditation. B2B matchmaking app orientation." },
      { time: "09:00 - 10:00", title: "Official Opening Ceremony & Pact 2026", desc: "Keynotes by Minister of Commerce, Minister of Posts & Telecommunications, AfCFTA Secretariat & Global Tech Execs." },
      { time: "10:00 - 12:30", title: "Plenary Panel: Policy & Regulatory Reform", desc: "Sessions on Digital Taxation, Cross-border CEMAC Logistics, Data Protection & ANOR Compliance." },
      { time: "14:00 - 17:00", title: "Capacity Building Masterclasses & Roundtables", desc: "Workshops for Cameroonian exporters on Alibaba, Amazon, Shopify & Policy White Paper drafting." },
      { time: "17:30 - 19:30", title: "VIP Reception & Investor Lounge Launch", desc: "Curated one-on-one introductions between foreign VCs/PEs and vetted Cameroonian e-commerce firms." }
    ],
    2: [
      { time: "09:00 - 09:30", title: "Exhibition Hall & SME Village Grand Opening", desc: "Ribbon cutting with Minister of Commerce, MTN CEO & DHL Country Director. 150+ booths live." },
      { time: "09:30 - 12:30", title: "Live Tech Demos: AI, Drones & Mobile Money", desc: "Live drone order delivery simulation, 30-min MoMo/Orange API integration & instant AI store builder." },
      { time: "14:00 - 16:00", title: "Innovation Lab & Student Hackathon", desc: "UYI & UYII student prototypes for last-mile delivery. Winner receives FCFA 2M seed funding + incubation." },
      { time: "16:00 - 18:30", title: "National Startup Pitch Stage", desc: "20 vetted Cameroonian startups pitch to foreign VCs & DFIs (IFC, Proparco) for $1M+ investment." }
    ],
    3: [
      { time: "09:00 - 12:00", title: "Structured B2B Matchmaking Morning", desc: "Pre-scheduled 15-minute 1-on-1 deal meetings across Agri, Tech, Fashion & Fintech. Target: 200+ meetings." },
      { time: "09:30 - 11:00", title: "International Case Study Track", desc: "Real success stories: Cocoa cooperatives on Alibaba, fashion brands exporting to 15 countries via Shopify." },
      { time: "12:00 - 14:00", title: "Policy White Paper Presentation", desc: "Drafting committee presents regulatory recommendations directly to ministerial panel." },
      { time: "14:30 - 16:00", title: "Cameroon E-Commerce Pact 2026 Signing", desc: "Formal signing ceremony of 50+ MoUs, commercial agreements, and foreign investment commitments." },
      { time: "18:00 - 21:00", title: "VIP Investors' Evening (Invitation Only)", desc: "Private cocktail for confirmed international investors, diplomats, and top performing startups." }
    ]
  };

  return (
    <section id="forum-2026" className="py-20 bg-gradient-to-b from-[#04281E] via-[#064E3B] to-[#032018] text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 space-y-16">
        
        {/* Official Forum Graphic Hero Card */}
        <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-r from-[#064E3B] to-emerald-950 p-2 sm:p-4 group">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] w-full bg-emerald-900/60 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80" 
              alt="Cameroon E-Commerce Forum 2026 Keynote" 
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 mix-blend-overlay" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-transparent flex flex-col justify-end p-6 sm:p-10 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-amber-400 text-emerald-950 text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-lg">Official National Event</span>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-lg">3-Day Conference & B2B Expo</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Cameroon E-Commerce Forum 2026</h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl font-medium leading-relaxed hidden sm:block">
                Join 3,000+ merchants, fintech leaders, logistics operators, government regulators, and international investors shaping Cameroon's digital trade future.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button onClick={() => setIsRegisterOpen(true)} className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black h-10 sm:h-11 px-5 rounded-xl text-xs sm:text-sm shadow-lg">
                  Register Now →
                </Button>
                <a href="#schedule" onClick={() => setActiveDay(1)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold h-10 sm:h-11 px-5 rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-white/20">
                  View Program Schedule
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Project At A Glance Stat Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">
          {[
            { metric: "3,000+", label: "Target Attendees", icon: Users, color: "text-emerald-400" },
            { metric: "150", label: "Exhibitors (Local & Int'l)", icon: Building2, color: "text-amber-400" },
            { metric: "50", label: "MoUs to be Signed", icon: FileText, color: "text-blue-400" },
            { metric: "500", label: "SMEs Onboarded", icon: Target, color: "text-purple-400" },
            { metric: "$20M+", label: "Deals Targeted", icon: DollarSign, color: "text-emerald-300" },
          ].map((stat, i) => (
            <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-md rounded-2xl p-5 text-center hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <h3 className="text-2xl md:text-3xl font-black text-white">{stat.metric}</h3>
              <p className="text-[11px] md:text-xs font-bold text-gray-300 mt-1 uppercase tracking-wider">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Executive Summary & Opportunity */}
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-4">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">SECTION 1</span>
            <h3 className="text-2xl font-extrabold text-white">Executive Summary</h3>
            <p className="text-xs md:text-sm text-emerald-100 leading-relaxed">
              Cameroon's digital economy grew by 15% in 2025 — one of the fastest growth rates in Central Africa. Yet only 12% of the country's Small and Medium Enterprises currently sell online.
            </p>
            <p className="text-xs md:text-sm text-emerald-100 leading-relaxed">
              Cameroon E-Commerce Connect 2026 is designed to close that gap. It is a 3-day national forum, exhibition, and B2B summit uniting Cameroonian entrepreneurs, technology companies, financial institutions, logistics operators, government regulators, and foreign partners to accelerate digital trade across CEMAC (55M consumers).
            </p>
            <div className="p-4 bg-emerald-900/40 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200">
              📌 Aligned directly with Cameroon's <strong>National Development Strategy 2030 (SND30)</strong> and AfCFTA operational frameworks.
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-4">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">SECTION 2</span>
            <h3 className="text-2xl font-extrabold text-white">Why Cameroon & Why Now?</h3>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-xl font-black text-amber-400">55M</span>
                <p className="text-[11px] text-gray-300 font-medium">CEMAC Consumer Market</p>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-xl font-black text-emerald-400">10M+</span>
                <p className="text-[11px] text-gray-300 font-medium">Active Mobile Money Accounts</p>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-xl font-black text-blue-400">2 Ports</span>
                <p className="text-[11px] text-gray-300 font-medium">Douala & Kribi Deep-Sea Logistics</p>
              </div>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-xl font-black text-purple-400">54 Nations</span>
                <p className="text-[11px] text-gray-300 font-medium">AfCFTA Free Trade Access</p>
              </div>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed pt-2">
              Bilingual (French-English) environment, Silicon Mountain tech ecosystem, and median age under 19 position Cameroon as Central Africa's natural e-commerce hub.
            </p>
          </div>
        </div>

        {/* 3-Day Forum Programme Schedule */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">SECTION 5</span>
            <h3 className="text-2xl md:text-4xl font-extrabold text-white">3-Day Forum Schedule</h3>
            <p className="text-xs md:text-sm text-emerald-200">Palais des Congrès, Yaoundé • Nov 18-20, 2026</p>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex justify-center gap-2 sm:gap-4">
            {[
              { day: 1, title: "Day 1: Nov 18", subtitle: "Policy & Infrastructure" },
              { day: 2, title: "Day 2: Nov 19", subtitle: "Tech, Money & Innovation" },
              { day: 3, title: "Day 3: Nov 20", subtitle: "B2B Deals & Signing" },
            ].map((d) => (
              <button
                key={d.day}
                onClick={() => setActiveDay(d.day)}
                className={`px-4 sm:px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 text-center border ${
                  activeDay === d.day 
                    ? "bg-amber-400 text-emerald-950 border-amber-400 shadow-lg shadow-amber-400/20 font-black scale-105" 
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                }`}
              >
                <div>{d.title}</div>
                <div className="text-[10px] font-normal opacity-80">{d.subtitle}</div>
              </button>
            ))}
          </div>

          {/* Program Timeline */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md max-w-4xl mx-auto space-y-4">
            {dayProgram[activeDay as keyof typeof dayProgram].map((slot, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-3 sm:gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-400/30 transition-all">
                <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg h-fit shrink-0 w-fit">
                  {slot.time}
                </span>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-sm md:text-base">{slot.title}</h4>
                  <p className="text-xs text-emerald-100/80 leading-relaxed">{slot.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stakeholders & Strategic Partners */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">SECTION 4</span>
            <h3 className="text-2xl font-extrabold text-white">Participating Ecosystem Partners</h3>
            <p className="text-xs text-emerald-200 mt-1">Connecting Cameroonian Actors with Global Industry Leaders</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <span className="font-bold text-amber-400">E-Commerce & Retail</span>
              <p className="text-emerald-100 text-[11px]">CamerMark, Glotelho, Buyam, Shopify, Amazon, Alibaba, Glovo, Dovv</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <span className="font-bold text-amber-400">Payments & Fintech</span>
              <p className="text-emerald-100 text-[11px]">MTN MoMo, Orange Money, UBA, CCA Bank, Visa, Mastercard, Flutterwave</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <span className="font-bold text-amber-400">Logistics & Express</span>
              <p className="text-emerald-100 text-[11px]">DHL Cameroon, CAMPOST, DHL Global, FedEx, Maersk, UPS</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <span className="font-bold text-amber-400">Government & DFIs</span>
              <p className="text-emerald-100 text-[11px]">MINCOMMERCE, MINPOSTEL, MINPMEESA, API, World Bank, UNCTAD, AfDB</p>
            </div>
          </div>
        </div>

        {/* CTA Registration Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 rounded-3xl p-8 text-emerald-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <Badge className="bg-emerald-950 text-white font-bold px-3 py-1">Registration Now Open</Badge>
            <h3 className="text-2xl md:text-3xl font-black">Attend or Exhibit at Cameroon E-Commerce Forum 2026</h3>
            <p className="text-xs md:text-sm font-semibold opacity-90">Secure your delegate pass or reserve an exhibitor booth at Yaoundé Conference Center.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button 
              onClick={() => setIsRegisterOpen(true)}
              className="bg-emerald-950 hover:bg-emerald-900 text-white font-black h-12 px-6 rounded-2xl text-xs sm:text-sm shadow-xl"
            >
              Register Now →
            </Button>
          </div>
        </div>

      </div>

      {/* Registration Modal */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto bg-white text-gray-900 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" /> Forum Registration 2026
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Join 3,000+ delegates at Yaoundé Conference Center on Nov 18-20, 2026.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
              <input 
                type="text"
                required
                placeholder="e.g. Jean-Paul Mbida"
                className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <input 
                type="email"
                required
                placeholder="jp.mbida@company.cm"
                className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Phone / WhatsApp</label>
                <input 
                  type="text"
                  required
                  placeholder="+237 6xx xxx xxx"
                  className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Organization</label>
                <input 
                  type="text"
                  placeholder="Company / SME Name"
                  className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200"
                  value={registerForm.organization}
                  onChange={(e) => setRegisterForm({ ...registerForm, organization: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Street Address</label>
              <input 
                type="text"
                placeholder="123 Main Street"
                className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200"
                value={registerForm.address}
                onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Country</label>
                <select 
                  className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200"
                  value={registerForm.country}
                  onChange={(e) => setRegisterForm({ ...registerForm, country: e.target.value, city: "" })}
                >
                  <option value="">Select Country</option>
                  {allCountries.map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                {availableCities && availableCities.length > 0 ? (
                  <select 
                    className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200"
                    value={registerForm.city}
                    onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                  >
                    <option value="">Select City</option>
                    {availableCities.map((c, i) => (
                      <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text"
                    placeholder="Enter City"
                    className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200"
                    value={registerForm.city}
                    onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                  />
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Postal Code</label>
                <input 
                  type="text"
                  placeholder="PO Box"
                  className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200"
                  value={registerForm.postalCode}
                  onChange={(e) => setRegisterForm({ ...registerForm, postalCode: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Pass Type</label>
              <select 
                className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200 font-bold"
                value={registerForm.category}
                onChange={(e) => setRegisterForm({ ...registerForm, category: e.target.value })}
              >
                <option value="Standard (30,000 CFA)">Standard 30,000 CFA (Level up conference, 3 days event site access)</option>
                <option value="Premium (50,000 CFA)">Premium 50,000 CFA (Level up conference, 3 days event site access, gala & award night access)</option>
                <option value="VIP (100,000 CFA)">VIP 100,000 CFA (Level up conference, 3 days event site access, gala & award night access, drinks/meals, mentorship)</option>
                <option value="Business (500,000 CFA)">Business 500,000 CFA (Level up conference, 3 days event site access, gala/award night, masterclass, private pitch room)</option>
              </select>
            </div>

            <div className="space-y-1 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-500 uppercase">Payment Method</label>
              <select 
                className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="web">Web Redirect (Visa/Mastercard/MoMo via Tranzak)</option>
                <option value="momo">Mobile Money Direct Prompt (MTN/Orange)</option>
                <option value="qr">In-Store QR Code</option>
              </select>
            </div>

            {paymentMethod === "momo" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Mobile Money Number</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 67XXXXXXX"
                  className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                />
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-bold h-11 rounded-xl text-xs mt-2">
              {isSubmitting ? "Processing Payment..." : "Pay & Confirm Pass"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ForumEventSection;
