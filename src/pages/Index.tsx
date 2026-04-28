import { useEffect } from "react";
import Navbar from "@/components/camemark/Navbar";
import Hero from "@/components/camemark/Hero";
import FeatureGrid from "@/components/camemark/FeatureGrid";
import RegionsMap from "@/components/camemark/RegionsMap";
import HowItWorks from "@/components/camemark/HowItWorks";
import BuiltFor from "@/components/camemark/BuiltFor";
import TrustBar from "@/components/camemark/TrustBar";
import Footer from "@/components/camemark/Footer";

const Index = () => {
  useEffect(() => {
    // Attempt to play a welcome voice
    const playWelcomeVoice = () => {
      const utterance = new SpeechSynthesisUtterance("Welcome to Cameroon's Digital Market");
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      // Try speaking immediately
      window.speechSynthesis.speak(utterance);
    };

    // Browsers often block autoplaying audio. We attach to first user interaction just in case.
    const handleFirstInteraction = () => {
      playWelcomeVoice();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);
    
    // Also try immediately in case the browser allows it (e.g., page was reloaded)
    playWelcomeVoice();

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="overflow-x-hidden">
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
