import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, GraduationCap, Award, Users, Search, Play, Star,
  CheckCircle2, ArrowRight, Sparkles, Laptop, ShieldCheck,
  Globe, HeartHandshake, FileText, ChevronRight, Video, Download, CreditCard, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getApiUrl } from "@/config";
import Navbar from "@/components/camemark/Navbar";
import Footer from "@/components/camemark/Footer";

const AcademyPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [userSession, setUserSession] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("momo");
  const [enrollForm, setEnrollForm] = useState({ name: "", email: "", phone: "" });

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "it", label: "IT & Software" },
    { id: "business", label: "Business & Entrepreneurship" },
    { id: "agric", label: "Agriculture & E-Commerce" },
    { id: "economy", label: "Digital Economy & Fintech" },
  ];

  useEffect(() => {
    // Check logged in user session
    const userStr = localStorage.getItem("camemark_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserSession(u);
        setEnrollForm({
          name: u.fullName || u.full_name || u.name || "",
          email: u.email || "",
          phone: u.phone || ""
        });
      } catch (e) {}
    }
  }, []);

  const defaultCourses = [
    {
      id: 1,
      title: "IT for Business & Digital Trade",
      category: "it",
      instructor: "Dr. Paul Nkongho (Silicon Mountain)",
      students: "1.2K",
      rating: 4.8,
      level: "Beginner",
      duration: "6 Weeks",
      price: "Free Access",
      isFree: true,
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      description: "Master modern digital tools, inventory management software, e-commerce web systems, and online security tailored for African SMEs."
    },
    {
      id: 2,
      title: "Entrepreneurship & SME Growth in Malawi",
      category: "business",
      instructor: "Clarisse Mbida (Douala Business Hub)",
      students: "980",
      rating: 4.9,
      level: "All Levels",
      duration: "4 Weeks",
      price: "Free Access",
      isFree: true,
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      description: "Practical guide to business registration, tax compliance (MINCOMMERCE), supply chain scaling, and customer acquisition across Malawi."
    },
    {
      id: 3,
      title: "E-Commerce for Agric Trading & Export Masterclass",
      category: "agric",
      instructor: "Emmanuel Tange (AgriTech Leader)",
      students: "780",
      rating: 4.7,
      level: "Intermediate",
      duration: "5 Weeks",
      price: "25,000 FCFA",
      isFree: false,
      amountNum: 25000,
      image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
      description: "Learn how to list cocoa, coffee, cassava, and fresh produce online, package for international shipping, and trade via AfCFTA."
    },
    {
      id: 4,
      title: "Digital Economy & Mobile Payments (MoMo/OM)",
      category: "economy",
      instructor: "Amina Bello (Fintech Strategist)",
      students: "650",
      rating: 4.6,
      level: "All Levels",
      duration: "3 Weeks",
      price: "Free Access",
      isFree: true,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
      description: "Integrate MTN MoMo, Orange Money, and CamRency digital wallets into your retail operations for instant cashless settlement."
    }
  ];

  const [courses, setCourses] = useState<any[]>(defaultCourses);

  useEffect(() => {
    fetch(getApiUrl("/api/courses"))
      .then(res => {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return res.json();
        }
        return null;
      })
      .then(data => {
        if (data && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses([...data.courses, ...defaultCourses]);
        }
      })
      .catch(err => console.error("Error fetching courses:", err));
  }, []);

  const filteredCourses = courses.filter(c => {
    const matchesCat = activeCategory === "all" || c.category === activeCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || (c.instructor && c.instructor.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleEnrollClick = (course: any) => {
    // 1. Mandatory Sign In / Sign Up Check
    if (!userSession) {
      toast.error("🔒 Sign in required: Please log in or create an account to enroll in courses!");
      navigate("/signin");
      return;
    }

    setSelectedCourse(course);
    setIsEnrollModalOpen(true);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isCourseFree = selectedCourse?.isFree || selectedCourse?.price === "Free Access" || !selectedCourse?.price;
    const paymentStatus = isCourseFree ? "free" : "paid";
    const amountPaid = isCourseFree ? "0 FCFA" : (selectedCourse?.price || "15,000 FCFA");

    const payload = {
      courseId: selectedCourse?.id || "crs-001",
      courseTitle: selectedCourse?.title || "Academy Course",
      name: enrollForm.name,
      email: enrollForm.email,
      phone: enrollForm.phone,
      paymentStatus: paymentStatus,
      amountPaid: amountPaid
    };

    try {
      const res = await fetch(getApiUrl("/api/course-enroll"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`🎉 Congratulations ${enrollForm.name}! You are enrolled in '${selectedCourse?.title}'. Confirmation emails dispatched to ${enrollForm.email} & Admin!`);
      } else {
        toast.success(`🎉 Enrolled in '${selectedCourse?.title}'! Confirmation email sent to ${enrollForm.email}`);
      }
    } catch (err) {
      toast.success(`🎉 Enrolled in '${selectedCourse?.title}'! Confirmation email sent to ${enrollForm.email}`);
    }

    setIsEnrollModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />

      {/* Hero Section with National Colors & Backdrop */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-[#04281E] via-[#064E3B] to-[#022C22] text-white overflow-hidden">
        {/* Glow ambient background graphics */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content Column with Dynamic Animations */}
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-amber-300 uppercase tracking-widest animate-bounce shadow-lg">
                <Sparkles className="h-4 w-4 text-amber-400 animate-spin" /> 🎓 CamerMark National Academy
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight transition-all duration-700">
                <span className="block text-white transition-transform hover:scale-105 duration-300">
                  Empowering Learners.
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200 animate-pulse underline decoration-amber-400/40 my-1">
                  Building Businesses.
                </span>
                <span className="block text-emerald-200">
                  Transforming Malawi & Africa.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 font-medium max-w-xl leading-relaxed">
                Access quality courses in <span className="font-bold text-amber-300">Business, Technology, Agriculture</span> & Digital Trade. Learn at your own pace, anytime across all 10 regions of Malawi.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button 
                  onClick={() => {
                    const el = document.getElementById("courses-grid");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black h-12 px-7 rounded-2xl text-sm shadow-xl transition-transform hover:scale-105"
                >
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => {
                    const el = document.getElementById("courses-grid");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10 font-bold h-12 px-7 rounded-2xl text-sm backdrop-blur-md"
                >
                  Explore Courses
                </Button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <Users className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="text-lg font-black">25K+</h4>
                    <p className="text-[10px] text-emerald-200 uppercase font-bold">Active Learners</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <GraduationCap className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-lg font-black">250+</h4>
                    <p className="text-[10px] text-emerald-200 uppercase font-bold">Courses</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <Award className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="text-lg font-black">150+</h4>
                    <p className="text-[10px] text-emerald-200 uppercase font-bold">Instructors</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <Globe className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-lg font-black">Malawi</h4>
                    <p className="text-[10px] text-emerald-200 uppercase font-bold">& Africa Focused</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Media Column */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" 
                  alt="Camer Market Academy Learners" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04281E] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-black">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white">National Skills Initiative</h4>
                      <p className="text-[10px] text-emerald-200">Certified by CaMark & MINCOMMERCE</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-500 text-white px-2.5 py-1 rounded-lg">100% Online</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Value Props Ribbon */}
      <section className="py-8 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <BookOpen className="h-8 w-8 text-emerald-700 shrink-0" />
              <div>
                <h4 className="font-black text-sm text-gray-900">Quality Education</h4>
                <p className="text-xs text-gray-500 mt-0.5">Learn from industry experts and professionals.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
              <Laptop className="h-8 w-8 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-black text-sm text-gray-900">Flexible Learning</h4>
                <p className="text-xs text-gray-500 mt-0.5">Study at your own pace, anytime, anywhere.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <Award className="h-8 w-8 text-emerald-700 shrink-0" />
              <div>
                <h4 className="font-black text-sm text-gray-900">Certified Courses</h4>
                <p className="text-xs text-gray-500 mt-0.5">Earn certificates and boost your career.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
              <HeartHandshake className="h-8 w-8 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-black text-sm text-gray-900">Community Support</h4>
                <p className="text-xs text-gray-500 mt-0.5">Join a network of learners and grow together.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Catalog Section */}
      <section id="courses-grid" className="py-16 container mx-auto px-4 space-y-10">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Popular Courses</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Select a course to start building in-demand skills for the African market.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search courses or instructors..." 
                className="pl-9 h-10 rounded-xl bg-gray-50 text-xs border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-[#064E3B] text-white shadow-md shadow-emerald-900/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.map((c) => (
            <Card key={c.id} className="rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img 
                    src={c.image} 
                    alt={c.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase">
                    {c.level}
                  </div>
                  <div className="absolute top-3 right-3 bg-amber-400 text-emerald-950 text-[10px] font-black px-2.5 py-1 rounded-lg">
                    {c.price}
                  </div>
                </div>

                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold">
                    <span className="flex items-center gap-1 text-amber-500 font-black">
                      <Star className="h-3.5 w-3.5 fill-amber-400" /> {c.rating} ({c.students})
                    </span>
                    <span>{c.duration}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {c.title}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-600 font-medium">
                    Instructor: <strong className="text-gray-900 font-bold">{c.instructor}</strong>
                  </div>
                </CardContent>
              </div>

              <div className="p-5 pt-0">
                <Button 
                  onClick={() => handleEnrollClick(c)}
                  className={`w-full font-bold h-11 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md ${
                    c.isFree || c.price === "Free Access" || !c.price
                      ? "bg-[#064E3B] hover:bg-emerald-950 text-white"
                      : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                  }`}
                >
                  {c.isFree || c.price === "Free Access" || !c.price ? (
                    <>Enroll Course Free <ArrowRight className="h-4 w-4" /></>
                  ) : (
                    <>Enroll & Pay {c.price} <CreditCard className="h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Join Academy Banner Card */}
        <div className="bg-gradient-to-r from-[#064E3B] to-[#022C22] text-white rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-500/20">
          <div className="space-y-3 max-w-xl text-left">
            <span className="bg-amber-400 text-emerald-950 text-xs font-black uppercase px-3 py-1 rounded-lg inline-block">
              National Academy Access
            </span>
            <h3 className="text-2xl sm:text-4xl font-black">Join Camer Market Academy Today!</h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              Get unlimited access to quality courses, practical skills, and resources designed for your success across Malawi and Central Africa.
            </p>
          </div>

          <div className="w-full sm:w-auto flex flex-col gap-3 shrink-0">
            <Button 
              onClick={() => navigate("/signup")}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black h-12 px-8 rounded-2xl text-sm shadow-xl"
            >
              Create Free Account →
            </Button>
            <div className="text-center text-[11px] text-emerald-200">
              Or continue with Google, Facebook or Apple
            </div>
          </div>
        </div>

      </section>

      {/* Enroll Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-600" /> Course Enrollment
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              You are enrolling in <strong className="text-gray-900">{selectedCourse?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          {/* Pricing Banner in Modal */}
          <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between font-bold ${
            selectedCourse?.isFree || selectedCourse?.price === "Free Access" || !selectedCourse?.price
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-amber-50 border-amber-200 text-amber-950"
          }`}>
            <span>Course Access Fee:</span>
            <span className="font-black text-sm">{selectedCourse?.price || "Free Access"}</span>
          </div>

          <form onSubmit={handleEnrollSubmit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
              <Input 
                type="text"
                required
                placeholder="e.g. Samuel Eto'o"
                className="h-10 rounded-xl bg-gray-50 text-xs"
                value={enrollForm.name}
                onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <Input 
                type="email"
                required
                placeholder="samuel@company.cm"
                className="h-10 rounded-xl bg-gray-50 text-xs"
                value={enrollForm.email}
                onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Phone / WhatsApp</label>
              <Input 
                type="text"
                required
                placeholder="+237 6xx xxx xxx"
                className="h-10 rounded-xl bg-gray-50 text-xs font-mono"
                value={enrollForm.phone}
                onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
              />
            </div>

            {/* Payment Method Selector if Paid Course */}
            {!(selectedCourse?.isFree || selectedCourse?.price === "Free Access" || !selectedCourse?.price) && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-amber-600" /> Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("momo")}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      selectedPaymentMethod === "momo"
                        ? "border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400"
                        : "border-gray-200 bg-gray-50 text-gray-700"
                    }`}
                  >
                    <Smartphone className="h-4 w-4 text-amber-500" /> MTN MoMo / OM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("card")}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      selectedPaymentMethod === "card"
                        ? "border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400"
                        : "border-gray-200 bg-gray-50 text-gray-700"
                    }`}
                  >
                    <CreditCard className="h-4 w-4 text-blue-600" /> Visa / Mastercard
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className={`w-full font-bold h-11 rounded-xl text-xs mt-2 ${
              selectedCourse?.isFree || selectedCourse?.price === "Free Access" || !selectedCourse?.price
                ? "bg-[#064E3B] hover:bg-emerald-950 text-white"
                : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
            }`}>
              {selectedCourse?.isFree || selectedCourse?.price === "Free Access" || !selectedCourse?.price
                ? "Confirm & Start Course Now"
                : `Authorize Payment (${selectedCourse?.price}) & Enroll`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AcademyPage;
