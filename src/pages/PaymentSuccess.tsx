import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/camemark/Navbar";
import Footer from "@/components/camemark/Footer";

const getApiUrl = (path: string) => {
  const isDev = window.location.hostname === "localhost" || window.location.hostname.startsWith("192.168.");
  return isDev ? `http://${window.location.hostname}:5000${path}` : path;
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get("email");
    
    if (email) {
      fetch(getApiUrl("/api/forum-success"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.ticket) {
          setTicket(data.ticket);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8 text-center space-y-6 relative overflow-hidden">
          {/* Decorative Top Banner */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-emerald-600"></div>

          <div className="flex justify-center mt-4">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your payment. A confirmation receipt has been sent to your email.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
              <p className="text-sm text-gray-500">Generating your ticket...</p>
            </div>
          ) : ticket ? (
            <div className="bg-gray-50 rounded-xl p-6 text-left border border-gray-100 relative">
              {/* Ticket cutouts */}
              <div className="absolute left-[-12px] top-1/2 w-6 h-6 bg-white rounded-full border-r border-gray-100 transform -translate-y-1/2"></div>
              <div className="absolute right-[-12px] top-1/2 w-6 h-6 bg-white rounded-full border-l border-gray-100 transform -translate-y-1/2"></div>
              
              <div className="border-b border-dashed border-gray-300 pb-4 mb-4">
                <h3 className="font-bold text-lg text-emerald-800">CameMark Forum Pass</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{ticket.category}</p>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-bold text-gray-800">{ticket.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-800">{ticket.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium text-gray-800">{ticket.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid:</span>
                  <span className="font-bold text-emerald-600">{ticket.amount_paid}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-500">Reg ID:</span>
                  <span className="font-mono text-xs text-gray-500">{ticket.id.substring(0, 13)}...</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm border border-orange-100">
              We couldn't retrieve your ticket details immediately, but your registration was successful! Please check your email for the pass.
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            {ticket && (
              <Button 
                onClick={() => window.print()}
                variant="outline"
                className="flex-1 font-bold h-12 rounded-xl border-emerald-200 hover:bg-emerald-50 text-emerald-800"
              >
                <Download className="w-4 h-4 mr-2" /> Download Ticket
              </Button>
            )}
            <Button 
              onClick={() => navigate("/")} 
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-12 rounded-xl"
            >
              Return Home
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;

