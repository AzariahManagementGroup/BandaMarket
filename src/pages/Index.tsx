import Navbar from "@/components/camemark/Navbar";
import Hero from "@/components/camemark/Hero";
import FeatureGrid from "@/components/camemark/FeatureGrid";
import RegionsMap from "@/components/camemark/RegionsMap";
import HowItWorks from "@/components/camemark/HowItWorks";
import BuiltFor from "@/components/camemark/BuiltFor";
import TrustBar from "@/components/camemark/TrustBar";
import Footer from "@/components/camemark/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <FeatureGrid />
        <section className="container py-20 grid gap-12 lg:grid-cols-2 items-start">
          <RegionsMap />
          <HowItWorks />
        </section>
        <BuiltFor />
        <TrustBar />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
