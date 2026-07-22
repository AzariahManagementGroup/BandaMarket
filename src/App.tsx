import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Signup from "./pages/Signup.tsx";
import Signin from "./pages/Signin.tsx";
import MarketZone from "./pages/MarketZone.tsx";
import BuyerDashboard from "./pages/BuyerDashboard.tsx";
import SellerDashboard from "./pages/SellerDashboard.tsx";
import CardsWallet from "./pages/CardsWallet.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import AcademyPage from "./pages/AcademyPage.tsx";
import ChatAssistant from "./components/camemark/ChatAssistant.tsx";
import { Navigate } from "react-router-dom";
import OfflineCommercePage from "./pages/OfflineCommercePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/market-zone" element={<MarketZone />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/dashboard" element={<BuyerDashboard />} />
          <Route path="/seller-dashboard/*" element={<SellerDashboard />} />
          <Route path="/cards-wallet" element={<CardsWallet />} />
          <Route path="/offline-commerce" element={<OfflineCommercePage />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/marketplace" element={<Navigate to="/market-zone" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ChatAssistant />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
