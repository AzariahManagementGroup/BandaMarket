import React, { useEffect } from "react";
import Navbar from "@/components/camemark/Navbar";
import Footer from "@/components/camemark/Footer";
import ForumEventSection from "@/components/camemark/ForumEventSection";
import ChatAssistant from "@/components/camemark/ChatAssistant";

const ForumPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-16">
        <ForumEventSection />
      </main>
      <Footer />
      <ChatAssistant />
    </div>
  );
};

export default ForumPage;
