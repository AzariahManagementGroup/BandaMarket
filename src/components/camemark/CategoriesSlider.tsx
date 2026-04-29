import React, { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface Category {
  name: string;
  imgSrc: string;
}

const categories: Category[] = [
  { name: "Electronics", imgSrc: "https://picsum.photos/seed/electronics/200/200" },
  { name: "Fashion", imgSrc: "https://picsum.photos/seed/fashion/200/200" },
  { name: "Agriculture", imgSrc: "https://picsum.photos/seed/agriculture/200/200" },
  { name: "Finance", imgSrc: "https://picsum.photos/seed/finance/200/200" },
  { name: "Health", imgSrc: "https://picsum.photos/seed/health/200/200" },
  { name: "Education", imgSrc: "https://picsum.photos/seed/education/200/200" },
  { name: "Travel", imgSrc: "https://picsum.photos/seed/travel/200/200" },
  { name: "Food", imgSrc: "https://picsum.photos/seed/food/200/200" },
  { name: "Home", imgSrc: "https://picsum.photos/seed/home/200/200" },
  { name: "Sports", imgSrc: "https://picsum.photos/seed/sports/200/200" },
  { name: "Beauty", imgSrc: "https://picsum.photos/seed/beauty/200/200" },
  { name: "Tech", imgSrc: "https://picsum.photos/seed/tech/200/200" },
  { name: "Automotive", imgSrc: "https://picsum.photos/seed/automotive/200/200" },
  { name: "Books", imgSrc: "https://picsum.photos/seed/books/200/200" },
  { name: "Music", imgSrc: "https://picsum.photos/seed/music/200/200" },
  { name: "Toys", imgSrc: "https://picsum.photos/seed/toys/200/200" },
  { name: "Gardening", imgSrc: "https://picsum.photos/seed/gardening/200/200" },
  { name: "Pets", imgSrc: "https://picsum.photos/seed/pets/200/200" },
  { name: "Real Estate", imgSrc: "https://picsum.photos/seed/realestate/200/200" },
  { name: "Services", imgSrc: "https://picsum.photos/seed/services/200/200" },
  { name: "Industrial", imgSrc: "https://picsum.photos/seed/industrial/200/200" },
  { name: "Art", imgSrc: "https://picsum.photos/seed/art/200/200" },
  { name: "Jewelry", imgSrc: "https://picsum.photos/seed/jewelry/200/200" },
  { name: "Baby", imgSrc: "https://picsum.photos/seed/baby/200/200" },
  { name: "Fitness", imgSrc: "https://picsum.photos/seed/fitness/200/200" },
];

export const CategoriesSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: true }, [Autoplay({ delay: 2000, stopOnInteraction: false })]);

  // Optional: pause autoplay on hover
  useEffect(() => {
    const node = emblaRef?.current;
    if (!node) return;
    const handleMouseEnter = () => emblaApi?.plugins()?.autoplay?.stop();
    const handleMouseLeave = () => emblaApi?.plugins()?.autoplay?.play();
    node.addEventListener("mouseenter", handleMouseEnter);
    node.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      node.removeEventListener("mouseenter", handleMouseEnter);
      node.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [emblaRef, emblaApi]);

  return (
    <div className="categories-slider">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {categories.map((cat) => (
            <div key={cat.name} className="embla__slide">
              <div className="category-card">
                <img src={cat.imgSrc} alt={cat.name} />
                <span>{cat.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesSlider;
