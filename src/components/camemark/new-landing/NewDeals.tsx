import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback } from "react";
import { addToCart } from "@/utils/cart";

const products = [
  { id: 1, name: "Wireless Headphones Noise Cancelling", price: 49.99, oldPrice: 79.99, discount: 38, rating: 4.8, reviews: "1.2k", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80" },
  { id: 2, name: "Luxury Handbag Genuine Leather", price: 79.99, oldPrice: 109.99, discount: 28, rating: 4.9, reviews: "800", image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=300&q=80" },
  { id: 3, name: "MacBook Air M2 13-inch", price: 899.99, oldPrice: 1099.99, discount: 20, rating: 4.9, reviews: "2.1k", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80" },
  { id: 4, name: "Men's Sneakers Breathable Size 42", price: 69.99, oldPrice: 102.99, discount: 32, rating: 4.7, reviews: "640", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80" },
  { id: 5, name: "Organic Face Cream 50ml", price: 24.99, oldPrice: 29.99, discount: 16, rating: 4.6, reviews: "430", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&q=80" },
  { id: 6, name: "Air Fryer 5.5L Digital", price: 89.99, oldPrice: 119.99, discount: 25, rating: 4.8, reviews: "520", image: "https://images.unsplash.com/photo-1628198754751-60a5e8fcbdf6?w=300&q=80" },
];

const NewDeals = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true },
    [Autoplay({ delay: 3500, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Today's Deals</h2>
        <a href="#" className="text-sm font-medium text-amber-600 hover:text-amber-700">See all deals &gt;</a>
      </div>

      <div className="relative group">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 pb-4">
            {products.map((p) => (
              <div key={p.id} className="flex-[0_0_auto] min-w-[180px] md:min-w-[200px] bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col hover:shadow-md transition-shadow">
                <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply p-2" />
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    -{p.discount}%
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 flex-grow">{p.name}</h3>
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-bold text-lg text-gray-900">${p.price}</span>
                  <span className="text-xs text-gray-400 line-through mb-1">${p.oldPrice}</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(p.rating) ? "fill-current" : ""}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500">({p.reviews})</span>
                </div>
                <Button 
                  onClick={() => addToCart({ ...p, title: p.name, imageUrl: p.image })}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-8 text-xs rounded-lg mt-auto"
                >
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={scrollPrev}
          className="absolute left-0 top-1/3 -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity -ml-5 z-10 hidden md:flex"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={scrollNext}
          className="absolute right-0 top-1/3 -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity -mr-5 z-10 hidden md:flex"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
};

export default NewDeals;
