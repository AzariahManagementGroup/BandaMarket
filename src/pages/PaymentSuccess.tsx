import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/camemark/Navbar";
import Footer from "@/components/camemark/Footer";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your payment. Your registration for the CameMark Forum is now complete.
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-bold h-12 rounded-xl"
            >
              Return to Homepage
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
