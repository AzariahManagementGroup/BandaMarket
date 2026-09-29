import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback } from "react";

const categories = [
  { id: 1, name: "Groceries & Food", emoji: "🥑" },
  { id: 2, name: "Fashion & Beauty", emoji: "👗" },
  { id: 3, name: "Electronics & Devices", emoji: "💻" },
  { id: 4, name: "Home & Living", emoji: "🛋️" },
  { id: 5, name: "Health & Wellness", emoji: "💊" },
  { id: 6, name: "Automotive & Tools", emoji: "🚗" },
  { id: 7, name: "Agriculture", emoji: "🚜" },
  { id: 8, name: "Business & Office", emoji: "💼" },
  { id: 9, name: "Baby & Toys", emoji: "🧸" },
  { id: 10, name: "Sports", emoji: "⚽" },
  { id: 11, name: "Arts & Culture", emoji: "🎨" },
  { id: 12, name: "Global Store", emoji: "🌍" },
  { id: 13, name: "Banda Academy", emoji: "🎓" },
  { id: 14, name: "More", emoji: "..." },
];

const NewCategories = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="relative group">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 py-2 px-1">
            {categories.map((cat) => (
              <div key={cat.id} className="flex-[0_0_auto] flex flex-col items-center gap-2 min-w-[90px] cursor-pointer hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-3xl hover:shadow-md transition-shadow">
                  {cat.emoji}
                </div>
                <span className="text-xs font-semibold text-center text-gray-700 leading-tight">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity -ml-4 z-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button 
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity -mr-4 z-10"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
};

export default NewCategories;
