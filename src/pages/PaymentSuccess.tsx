import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Printer, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/camemark/Navbar";
import Footer from "@/components/camemark/Footer";
import { getApiUrl } from "@/config";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

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

  const qrValue = ticket
    ? `CAMEMARK-FORUM-2025|ID:${ticket.id}|NAME:${ticket.name}|EMAIL:${ticket.email}|CAT:${ticket.category}`
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #printable-pass { display: flex !important; position: fixed; inset: 0; z-index: 9999; background: white; align-items: center; justify-content: center; }
          .no-print { display: none !important; }
        }
        @media screen { #printable-pass { display: none; } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-slide { animation: fadeSlideUp .5s ease both; }
      `}</style>

      {/* ── Printable Pass (hidden on screen, shown on print) ── */}
      {ticket && (
        <div id="printable-pass">
          <div style={{
            width: "720px", fontFamily: "'Segoe UI', sans-serif",
            borderRadius: "20px", overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid #d1fae5"
          }}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)", padding: "32px 40px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "12px", letterSpacing: "4px", textTransform: "uppercase", opacity: 0.7, marginBottom: "6px" }}>CameMark Forum 2025</div>
                <div style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1.1 }}>Event<br />Admission Pass</div>
                <div style={{ marginTop: "12px", background: "rgba(255,255,255,0.15)", borderRadius: "20px", padding: "4px 14px", display: "inline-block", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>{ticket.category}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ background: "white", borderRadius: "12px", padding: "12px" }}>
                  <QRCodeSVG value={qrValue} size={100} level="H" fgColor="#064e3b" />
                </div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", marginTop: "6px" }}>Scan to verify</div>
              </div>
            </div>

            {/* Dashed separator */}
            <div style={{ background: "#f0fdf4", display: "flex", alignItems: "center", padding: "0 40px" }}>
              <div style={{ width: "20px", height: "20px", background: "white", borderRadius: "50%", marginLeft: "-52px", flexShrink: 0, border: "1px solid #d1fae5" }} />
              <div style={{ flex: 1, borderTop: "2px dashed #a7f3d0", margin: "0 8px" }} />
              <div style={{ width: "20px", height: "20px", background: "white", borderRadius: "50%", marginRight: "-52px", flexShrink: 0, border: "1px solid #d1fae5" }} />
            </div>

            {/* Body */}
            <div style={{ background: "#f0fdf4", padding: "28px 40px 36px", display: "flex", gap: "40px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ color: "#6b7280", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Attendee</div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#064e3b" }}>{ticket.name}</div>
                </div>
                {[
                  ["Email", ticket.email],
                  ["Phone", ticket.phone],
                  ["Location", `${ticket.city}, ${ticket.country}`],
                  ["Amount Paid", ticket.amount_paid],
                  ["Pass ID", ticket.id.substring(0, 13).toUpperCase() + "..."],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #d1fae5", padding: "8px 0", fontSize: "13px" }}>
                    <span style={{ color: "#6b7280" }}>{label}</span>
                    <span style={{ fontWeight: 600, color: label === "Amount Paid" ? "#059669" : "#1e293b" }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "8px", minWidth: "120px" }}>
                <div style={{ background: "#064e3b", color: "white", borderRadius: "8px", padding: "10px 16px", textAlign: "center", fontSize: "12px" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>Oct 3–5</div>
                  <div style={{ opacity: 0.8 }}>2025</div>
                </div>
                <div style={{ textAlign: "center", fontSize: "11px", color: "#047857" }}>📍 Yaoundé, Cameroon</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Screen view ── */}
      <main className="flex-1 py-16 px-4 no-print">
        <div className="max-w-lg mx-auto space-y-6">

          {/* Success badge */}
          <div className="text-center animate-fade-slide">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Payment Confirmed!</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Your forum pass is ready.{" "}
              {emailSent
                ? <span className="text-emerald-600 font-medium flex items-center justify-center gap-1 mt-1"><Mail className="w-3 h-3" /> Confirmation sent to your email.</span>
                : "Check your email shortly for a copy."}
            </p>
          </div>

          {/* Ticket card */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-sm text-gray-500">Generating your pass...</p>
            </div>
          ) : ticket ? (
            <div className="animate-fade-slide rounded-2xl overflow-hidden shadow-xl border border-emerald-100" style={{ animationDelay: ".1s" }}>
              {/* Pass header */}
              <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-emerald-300 text-xs tracking-widest uppercase mb-1">CameMark Forum 2025</p>
                    <h2 className="text-xl font-extrabold leading-tight">Event Admission Pass</h2>
                    <span className="mt-2 inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full tracking-wider uppercase">
                      {ticket.category}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-2 shadow-lg">
                    <QRCodeSVG
                      value={qrValue}
                      size={80}
                      level="H"
                      fgColor="#064e3b"
                    />
                  </div>
                </div>
              </div>

              {/* Tear line */}
              <div className="relative bg-emerald-50 flex items-center">
                <div className="absolute -left-3 w-6 h-6 rounded-full bg-background border border-emerald-100" />
                <div className="flex-1 mx-3 border-t-2 border-dashed border-emerald-200" />
                <div className="absolute -right-3 w-6 h-6 rounded-full bg-background border border-emerald-100" />
              </div>

              {/* Pass body */}
              <div className="bg-emerald-50 px-6 pb-6 pt-4 space-y-3">
                <div className="mb-2">
                  <p className="text-xs text-emerald-600 uppercase tracking-widest">Attendee</p>
                  <p className="text-lg font-extrabold text-emerald-900">{ticket.name}</p>
                </div>

                {[
                  ["Email", ticket.email],
                  ["Phone", ticket.phone],
                  ticket.city ? ["Location", `${ticket.city}, ${ticket.country}`] : null,
                  ["Amount Paid", ticket.amount_paid],
                ].filter(Boolean).map(([label, value]: any) => (
                  <div key={label} className="flex justify-between text-sm border-b border-emerald-100 pb-2">
                    <span className="text-gray-500">{label}</span>
                    <span className={`font-semibold ${label === "Amount Paid" ? "text-emerald-600" : "text-gray-800"}`}>{value}</span>
                  </div>
                ))}

                <div className="flex justify-between text-xs pt-1">
                  <span className="text-gray-400">Pass ID</span>
                  <span className="font-mono text-gray-400">{ticket.id.substring(0, 13).toUpperCase()}...</span>
                </div>

                <div className="mt-3 bg-emerald-700 text-white rounded-xl p-3 flex justify-between items-center text-sm font-medium">
                  <span>📅 Oct 3–5, 2025</span>
                  <span>📍 Yaoundé, Cameroon</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 text-orange-800 p-5 rounded-2xl text-sm border border-orange-100">
              We couldn't retrieve your ticket right now, but your registration is confirmed! Please check your email for the pass.
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 animate-fade-slide" style={{ animationDelay: ".2s" }}>
            {ticket && (
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold"
              >
                <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
              </Button>
            )}
            <Button
              onClick={() => navigate("/")}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white h-12 rounded-xl font-bold"
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
