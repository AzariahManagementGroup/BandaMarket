import { ArrowRight } from "lucide-react";

const NewPromoCards = () => {
  return (
    <section className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#0b3624] text-white p-6 rounded-xl relative overflow-hidden group min-h-[160px]">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20 group-hover:scale-110 transition-transform origin-top-right">
            <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover rounded-bl-full" alt="Academy" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1">Banda Academy</h3>
            <p className="text-amber-500 font-medium mb-1">Learn. Grow. Succeed.</p>
            <p className="text-sm text-gray-300 mb-4 max-w-[200px]">Practical skills for individuals, entrepreneurs and businesses.</p>
            <button className="bg-amber-500 text-white hover:bg-amber-600 px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center">
              Explore Courses <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0b5c92] text-white p-6 rounded-xl relative overflow-hidden group min-h-[160px]">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20 group-hover:scale-110 transition-transform origin-top-right">
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover rounded-bl-full" alt="Global Store" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1">Global Store</h3>
            <p className="text-blue-200 font-medium mb-1">International brands at your fingertips.</p>
            <button className="bg-amber-500 text-white hover:bg-amber-600 px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center mt-4">
              Shop Global <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#1b4332] text-white p-6 rounded-xl relative overflow-hidden group min-h-[160px]">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20 group-hover:scale-110 transition-transform origin-top-right">
            <img src="https://images.unsplash.com/photo-1618608226521-177b94dcb40a?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover rounded-bl-full" alt="Made in Africa" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1">Made in Africa</h3>
            <p className="text-green-200 font-medium mb-1">Support local brands and artisans.</p>
            <button className="bg-amber-500 text-white hover:bg-amber-600 px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center mt-4">
              Shop Now <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#b33939] text-white p-6 rounded-xl relative overflow-hidden group min-h-[160px]">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20 group-hover:scale-110 transition-transform origin-top-right">
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover rounded-bl-full" alt="Banda Deals" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1">Banda Deals</h3>
            <p className="text-red-200 font-medium mb-1">Big savings. Greater possibilities.</p>
            <button className="bg-amber-500 text-white hover:bg-amber-600 px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center mt-4">
              Shop Deals <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewPromoCards;
