import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Signup from "./pages/Signup.tsx";
import MarketZone from "./pages/MarketZone.tsx";
import ChatAssistant from "./components/camemark/ChatAssistant.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/market-zone" element={<MarketZone />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ChatAssistant />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
