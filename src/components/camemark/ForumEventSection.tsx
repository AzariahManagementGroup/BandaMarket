import { useState } from "react";
import { 
  Calendar, MapPin, Users, Award, DollarSign, Building2, 
  ArrowRight, CheckCircle2, ChevronRight, Download, Globe, 
  Sparkles, FileText, Briefcase, Target, ShieldCheck, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

const ForumEventSection = () => {
  const [activeDay, setActiveDay] = useState(1);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    category: "Delegate ($50 USD)"
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`🎉 Registration confirmed for ${registerForm.name}! Pass details sent to ${registerForm.email}.`);
    setIsRegisterOpen(false);
    setRegisterForm({ name: "", email: "", phone: "", organization: "", category: "Delegate ($50 USD)" });
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
        
        {/* Event Header Banner */}
        <div className="text-center max-w-4xl mx-auto space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-emerald-300 uppercase tracking-widest shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> REPUBLIC OF CAMEROON • MINCOMMERCE • SPARK FOUNDATION
          </div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            CAMEROON E-COMMERCE FORUM <span className="text-amber-400 underline decoration-amber-400/40">2026</span>
          </h2>
          
          <p className="text-lg md:text-xl font-bold text-emerald-100 max-w-3xl mx-auto leading-relaxed">
            "Accelerating Digital Trade – Linking Local Enterprise to Global Markets"
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs md:text-sm font-extrabold text-emerald-200">
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
              <Calendar className="h-4 w-4 text-amber-400" /> 18th – 20th November 2026
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
              <MapPin className="h-4 w-4 text-amber-400" /> Yaoundé Conference Center, Cameroon
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
              <Building2 className="h-4 w-4 text-amber-400" /> Organizer: Spark Foundation
            </span>
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
        <DialogContent className="max-w-md bg-white text-gray-900 rounded-3xl p-6">
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
              <label className="text-xs font-bold text-gray-500 uppercase">Pass Type</label>
              <select 
                className="w-full h-10 rounded-xl bg-gray-50 px-3 text-xs border border-gray-200 font-bold"
                value={registerForm.category}
                onChange={(e) => setRegisterForm({ ...registerForm, category: e.target.value })}
              >
                <option value="Delegate ($50 USD)">Delegate Pass ($50 USD / FCFA 30,000)</option>
                <option value="Exhibitor Booth ($1,000 USD)">Exhibitor Booth ($1,000 USD / FCFA 600,000)</option>
                <option value="SME Village Subsidized Booth">SME Subsidized Booth (MINPMEESA Grant)</option>
                <option value="VIP / Investor Pass ($300 USD)">VIP / Investor Pass ($300 USD)</option>
                <option value="Media Accreditation">Media Accreditation (Free)</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-bold h-11 rounded-xl text-xs mt-2">
              Confirm & Reserve Pass
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ForumEventSection;
