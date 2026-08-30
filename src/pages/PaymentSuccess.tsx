import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/camemark/Navbar";
import Footer from "@/components/camemark/Footer";
import { getApiUrl } from "@/config";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get("email");
    const transactionId = searchParams.get("transactionId") || "";
    const requestId = searchParams.get("requestId") || "";

    if (email) {
      fetch(getApiUrl("/api/forum-success"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, transactionId, requestId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.ticket) {
          setTicket(data.ticket);
          setEmailSent(!!data.email_sent);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [location.search]);

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Print-only styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #printable-ticket { display: block !important; position: fixed; top: 0; left: 0; width: 100%; z-index: 9999; background: white; }
          .no-print { display: none !important; }
        }
        @media screen {
          #printable-ticket { display: none; }
        }
      `}</style>

      {/* Hidden printable ticket */}
      {ticket && (
        <div id="printable-ticket" style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ borderTop: "8px solid #064e3b", borderRadius: "12px", border: "1px solid #d1fae5", padding: "32px" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h1 style={{ color: "#064e3b", fontSize: "24px", margin: 0 }}>CameMark Forum 2025</h1>
              <p style={{ color: "#059669", margin: "4px 0 0", fontWeight: 600 }}>ADMISSION PASS</p>
            </div>
            <div style={{ borderTop: "2px dashed #d1fae5", borderBottom: "2px dashed #d1fae5", padding: "16px 0", margin: "16px 0" }}>
              <h2 style={{ margin: 0, fontSize: "20px", color: "#1e293b" }}>{ticket.name}</h2>
              <p style={{ margin: "4px 0", color: "#6b7280", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>{ticket.category}</p>
            </div>
            <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
              <tbody>
                <tr><td style={{ color: "#6b7280", padding: "6px 0" }}>Email</td><td style={{ textAlign: "right", fontWeight: 600 }}>{ticket.email}</td></tr>
                <tr><td style={{ color: "#6b7280", padding: "6px 0" }}>Phone</td><td style={{ textAlign: "right" }}>{ticket.phone}</td></tr>
                <tr><td style={{ color: "#6b7280", padding: "6px 0" }}>Location</td><td style={{ textAlign: "right" }}>{ticket.city}, {ticket.country}</td></tr>
                <tr><td style={{ color: "#6b7280", padding: "6px 0" }}>Amount Paid</td><td style={{ textAlign: "right", color: "#059669", fontWeight: 700 }}>{ticket.amount_paid}</td></tr>
                <tr><td style={{ color: "#6b7280", padding: "6px 0" }}>Pass ID</td><td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "11px", color: "#94a3b8" }}>{ticket.id.substring(0, 13).toUpperCase()}...</td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: "20px", background: "#f0fdf4", borderRadius: "8px", padding: "12px", textAlign: "center", fontSize: "12px", color: "#065f46" }}>
              📅 October 3–5, 2025 &nbsp;|&nbsp; 📍 Yaoundé, Cameroon
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex items-center justify-center py-20 px-4 no-print">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8 text-center space-y-6 relative overflow-hidden">
          {/* Decorative Top Banner */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-emerald-600"></div>

          <div className="flex justify-center mt-4">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground text-sm">
              Your forum pass has been confirmed.
              {emailSent && " A copy has been sent to your email."}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
              <p className="text-sm text-gray-500">Generating your ticket...</p>
            </div>
          ) : ticket ? (
            <div ref={ticketRef} className="bg-gray-50 rounded-xl p-6 text-left border border-gray-100 relative">
              {/* Ticket cutouts */}
              <div className="absolute left-[-12px] top-1/2 w-6 h-6 bg-white rounded-full border-r border-gray-100 transform -translate-y-1/2"></div>
              <div className="absolute right-[-12px] top-1/2 w-6 h-6 bg-white rounded-full border-l border-gray-100 transform -translate-y-1/2"></div>

              <div className="border-b border-dashed border-gray-300 pb-4 mb-4">
                <h3 className="font-bold text-lg text-emerald-800">CameMark Forum Pass</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{ticket.category}</p>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-bold text-gray-800">{ticket.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-800 text-xs">{ticket.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium text-gray-800">{ticket.phone}</span>
                </div>
                {ticket.city && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium text-gray-800">{ticket.city}, {ticket.country}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid:</span>
                  <span className="font-bold text-emerald-600">{ticket.amount_paid}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-dashed border-gray-200 mt-2">
                  <span className="text-gray-500">Pass ID:</span>
                  <span className="font-mono text-xs text-gray-400">{ticket.id.substring(0, 13).toUpperCase()}...</span>
                </div>
              </div>

              <div className="mt-4 bg-emerald-50 rounded-lg p-3 text-center text-xs text-emerald-800 font-medium">
                📅 Oct 3–5, 2025 &nbsp;|&nbsp; 📍 Yaoundé, Cameroon
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm border border-orange-100">
              We couldn't retrieve your ticket details immediately, but your registration was successful! Please check your email for the pass.
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {ticket && (
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 font-bold h-12 rounded-xl border-emerald-200 hover:bg-emerald-50 text-emerald-800"
              >
                <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
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
