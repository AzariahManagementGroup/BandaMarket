import React from "react";

import ecobank from "@/assets/partners/ecobank.png";
import mtn from "@/assets/partners/mtn.png";
import orange from "@/assets/partners/orange.png";
import uba from "@/assets/partners/uba.png";

const partners = [
  { name: "EcoBank", logo: ecobank },
  { name: "MTN", logo: mtn },
  { name: "Orange", logo: orange },
  { name: "UBA", logo: uba },
];

export const StrategicPartners = () => {
  return (
    <section className="partners-section container py-8 border-t border-border/50">
      <div className="flex flex-col items-center gap-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
          Our Strategic Partners
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-smooth">
          {partners.map((partner) => (
            <div key={partner.name} className="h-8 md:h-10 flex items-center justify-center">
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-full w-auto object-contain"
              />
            </div>
          ))}
          {/* CamPost as a styled text logo to avoid external loading issues */}
          <div className="h-8 md:h-10 flex items-center justify-center px-4 bg-yellow-400 rounded font-bold text-green-800 text-sm md:text-base">
            CamPost
          </div>
        </div>
      </div>
    </section>
  );
};

export default StrategicPartners;
