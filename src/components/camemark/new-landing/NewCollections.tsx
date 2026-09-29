const collections = [
  { id: 1, name: "African Fashion", subtitle: "Bold. Beautiful. Unique.", bg: "https://images.unsplash.com/photo-1574340324838-8a883a992bc5?w=500&q=80", buttonText: "Shop Fashion" },
  { id: 2, name: "Fresh Produce", subtitle: "From Africa to you.", bg: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80", buttonText: "Shop Fresh" },
  { id: 3, name: "Home Essentials", subtitle: "Comfort for every home.", bg: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80", buttonText: "Shop Home" },
  { id: 4, name: "Electronics & Gadgets", subtitle: "Top brands. Great prices.", bg: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80", buttonText: "Shop Electronics" },
  { id: 5, name: "Automotive & Tools", subtitle: "Drive. Build. Maintain.", bg: "https://images.unsplash.com/photo-1503376713914-72643a650d9a?w=500&q=80", buttonText: "Shop Automotive" },
];

const NewCollections = () => {
  return (
    <section className="container mx-auto px-4 py-6 mb-12">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Featured Collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {collections.map((c) => (
          <div key={c.id} className="relative rounded-xl overflow-hidden h-40 group shadow-sm hover:shadow-md transition-shadow">
            <img src={c.bg} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20"></div>
            
            <div className="absolute inset-0 p-4 flex flex-col justify-center">
              <h3 className="text-white font-bold text-lg mb-1">{c.name}</h3>
              <p className="text-gray-300 text-xs mb-4">{c.subtitle}</p>
              <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-1.5 rounded-full text-xs w-max transition-colors">
                {c.buttonText} &gt;
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewCollections;
