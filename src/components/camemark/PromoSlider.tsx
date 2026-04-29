import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import feature1 from "@/assets/promos/feature-1.png";
import feature2 from "@/assets/promos/feature-2.png";
import feature3 from "@/assets/promos/feature-3.png";
import feature4 from "@/assets/promos/feature-4.png";
import feature5 from "@/assets/promos/feature-5.png";
import feature6 from "@/assets/promos/feature-6.png";
import feature7 from "@/assets/promos/feature-7.png";
import feature8 from "@/assets/promos/feature-8.png";
import feature9 from "@/assets/promos/feature-9.png";
import feature10 from "@/assets/promos/feature-10.png";
import feature11 from "@/assets/promos/feature-11.png";

const features = [
  feature1, feature2, feature3, feature4, feature5,
  feature6, feature7, feature8, feature9, feature10,
  feature11
];

export const PromoSlider = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  return (
    <section className="promo-slider container py-4 md:py-6">
      <div className="embla overflow-hidden rounded-xl md:rounded-2xl shadow-elegant mx-auto max-w-[95%] md:max-w-none" ref={emblaRef}>
        <div className="embla__container flex">
          {features.map((src, index) => (
            <div key={index} className="embla__slide flex-[0_0_100%] min-w-0">
              <img
                src={src}
                alt={`Feature Slide ${index + 1}`}
                className="w-full h-auto object-cover aspect-[16/6] md:aspect-[3/1] max-h-[160px] md:max-h-none"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoSlider;
