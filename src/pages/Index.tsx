import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getApiUrl } from "@/config";
import EventPopupModal from "@/components/camemark/EventPopupModal";

// New Landing Page Components
import NewNavbar from "@/components/camemark/new-landing/NewNavbar";
import NewHero from "@/components/camemark/new-landing/NewHero";
import NewCategories from "@/components/camemark/new-landing/NewCategories";
import NewPromoCards from "@/components/camemark/new-landing/NewPromoCards";
import NewDeals from "@/components/camemark/new-landing/NewDeals";
import NewCollections from "@/components/camemark/new-landing/NewCollections";
import NewFooter from "@/components/camemark/new-landing/NewFooter";

const Index = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Check if voice has already been played in this session
    if (sessionStorage.getItem("welcome_voice_played") === "true") {
      return;
    }

    // Fetch setting to see if voice is enabled by admin
    fetch(getApiUrl('/api/settings/voice'))
      .then(res => res.json())
      .then(data => {
        if (!data.enabled) return;

        // Attempt to play a welcome voice
        const playWelcomeVoice = () => {
          const message = t("voice.welcome", "Welcome to Banda Market");
          const utterance = new SpeechSynthesisUtterance(message);
          
          if (i18n.language?.startsWith("fr")) utterance.lang = "fr-FR";
          else if (i18n.language?.startsWith("es")) utterance.lang = "es-ES";
          else if (i18n.language?.startsWith("ar")) utterance.lang = "ar-SA";
          else utterance.lang = "en-US";

          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          
          // Try speaking immediately
          window.speechSynthesis.speak(utterance);
          
          // Mark as played
          sessionStorage.setItem("welcome_voice_played", "true");
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
      })
      .catch(err => console.error("Error fetching voice settings:", err));
  }, [t, i18n.language]);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <EventPopupModal />
      <NewNavbar />
      <main className="overflow-x-hidden">
        <NewHero />
        <NewCategories />
        <NewPromoCards />
        <NewDeals />
        <NewCollections />
      </main>
      <NewFooter />
    </div>
  );
};

export default Index;

