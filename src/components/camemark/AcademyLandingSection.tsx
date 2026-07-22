import { Button } from "@/components/ui/button";
import { 
  GraduationCap, BookOpen, Users, Award, 
  ArrowRight, Sparkles, Star, Laptop 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AcademyLandingSection = () => {
  const navigate = useNavigate();

  const featuredCourses = [
    {
      title: "IT for Business & Digital Trade",
      level: "Beginner",
      instructor: "Dr. Paul Nkongho",
      rating: "4.8",
      students: "1.2K",
      price: "Free Access",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Entrepreneurship & SME Growth in Cameroon",
      level: "All Levels",
      instructor: "Clarisse Mbida",
      rating: "4.9",
      students: "980",
      price: "Free Access",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "E-Commerce for Agric Trading & Export",
      level: "Intermediate",
      instructor: "Emmanuel Tange",
      rating: "4.7",
      students: "780",
      price: "Grant Funded",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Digital Economy & Mobile Payments (MoMo/OM)",
      level: "All Levels",
      instructor: "Amina Bello",
      rating: "4.6",
      students: "650",
      price: "Free Access",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#04281E] via-[#064E3B] to-[#032018] text-white relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-amber-300 uppercase tracking-widest">
            <GraduationCap className="h-4 w-4 text-amber-400" /> CAMER MARKET ACADEMY
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Empowering Learners. Building Businesses. <br />
            <span className="text-amber-400 underline decoration-amber-400/40">Transforming Cameroon & Africa.</span>
          </h2>
          
          <p className="text-base md:text-lg text-emerald-100/90 font-medium">
            Access quality courses in business, technology, agriculture, digital skills and more. Learn at your pace, anytime, anywhere.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-bold text-emerald-200">
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
              <Users className="h-4 w-4 text-amber-400" /> 25K+ Active Learners
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
              <BookOpen className="h-4 w-4 text-emerald-400" /> 250+ Courses
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
              <Award className="h-4 w-4 text-amber-400" /> Certified Programs
            </span>
          </div>
        </div>

        {/* Featured Courses Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.map((c, i) => (
            <div key={i} className="bg-white text-gray-900 rounded-3xl overflow-hidden shadow-xl border border-white/10 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase backdrop-blur-md">
                    {c.level}
                  </span>
                  <span className="absolute top-3 right-3 bg-amber-400 text-emerald-950 text-[10px] font-black px-2.5 py-1 rounded-lg">
                    {c.price}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold">
                    <span className="flex items-center gap-1 text-amber-500 font-black">
                      <Star className="h-3.5 w-3.5 fill-amber-400" /> {c.rating} ({c.students})
                    </span>
                    <span>Instructor: {c.instructor}</span>
                  </div>
                  <h4 className="font-extrabold text-base text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {c.title}
                  </h4>
                </div>
              </div>
              <div className="p-5 pt-0">
                <Button onClick={() => navigate("/academy")} className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-2">
                  Enroll Free <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Strip */}
        <div className="bg-white/10 border border-white/20 rounded-3xl p-8 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-black text-white">Ready to Boost Your Digital Skills?</h3>
            <p className="text-xs md:text-sm text-emerald-100/90 mt-1">Explore all 250+ courses and join 25,000+ Cameroonian entrepreneurs today.</p>
          </div>
          <Button onClick={() => navigate("/academy")} className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black h-12 px-8 rounded-2xl text-sm shadow-xl shrink-0">
            Visit Camer Market Academy Hub →
          </Button>
        </div>

      </div>
    </section>
  );
};

export default AcademyLandingSection;
