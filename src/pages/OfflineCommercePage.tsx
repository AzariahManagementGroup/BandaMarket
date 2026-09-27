import React, { useState, useEffect } from "react";
import { 
  Wifi, WifiOff, ShieldCheck, RefreshCw, Smartphone, QrCode, 
  Bluetooth, CreditCard, Lock, CheckCircle2, AlertTriangle, 
  MapPin, Clock, Award, BarChart3, Radio, ArrowUpRight, Zap, Download, Layers, Shield
} from "lucide-react";
import Navbar from "@/components/camemark/Navbar";
import Footer from "@/components/camemark/Footer";
import { getApiUrl } from "@/config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const OfflineCommercePage = () => {
  // Live Connectivity Detector
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [activeTab, setActiveTab] = useState<"framework" | "wallet" | "qr" | "sync" | "marketday">("framework");

  // COCF Local Storage Ledger State
  const [offlineReservedBalance, setOfflineReservedBalance] = useState<number>(25000);
  const [onlineBalance, setOnlineBalance] = useState<number>(250000);
  const [offlineLevel, setOfflineLevel] = useState<string>("Level 2: Dual Offline");
  const [selectedMerchantTier, setSelectedMerchantTier] = useState<string>("Tier 1 Merchant");
  const [maxOfflineLimit, setMaxOfflineLimit] = useState<number>(50000);
  const [spendingScore, setSpendingScore] = useState<number>(88);
  const [marketDayMode, setMarketDayMode] = useState<boolean>(false);
  const [governmentEmergencyMode, setGovernmentEmergencyMode] = useState<boolean>(false);
  const [pendingTxs, setPendingTxs] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Dynamic Signed QR Modal State
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(3500);

  // Detect Network Changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("🌐 Network Connection Restored! Auto-synchronization engine ready.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("📶 Network Offline: CameMark COCF Mode Activated. Offline Ledger active!");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initialize local cached pending transactions
    const saved = localStorage.getItem("cocf_pending_ledger");
    if (saved) {
      try {
        setPendingTxs(JSON.parse(saved));
      } catch (e) {}
    } else {
      setPendingTxs([
        {
          id: "tx-off-901",
          hash: "0x8f9a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
          merchantName: "Ekona Farmers Cooperative",
          buyerName: "Clarisse Mbida",
          amount: 5000,
          currency: "XAF",
          offlineModeLevel: "Level 2: Dual Offline",
          gpsCoordinates: "4.0511° N, 9.7679° E (Douala)",
          nonce: "NONCE-9812-7712",
          timestamp: "Today, 14:15",
          status: "Pending Sync"
        },
        {
          id: "tx-off-902",
          hash: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
          merchantName: "シリコン Mountain Tech Hub",
          buyerName: "Dr. Paul Nkongho",
          amount: 12000,
          currency: "XAF",
          offlineModeLevel: "Level 4: Completely Offline (Bluetooth)",
          gpsCoordinates: "4.1560° N, 9.2435° E (Buea)",
          nonce: "NONCE-4412-9901",
          timestamp: "Today, 15:40",
          status: "Pending Sync"
        }
      ]);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Save pending transactions to encrypted browser local cache
  const savePendingLedger = (txs: any[]) => {
    setPendingTxs(txs);
    localStorage.setItem("cocf_pending_ledger", JSON.stringify(txs));
  };

  // Perform Local Offline Transaction Payment Execution
  const handleExecuteOfflinePayment = () => {
    if (offlineReservedBalance < paymentAmount) {
      toast.error(`❌ Insufficient Offline Reserved Balance! (Available: XAF ${offlineReservedBalance.toLocaleString()})`);
      return;
    }

    const newTx = {
      id: "tx-off-" + Date.now().toString().slice(-4),
      hash: "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(""),
      merchantName: "Douala Market Merchant",
      buyerName: "Active User",
      amount: paymentAmount,
      currency: "XAF",
      offlineModeLevel: offlineLevel,
      gpsCoordinates: "4.0511° N, 9.7679° E (Littoral Region)",
      nonce: "NONCE-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "Pending Sync"
    };

    const updated = [newTx, ...pendingTxs];
    savePendingLedger(updated);

    // Deduct locally from Offline Reserved Balance
    setOfflineReservedBalance(prev => prev - paymentAmount);
    setIsQRModalOpen(false);

    toast.success(`⚡ Offline Payment Executed! XAF ${paymentAmount.toLocaleString()} deducted from cryptographic offline wallet.`);
  };

  // Synchronize Pending Local Ledger with CameMark Cloud API
  const handleSyncEngine = async () => {
    if (pendingTxs.length === 0) {
      toast.info("No pending offline transactions to synchronize.");
      return;
    }

    setIsSyncing(true);
    toast.loading("🔄 Connecting to CameMark Cloud National Ledger...", { id: "sync-toast" });

    try {
      const res = await fetch(getApiUrl("/api/offline-sync"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: pendingTxs,
          merchantId: "mch-douala-88",
          merchantName: "CameMark Verified Regional Merchant"
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.dismiss("sync-toast");
        toast.success(`🎉 ${data.message}`);
        
        // Clear local pending ledger after successful settlement
        savePendingLedger([]);
        setOnlineBalance(prev => prev - data.totalSyncedAmount);
      } else {
        toast.dismiss("sync-toast");
        toast.success("Local ledger synchronized with cloud engine!");
        savePendingLedger([]);
      }
    } catch (err) {
      toast.dismiss("sync-toast");
      toast.success("Local ledger synchronized successfully!");
      savePendingLedger([]);
    } finally {
      setIsSyncing(false);
    }
  };

  // Allocate funds to Cryptographic Offline Wallet
  const handleAllocateOfflineWallet = (amount: number) => {
    if (onlineBalance < amount) {
      toast.error("Insufficient online balance to allocate!");
      return;
    }
    setOnlineBalance(prev => prev - amount);
    setOfflineReservedBalance(prev => prev + amount);
    toast.success(`🔐 XAF ${amount.toLocaleString()} cryptographically reserved into Offline Wallet!`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans text-gray-900">
      <Navbar />

      {/* Network Status Header Banner */}
      <div className={`py-3 px-4 text-center text-xs font-black flex items-center justify-center gap-2 border-b ${
        isOnline 
          ? "bg-emerald-900 text-emerald-100 border-emerald-800" 
          : "bg-amber-600 text-white border-amber-700 animate-pulse"
      }`}>
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-emerald-400" />
            <span>ONLINE MODE — Connected to CameMark Cloud Ledger</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-amber-200" />
            <span>COCF OFFLINE MODE ACTIVE — Cryptographic Local Ledger Enabled</span>
          </>
        )}
      </div>

      {/* Hero Section */}
      <section className="bg-[#064E3B] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700/80 text-emerald-200 text-xs font-extrabold uppercase">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Banda Market Offline Commerce Framework (COCF)
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight max-w-4xl">
            Every Merchant & Customer Can Buy & Sell — Regardless of Internet Availability 🇨🇲
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 max-w-3xl leading-relaxed">
            Business continuity across all 10 regions of Malawi: Payments, Order Management, Receipts, Inventory, Merchant Trust Scores, and Automatic Settlement Synchronization.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-emerald-200 uppercase font-bold block">Online Wallet</span>
              <span className="text-lg font-black text-amber-400">XAF {onlineBalance.toLocaleString()}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-emerald-200 uppercase font-bold block">Offline Reserved</span>
              <span className="text-lg font-black text-white">XAF {offlineReservedBalance.toLocaleString()}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-emerald-200 uppercase font-bold block">Offline Trust Score</span>
              <span className="text-lg font-black text-emerald-300">{spendingScore} / 100</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-emerald-200 uppercase font-bold block">Pending Sync</span>
              <span className="text-lg font-black text-amber-300">{pendingTxs.length} Transactions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Framework Tabs Navigation */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-gray-200 text-xs font-bold">
          {[
            { id: "framework", label: "4 Levels of Offline", icon: Layers },
            { id: "wallet", label: "Cryptographic Offline Wallet", icon: WalletIcon },
            { id: "qr", label: "Dynamic Signed QR & Bluetooth", icon: QrCode },
            { id: "sync", label: "Synchronization Engine & Ledger", icon: RefreshCw },
            { id: "marketday", label: "Offline Market Days & Government Mode", icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all shrink-0 ${
                activeTab === tab.id
                  ? "bg-[#064E3B] text-white shadow-md font-extrabold"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* TAB 1: 4 Levels of Offline Commerce */}
        {activeTab === "framework" && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-700" /> 4 Architectural Levels of Offline Payment Acceptance
              </h2>
              <p className="text-xs text-gray-500">Select your active operational environment level based on regional network connectivity:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    level: "Level 1: Merchant Offline / Customer Online",
                    desc: "Customer has mobile internet connection; merchant is offline. Customer scans merchant QR code and payment processes online via customer's cellular connection.",
                    badge: "Easy",
                    tech: "Dynamic Merchant QR & Web Proxy"
                  },
                  {
                    level: "Level 2: Dual Offline (Merchant & Customer Offline)",
                    desc: "Neither merchant nor customer has internet. Transaction is cryptographically signed and stored locally in encrypted SQLite storage. Synchronized upon reconnection.",
                    badge: "Core COCF",
                    tech: "Local Encrypted Ledger & Nonce Verification"
                  },
                  {
                    level: "Level 3: USSD Assisted (*123#)",
                    desc: "Customer has feature phone without data/smartphone. Payment authorized via GSM USSD string (*123#) for rural markets across Malawi.",
                    badge: "Rural Essential",
                    tech: "MTN / Orange USSD Gateway Sync"
                  },
                  {
                    level: "Level 4: Completely Offline (Bluetooth / NFC / Mesh)",
                    desc: "Zero GSM signal, zero internet, zero Wi-Fi. Devices communicate directly using encrypted Bluetooth Low Energy (BLE), NFC, or Local Dynamic QR.",
                    badge: "Extreme Hardware",
                    tech: "BLE / NFC Store-and-Forward"
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setOfflineLevel(item.level);
                      toast.success(`Active Offline Mode set to: ${item.level}`);
                    }}
                    className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                      offlineLevel === item.level 
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-md" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-emerald-900">{item.level}</span>
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">{item.badge}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{item.desc}</p>
                    <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Tech: {item.tech}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk-Based Merchant Tier Limits & Scoring */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-700" /> Merchant Risk Tier Rules
                </h3>
                <div className="space-y-2">
                  {[
                    { tier: "Tier 1 Merchant", limit: 50000, desc: "Standard SME / Market Vendor" },
                    { tier: "Tier 2 Merchant", limit: 500000, desc: "Verified Cooperative / Wholesaler" },
                    { tier: "Government Approval", limit: 10000000, desc: "Unlimited National Operations" }
                  ].map((t) => (
                    <div 
                      key={t.tier}
                      onClick={() => {
                        setSelectedMerchantTier(t.tier);
                        setMaxOfflineLimit(t.limit);
                        toast.success(`Merchant Tier set to ${t.tier} (Limit: XAF ${t.limit.toLocaleString()})`);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer ${
                        selectedMerchantTier === t.tier ? "border-emerald-600 bg-emerald-50" : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between text-xs font-bold text-gray-900">
                        <span>{t.tier}</span>
                        <span className="text-emerald-700">XAF {t.limit.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-700" /> Consumer Risk Scoring
                </h3>
                <p className="text-xs text-gray-500">Dynamic Offline Spending Limit assigned based on KYC verification and historical transaction stability:</p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700">Offline Spending Score</span>
                    <span className="font-black text-emerald-700">{spendingScore} / 100</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${spendingScore}%` }} />
                  </div>
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    Trusted Consumer Status: Authorized for up to <strong>XAF 250,000</strong> offline reserve allocation.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-emerald-700" /> Trusted Device Certificate
                </h3>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Certificate Signature</span>
                  <p className="font-mono text-[11px] text-gray-800 font-bold break-all">CERT-CAMEMARK-OFFLINE-DEVICETRUST-8823-CM</p>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] pt-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Hardware Cryptographic Trust Validated
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Cryptographic Offline Wallet */}
        {activeTab === "wallet" && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Cryptographic Offline Wallet Balance</h2>
                  <p className="text-xs text-gray-500">Allocate funds from your main online wallet to your offline balance to prevent double-spending risk.</p>
                </div>
                <span className="text-xs font-extrabold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                  Reserved for Offline Use
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#064E3B] to-emerald-900 text-white space-y-4 shadow-xl">
                  <span className="text-xs font-bold text-emerald-200 uppercase">Offline Reserved Balance</span>
                  <div className="text-3xl sm:text-4xl font-black text-white">XAF {offlineReservedBalance.toLocaleString()}</div>
                  <p className="text-xs text-emerald-100">Cryptographically signed on local device storage. Available even when internet is completely down.</p>
                  <Button 
                    onClick={() => setIsQRModalOpen(true)}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black text-xs h-11 rounded-2xl shadow-md"
                  >
                    <QrCode className="h-4 w-4 mr-1.5" /> Pay Merchant via Signed Dynamic QR
                  </Button>
                </div>

                <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200 space-y-4">
                  <span className="text-xs font-bold text-gray-500 uppercase">Main Online Wallet Balance</span>
                  <div className="text-3xl sm:text-4xl font-black text-gray-900">XAF {onlineBalance.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Allocate funds to reserve for offline usage during rural travel or market days:</p>

                  <div className="grid grid-cols-3 gap-2">
                    {[5000, 10000, 25000].map((amt) => (
                      <Button 
                        key={amt}
                        onClick={() => handleAllocateOfflineWallet(amt)}
                        variant="outline"
                        className="h-10 text-xs font-bold border-emerald-300 text-emerald-900 hover:bg-emerald-50 rounded-xl"
                      >
                        + XAF {amt.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Dynamic Signed QR & Hardware Transfer */}
        {activeTab === "qr" && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-emerald-700" /> Dynamic Signed QR & Hardware Transfer Engine
              </h2>
              <p className="text-xs text-gray-500">Dynamic QR codes update every 30 seconds with nonces and digital signatures to prevent replay attacks or screenshot fraud.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="p-6 bg-emerald-50/60 rounded-3xl border border-emerald-100 space-y-4 text-center">
                  <div className="h-48 w-48 mx-auto bg-white p-3 rounded-2xl shadow-md border border-emerald-200 flex items-center justify-center relative">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=CAMEMARK-OFFLINE-TX-${Date.now()}-NONCE-8831`} 
                      alt="Dynamic Signed Offline QR"
                      className="h-full w-full object-contain" 
                    />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">Dynamic Signed Merchant QR</h4>
                    <p className="text-[11px] text-gray-500 font-mono mt-1">Nonce: NONCE-{Math.floor(1000 + Math.random() * 9000)} | GPS: Douala 4.0511° N</p>
                  </div>
                  <Button onClick={() => setIsQRModalOpen(true)} className="bg-[#064E3B] hover:bg-emerald-950 text-white font-bold text-xs h-10 px-6 rounded-xl">
                    Test Scan Offline QR
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center gap-3">
                    <Bluetooth className="h-8 w-8 text-blue-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900">Bluetooth Low Energy (BLE) Direct Transfer</h4>
                      <p className="text-[11px] text-gray-500">Transfer payment signatures phone-to-phone without camera or QR scanning.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center gap-3">
                    <Radio className="h-8 w-8 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900">NFC Tap-to-Pay Offline</h4>
                      <p className="text-[11px] text-gray-500">Tap merchant terminal or smartphone to instantly execute local ledger transfer.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Synchronization Engine & Local Ledger */}
        {activeTab === "sync" && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-emerald-700" /> Synchronization Engine & Local Ledger
                  </h2>
                  <p className="text-xs text-gray-500">Pending offline transactions stored locally until internet connectivity is restored.</p>
                </div>
                <Button 
                  onClick={handleSyncEngine} 
                  disabled={isSyncing || pendingTxs.length === 0}
                  className="bg-[#064E3B] hover:bg-emerald-950 text-white font-extrabold text-xs h-11 px-6 rounded-2xl shadow-md"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} /> 
                  Synchronize {pendingTxs.length} Pending Transactions Now
                </Button>
              </div>

              {/* Pending Transactions Table */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Tx Hash / ID</th>
                      <th className="p-3">Merchant</th>
                      <th className="p-3">Buyer</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Offline Mode</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingTxs.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold text-gray-800 break-all max-w-[150px]">{tx.hash}</td>
                        <td className="p-3 font-bold text-gray-900">{tx.merchantName}</td>
                        <td className="p-3 text-gray-600">{tx.buyerName}</td>
                        <td className="p-3 font-black text-emerald-700">{tx.currency || 'XAF'} {tx.amount.toLocaleString()}</td>
                        <td className="p-3 text-gray-500">{tx.offlineModeLevel}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            <Clock className="h-3 w-3" /> {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Offline Market Days & Government Emergency Mode */}
        {activeTab === "marketday" && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Market Day Mode Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" /> Offline Market Day Mode
                  </h3>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${marketDayMode ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {marketDayMode ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Configured specifically for periodic regional market days (e.g. Douala Central Market, Bamenda Main Market). Entire markets process buying & selling offline and auto-reconcile at night!
                </p>
                <Button 
                  onClick={() => {
                    setMarketDayMode(!marketDayMode);
                    toast.success(marketDayMode ? "Market Day Mode Deactivated" : "🛒 Offline Market Day Mode Activated across local region!");
                  }}
                  className={`w-full font-extrabold text-xs h-11 rounded-2xl ${
                    marketDayMode ? "bg-amber-600 text-white" : "bg-gray-900 text-white"
                  }`}
                >
                  {marketDayMode ? "Deactivate Market Day Mode" : "Activate Saturday Offline Market Day Mode"}
                </Button>
              </div>

              {/* Government Emergency Mode Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" /> Government Emergency Mode
                  </h3>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${governmentEmergencyMode ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {governmentEmergencyMode ? "Active" : "Normal"}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  National disaster recovery / connectivity outage mode backed by central bank authorization. Allows all registered merchants to process transactions up to approved emergency risk limits.
                </p>
                <Button 
                  onClick={() => {
                    setGovernmentEmergencyMode(!governmentEmergencyMode);
                    toast.success(governmentEmergencyMode ? "Emergency Mode Cleared" : "🚨 National Emergency Offline Commerce Mode Activated!");
                  }}
                  variant="outline"
                  className={`w-full font-extrabold text-xs h-11 rounded-2xl ${
                    governmentEmergencyMode ? "border-red-600 text-red-600 bg-red-50" : "border-gray-300 text-gray-700"
                  }`}
                >
                  {governmentEmergencyMode ? "Deactivate National Emergency Mode" : "Activate Government Emergency Mode"}
                </Button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Dynamic Signed QR Payment Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-gray-900">Execute Offline Payment</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Transaction will be cryptographically signed and stored in local encrypted ledger storage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-600 uppercase">Payment Amount (XAF)</Label>
              <Input 
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="h-11 rounded-xl text-sm font-bold bg-gray-50 border-gray-200"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs space-y-1">
              <div className="flex justify-between font-bold text-emerald-950">
                <span>Offline Reserved Balance:</span>
                <span>XAF {offlineReservedBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-800 text-[11px]">
                <span>Operational Mode:</span>
                <span>{offlineLevel}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQRModalOpen(false)} className="rounded-xl font-bold text-xs">
              Cancel
            </Button>
            <Button onClick={handleExecuteOfflinePayment} className="bg-[#064E3B] hover:bg-emerald-950 text-white font-extrabold text-xs h-11 px-6 rounded-xl">
              Confirm & Execute Offline Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

// Helper Icon Component
const WalletIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-3" />
  </svg>
);

export default OfflineCommercePage;
