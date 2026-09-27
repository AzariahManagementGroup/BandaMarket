import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Printer, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
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

  const handlePrint = () => {
    if (!ticket) return;

    // Get QR code as base64 image from canvas
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    const qrDataUrl = canvas ? canvas.toDataURL("image/png") : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>CameMark Forum Pass — ${ticket.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0fdf4; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .pass {
      width: 680px; background: white; border-radius: 20px;
      overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      border: 1px solid #d1fae5;
    }
    .header {
      background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
      padding: 32px 36px; color: white;
      display: flex; justify-content: space-between; align-items: center; gap: 24px;
    }
    .header-left .event-label {
      font-size: 11px; letter-spacing: 4px; text-transform: uppercase;
      opacity: 0.65; margin-bottom: 8px;
    }
    .header-left .title { font-size: 26px; font-weight: 800; line-height: 1.1; }
    .header-left .badge {
      margin-top: 12px; display: inline-block;
      background: rgba(255,255,255,0.18); border-radius: 30px;
      padding: 5px 16px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    }
    .qr-box { background: white; border-radius: 14px; padding: 10px; text-align: center; flex-shrink: 0; }
    .qr-box img { display: block; width: 100px; height: 100px; }
    .qr-label { font-size: 9px; color: #6b7280; margin-top: 5px; letter-spacing: 1px; text-transform: uppercase; }

    .tear { display: flex; align-items: center; background: #f0fdf4; padding: 0 20px; }
    .tear-circle-l { width: 22px; height: 22px; background: white; border-radius: 50%; margin-left: -31px; border: 1px solid #d1fae5; flex-shrink: 0; }
    .tear-line { flex: 1; border-top: 2.5px dashed #a7f3d0; margin: 0 6px; }
    .tear-circle-r { width: 22px; height: 22px; background: white; border-radius: 50%; margin-right: -31px; border: 1px solid #d1fae5; flex-shrink: 0; }

    .body { background: #f0fdf4; padding: 28px 36px 36px; display: flex; gap: 32px; align-items: flex-start; }
    .info { flex: 1; }
    .attendee-label { font-size: 10px; color: #059669; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .attendee-name { font-size: 22px; font-weight: 800; color: #064e3b; margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    td { padding: 9px 0; border-bottom: 1px solid #d1fae5; }
    td.label { color: #6b7280; width: 38%; }
    td.value { font-weight: 600; color: #1e293b; text-align: right; }
    td.value.green { color: #059669; font-weight: 700; }
    td.value.mono { font-family: monospace; font-size: 11px; color: #94a3b8; }

    .side { display: flex; flex-direction: column; gap: 10px; align-items: center; justify-content: flex-end; min-width: 110px; }
    .date-box { background: #064e3b; color: white; border-radius: 10px; padding: 10px 18px; text-align: center; }
    .date-day { font-size: 18px; font-weight: 800; }
    .date-month { font-size: 11px; opacity: 0.75; }
    .location { font-size: 11px; color: #047857; text-align: center; font-weight: 600; }

    .footer-bar {
      background: #064e3b; color: white; padding: 10px 36px;
      display: flex; justify-content: space-between; align-items: center; font-size: 11px;
    }
    .footer-bar .brand { font-weight: 800; letter-spacing: 1px; }
    .footer-bar .validity { opacity: 0.7; }
    @media print { body { background: white; } .pass { box-shadow: none; } }
  </style>
</head>
<body>
<div class="pass">
  <div class="header">
    <div class="header-left">
      <div class="event-label">CameMark Forum 2025</div>
      <div class="title">Event<br/>Admission Pass</div>
      <div class="badge">${ticket.category}</div>
    </div>
    ${qrDataUrl ? `<div class="qr-box">
      <img src="${qrDataUrl}" alt="QR Code"/>
      <div class="qr-label">Scan to verify</div>
    </div>` : ""}
  </div>

  <div class="tear">
    <div class="tear-circle-l"></div>
    <div class="tear-line"></div>
    <div class="tear-circle-r"></div>
  </div>

  <div class="body">
    <div class="info">
      <div class="attendee-label">Attendee</div>
      <div class="attendee-name">${ticket.name}</div>
      <table>
        <tr><td class="label">Email</td><td class="value">${ticket.email}</td></tr>
        <tr><td class="label">Phone</td><td class="value">${ticket.phone || "—"}</td></tr>
        ${ticket.city ? `<tr><td class="label">Location</td><td class="value">${ticket.city}, ${ticket.country}</td></tr>` : ""}
        <tr><td class="label">Amount Paid</td><td class="value green">${ticket.amount_paid}</td></tr>
        <tr><td class="label">Pass ID</td><td class="value mono">${ticket.id.substring(0, 16).toUpperCase()}...</td></tr>
      </table>
    </div>
    <div class="side">
      <div class="date-box">
        <div class="date-day">Oct 3–5</div>
        <div class="date-month">2025</div>
      </div>
      <div class="location">📍 Yaoundé,<br/>Malawi</div>
    </div>
  </div>

  <div class="footer-bar">
    <div class="brand">CameMark 🇨🇲</div>
    <div class="validity">Valid for event entry • Non-transferable</div>
  </div>
</div>
<script>window.onload = function(){ window.print(); window.onafterprint = function(){ window.close(); }; }</script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=800,height=700");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hidden canvas QR — used to extract PNG for print */}
      {ticket && (
        <div style={{ position: "absolute", left: -9999, top: -9999 }}>
          <QRCodeCanvas
            id="qr-canvas"
            value={qrValue}
            size={200}
            level="H"
            fgColor="#064e3b"
          />
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-slide { animation: fadeSlideUp .5s ease both; }
      `}</style>

      <main className="flex-1 py-16 px-4">
        <div className="max-w-lg mx-auto space-y-6">

          {/* Success badge */}
          <div className="text-center animate-fade-slide">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Payment Confirmed!</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Your forum pass is ready.{" "}
              {emailSent && (
                <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Confirmation sent to your email.
                </span>
              )}
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
              <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 p-6 text-white flex items-start justify-between gap-4">
                <div>
                  <p className="text-emerald-300 text-xs tracking-widest uppercase mb-1">CameMark Forum 2025</p>
                  <h2 className="text-xl font-extrabold leading-tight">Event Admission Pass</h2>
                  <span className="mt-2 inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full tracking-wider uppercase">
                    {ticket.category}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-2 shadow-lg shrink-0">
                  <QRCodeSVG value={qrValue} size={76} level="H" fgColor="#064e3b" />
                  <p className="text-[9px] text-gray-400 text-center mt-1 tracking-wider">SCAN TO VERIFY</p>
                </div>
              </div>

              {/* Tear line */}
              <div className="relative bg-emerald-50 flex items-center h-[1px]">
                <div className="absolute -left-3 w-6 h-6 rounded-full bg-background border border-emerald-100" />
                <div className="flex-1 mx-3 border-t-2 border-dashed border-emerald-200" />
                <div className="absolute -right-3 w-6 h-6 rounded-full bg-background border border-emerald-100" />
              </div>

              {/* Pass body */}
              <div className="bg-emerald-50 px-6 pb-4 pt-5 flex gap-4">
                <div className="flex-1 space-y-2.5">
                  <div className="mb-3">
                    <p className="text-[10px] text-emerald-600 uppercase tracking-widest">Attendee</p>
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
                </div>
                <div className="flex flex-col items-center justify-end gap-2 min-w-[90px]">
                  <div className="bg-emerald-700 text-white rounded-xl px-4 py-2 text-center">
                    <div className="font-extrabold text-sm">Oct 3–5</div>
                    <div className="text-xs opacity-75">2025</div>
                  </div>
                  <p className="text-[10px] text-emerald-700 text-center font-medium">📍 Yaoundé,<br/>Malawi</p>
                </div>
              </div>

              {/* Footer bar */}
              <div className="bg-emerald-900 text-white px-6 py-2.5 flex justify-between items-center text-xs">
                <span className="font-bold tracking-wide">CameMark 🇨🇲</span>
                <span className="opacity-60">Valid for event entry • Non-transferable</span>
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
                onClick={handlePrint}
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
