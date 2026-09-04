import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatAssistant from "./components/camemark/ChatAssistant.tsx";
import { getApiUrl } from "@/config";

const MaintenancePage = lazy(() => import("./pages/MaintenancePage.tsx"));const Index = lazy(() => import("./pages/Index.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Signup = lazy(() => import("./pages/Signup.tsx"));
const Signin = lazy(() => import("./pages/Signin.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const MarketZone = lazy(() => import("./pages/MarketZone.tsx"));
const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard.tsx"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard.tsx"));
const CardsWallet = lazy(() => import("./pages/CardsWallet.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage.tsx"));
const AcademyPage = lazy(() => import("./pages/AcademyPage.tsx"));
const OfflineCommercePage = lazy(() => import("./pages/OfflineCommercePage"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess.tsx"));

const ForumPage = lazy(() => import("./pages/ForumPage.tsx"));

const queryClient = new QueryClient();

// A simple loading fallback for route transitions
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
  </div>
);

const MaintenanceGuard = ({ children }: { children: React.ReactNode }) => {
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetch(getApiUrl('/api/settings/maintenance'))
      .then(res => res.json())
      .then(data => {
        setMaintenance(data.enabled);
      })
      .catch(() => setMaintenance(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const isBypassedPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/signin');
  
  if (maintenance && !isBypassedPath) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoader />}>
          <MaintenanceGuard>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/academy" element={<AcademyPage />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/market-zone" element={<MarketZone />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/dashboard" element={<BuyerDashboard />} />
              <Route path="/seller-dashboard/*" element={<SellerDashboard />} />
              <Route path="/cards-wallet" element={<CardsWallet />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/offline-commerce" element={<OfflineCommercePage />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/marketplace" element={<Navigate to="/market-zone" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MaintenanceGuard>
        </Suspense>
      </BrowserRouter>
      <ChatAssistant />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
