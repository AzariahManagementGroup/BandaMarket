import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NewHero = () => {
  return (
    <section className="container mx-auto px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
        {/* Left Large Banner */}
        <div className="lg:col-span-2 relative rounded-xl overflow-hidden shadow-lg group">
          <img 
            src="https://images.unsplash.com/photo-1542317764-59e5e7804473?auto=format&fit=crop&q=80&w=1200" 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          
          {/* Content */}
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
              Africa to the World<br />
              <span className="text-amber-500">The World to Africa</span>
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-white mb-4">Shop • Sell • Grow • Belong</p>
            <p className="text-white/90 max-w-md mb-8 text-sm md:text-base">
              Banda Market connects people, products and opportunities across Africa and the global diaspora.
            </p>
            <div className="flex gap-4">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 rounded-full border-none shadow-md">
                Shop Now <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white font-bold px-8 rounded-full backdrop-blur-sm">
                Become a Seller
              </Button>
            </div>
          </div>

          {/* Navigation Arrows (Decorative) */}
          <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Right Small Banner */}
        <div className="relative rounded-xl overflow-hidden shadow-lg hidden lg:block">
          <img 
            src="https://images.unsplash.com/photo-1618608226521-177b94dcb40a?auto=format&fit=crop&q=80&w=800" 
            alt="Made in Africa" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-8 w-full">
            <h2 className="text-2xl font-bold text-white mb-1">Made in Africa</h2>
            <p className="text-amber-500 font-medium mb-4">Authentic. Quality. Global.</p>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 rounded-full w-max text-sm">
              Shop Now <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHero;
