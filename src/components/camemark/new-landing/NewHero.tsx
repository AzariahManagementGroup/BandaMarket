import heroImg from "@/assets/hero-banner.png";

const NewHero = () => {
  return (
    <section className="container mx-auto px-4 py-4">
      <div className="w-full relative rounded-xl overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-1000 ease-out">
        <img 
          src={heroImg} 
          alt="Banda Market - Africa to the World" 
          className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
        />
      </div>
    </section>
  );
};

export default NewHero;
