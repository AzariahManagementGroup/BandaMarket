import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Store, MapPin, Package, AlertCircle, ShoppingCart, MessageCircle, 
  Lock, Eye, EyeOff, Share2, Copy, Heart, Star, ArrowLeft, Send, 
  CheckCircle2, Clock, ShieldCheck, ChevronRight, Minus, Plus, Info, MessageSquare
} from "lucide-react";
import Navbar from "@/components/camemark/Navbar";
import Footer from "@/components/camemark/Footer";
import { supabase } from "@/integrations/supabase/client";
import { getApiUrl } from "@/config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const ProductDetailModal = ({ product, isOpen, onClose }: { product: any; isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<"detail" | "start-bargain" | "bargain-chat">("detail");
  const [offerPrice, setOfferPrice] = useState<number>(product?.price ? Math.round(product.price * 0.88) : 2200);
  const [offerQty, setOfferQty] = useState<number>(100);
  const [deliveryLoc, setDeliveryLoc] = useState<string>("Buea, Southwest Region");
  const [offerMessage, setOfferMessage] = useState<string>(`Hello, I'm interested in buying ${product?.title || 'this item'}. Please let me know if you can accept my offer.`);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    if (product?.price) {
      setOfferPrice(Math.round(product.price * 0.88));
    }
  }, [product]);

  if (!product) return null;

  const totalOfferAmount = offerPrice * offerQty;
  const savings = Math.max(0, (product.price - offerPrice) * offerQty);

  const handleSendBargainOffer = () => {
    setActiveStep("bargain-chat");
    setChatMessages([
      {
        id: 1,
        sender: "user",
        text: `You made an offer`,
        price: offerPrice,
        qty: offerQty,
        total: totalOfferAmount,
        time: "Today, 10:30 AM"
      },
      {
        id: 2,
        sender: "seller",
        text: `Seller Counter Offer`,
        price: Math.round(offerPrice * 1.05),
        qty: offerQty,
        total: Math.round(offerPrice * 1.05 * offerQty),
        time: "Today, 11:02 AM"
      },
      {
        id: 3,
        sender: "user",
        text: offerMessage || `Can you do ${product.currency || 'FCFA'} ${offerPrice.toLocaleString()}?`,
        time: "Today, 11:15 AM"
      },
      {
        id: 4,
        sender: "seller",
        text: `Yes, I can accept ${product.currency || 'FCFA'} ${offerPrice.toLocaleString()} for ${offerQty} ${product.unit || 'Kg'}`,
        status: "accepted",
        time: "Today, 11:20 AM"
      }
    ]);
    toast.success("🤝 Bargain offer sent to seller!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[96vw] sm:w-[480px] bg-white rounded-3xl p-0 overflow-hidden border border-gray-100 shadow-2xl max-h-[92vh] flex flex-col font-sans">
        
        {/* Step 1: Product Detail View (Screen 1) */}
        {activeStep === "detail" && (
          <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
            
            {/* Header image carousel with overlay icons */}
            <div className="relative h-64 sm:h-72 w-full bg-gray-900 overflow-hidden shrink-0">
              <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
              <button onClick={onClose} className="absolute top-3 left-3 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button className="h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md">
                  <Heart className="h-4 w-4" />
                </button>
                <button onClick={() => {
                  const shareText = `🛒 *${product.title}*\n💰 Price: ${product.currency || 'FCFA'} ${product.price?.toLocaleString()}\n👉 Buy on CameMark: ${window.location.origin}/checkout?productId=${product.id}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
                }} className="h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
              <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-md">
                1/6
              </span>
            </div>

            {/* Content info */}
            <div className="p-5 space-y-4 flex-1">
              
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified Merchant
                </span>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{product.title}</h2>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                  <span>From: <strong className="text-gray-900">{product.sellerName || 'Ekona Farmers Cooperative'}</strong></span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> 4.8 (128)
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-bold">{product.city || 'Buea'}, {product.region || 'Southwest Region'}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#064E3B]">{product.currency || 'FCFA'} {product.price?.toLocaleString()}</span>
                <span className="text-xs text-gray-400 text-muted-foreground">{product.unit ? `/ ${product.unit}` : '/ Kg'}</span>
              </div>

              {/* Bargain available badge */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                  🤝
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-950">Bargain Available</h4>
                  <p className="text-[11px] text-emerald-800">You can make an offer. The seller is open to reasonable offers.</p>
                </div>
              </div>

              {/* Product Details bullet specs */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-900 uppercase">Product Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 font-medium">
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">Quality: <strong className="text-gray-900 font-bold">Premium Grade</strong></div>
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">Sun-Dried & Cleaned</div>
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">Moisture: <strong className="text-gray-900 font-bold">7% Max</strong></div>
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">Stock: <strong className="text-gray-900 font-bold">1,250 Kg</strong></div>
                </div>
              </div>

            </div>

            {/* Bottom 3 Action Buttons */}
            <div className="p-4 bg-white border-t border-gray-100 grid grid-cols-3 gap-2 shrink-0">
              <Button 
                onClick={() => {
                  const whatsappMsg = `Hello ${product.sellerName || 'Seller'}, I want to chat about *${product.title}* listed on CameMark.`;
                  window.open(`https://api.whatsapp.com/send?phone=237600000000&text=${encodeURIComponent(whatsappMsg)}`, "_blank");
                }}
                variant="outline" 
                className="h-11 rounded-2xl text-xs font-bold border-gray-200 text-gray-700 bg-emerald-50/50 hover:bg-emerald-100 flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="h-4 w-4 text-emerald-700" /> Chat Seller
              </Button>

              <Button 
                onClick={() => setActiveStep("start-bargain")}
                className="h-11 rounded-2xl text-xs font-extrabold bg-[#064E3B] hover:bg-emerald-950 text-white flex items-center justify-center gap-1.5 shadow-md"
              >
                🤝 Start Bargain
              </Button>

              <Button 
                onClick={() => navigate(`/checkout?productId=${product.id}`)}
                className="h-11 rounded-2xl text-xs font-extrabold bg-amber-400 hover:bg-amber-500 text-emerald-950 flex items-center justify-center gap-1.5 shadow-md"
              >
                🛒 Buy Now
              </Button>
            </div>

          </div>
        )}

        {/* Step 2: Start Bargain Form (Screen 2) */}
        {activeStep === "start-bargain" && (
          <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <button onClick={() => setActiveStep("detail")} className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h3 className="font-extrabold text-base text-gray-900">Start Bargain</h3>
              <Info className="h-4 w-4 text-gray-400" />
            </div>

            <div className="p-5 space-y-5 flex-1">
              
              {/* Target Item summary card */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                  <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{product.title}</h4>
                  <p className="text-[10px] text-gray-500">{product.sellerName || 'Ekona Farmers Cooperative'}</p>
                  <p className="font-black text-emerald-700 text-xs">{product.currency || 'FCFA'} {product.price?.toLocaleString()} / Kg</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 font-medium">
                🤝 The seller is open to bargains. Make a fair offer and start a deal!
              </div>

              {/* Your Offer Inputs */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-900 uppercase">Your Offer</h4>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500">Offer Price (FCFA / Kg)</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input 
                        type="number" 
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(Number(e.target.value))}
                        className="h-12 rounded-xl text-base font-black border-gray-200 pl-3"
                      />
                    </div>
                    <button onClick={() => setOfferPrice(Math.max(100, offerPrice - 100))} className="h-12 w-12 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-lg text-gray-700 hover:bg-gray-100">
                      -
                    </button>
                    <button onClick={() => setOfferPrice(offerPrice + 100)} className="h-12 w-12 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-lg text-gray-700 hover:bg-gray-100">
                      +
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-gray-500">Your offer: FCFA {offerPrice.toLocaleString()}</span>
                    <span className="text-emerald-700 font-bold">Save: FCFA 300 (12%)</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-[11px] font-bold text-gray-500">Quantity</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={offerQty}
                      onChange={(e) => setOfferQty(Number(e.target.value))}
                      className="h-11 rounded-xl text-sm font-bold border-gray-200"
                    />
                    <span className="text-xs font-bold text-gray-500 shrink-0">Kg</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-[11px] font-bold text-gray-500">Delivery Location</label>
                  <Input 
                    type="text" 
                    value={deliveryLoc}
                    onChange={(e) => setDeliveryLoc(e.target.value)}
                    className="h-11 rounded-xl text-xs font-medium border-gray-200"
                  />
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-[11px] font-bold text-gray-500">Message to Seller (optional)</label>
                  <Textarea 
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    className="rounded-xl text-xs border-gray-200 min-h-[70px]"
                  />
                </div>

                {/* Offer Summary Box */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                  <h5 className="font-extrabold text-gray-900">Offer Summary</h5>
                  <div className="flex justify-between text-gray-600">
                    <span>Price per Kg:</span>
                    <span className="font-bold text-gray-900">FCFA {offerPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Quantity:</span>
                    <span className="font-bold text-gray-900">{offerQty} Kg</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-extrabold pt-1 border-t border-gray-200 text-sm">
                    <span>Total Offer:</span>
                    <span>FCFA {totalOfferAmount.toLocaleString()}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom CTA Button */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <Button 
                onClick={handleSendBargainOffer}
                className="w-full h-12 rounded-2xl text-sm font-extrabold bg-[#064E3B] hover:bg-emerald-950 text-white flex items-center justify-center gap-2 shadow-lg"
              >
                <Send className="h-4 w-4" /> Send Offer
              </Button>
              <p className="text-[10px] text-gray-400 text-center mt-2">The seller will be notified and can accept, reject or counter your offer.</p>
            </div>

          </div>
        )}

        {/* Step 3: Bargain Conversation Screen (Screen 3) */}
        {activeStep === "bargain-chat" && (
          <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <button onClick={() => setActiveStep("start-bargain")} className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h3 className="font-extrabold text-base text-gray-900">Bargain Conversation</h3>
              <Info className="h-4 w-4 text-gray-400" />
            </div>

            {/* Countdown ribbon */}
            <div className="bg-amber-50 p-2.5 text-center text-amber-900 text-xs font-bold border-b border-amber-200 flex items-center justify-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Bargain expires in 23h : 45m : 12s
            </div>

            {/* Chat Messages Log */}
            <div className="p-4 space-y-4 flex-1">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs shadow-sm ${
                    msg.sender === "user" 
                      ? "bg-emerald-50 border border-emerald-100 text-emerald-950 rounded-br-none" 
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}>
                    <div className="font-extrabold text-[11px] mb-1 flex items-center justify-between gap-4">
                      <span>{msg.sender === "user" ? "You" : "Seller"}</span>
                      <span className="text-[9px] text-gray-400 font-normal">{msg.time}</span>
                    </div>
                    <p>{msg.text}</p>
                    {msg.price && (
                      <div className="mt-2 pt-1 border-t border-black/10 font-bold flex justify-between gap-4">
                        <span>FCFA {msg.price.toLocaleString()} / Kg ({msg.qty} Kg)</span>
                        <span className="font-black text-emerald-800">FCFA {msg.total?.toLocaleString()}</span>
                      </div>
                    )}
                    {msg.status === "accepted" && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-emerald-600 text-white font-black px-2 py-0.5 rounded-md text-[10px]">
                        Offer Accepted ✓
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Deal Accepted Summary Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 mt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Final Price</span>
                  <span className="font-extrabold text-emerald-900">FCFA {offerPrice.toLocaleString()} / Kg</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Quantity</span>
                  <span className="font-bold text-gray-900">{offerQty} Kg</span>
                </div>
                <div className="flex justify-between text-emerald-900 font-black text-sm pt-1 border-t border-emerald-200">
                  <span>Total Amount</span>
                  <span>FCFA {totalOfferAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Proceed to Checkout or Cancel */}
            <div className="p-4 bg-white border-t border-gray-100 space-y-2 shrink-0">
              <Button 
                onClick={() => navigate(`/checkout?productId=${product.id}`)}
                className="w-full h-12 rounded-2xl text-sm font-extrabold bg-[#064E3B] hover:bg-emerald-950 text-white flex items-center justify-center gap-2 shadow-lg"
              >
                🛒 Proceed to Checkout
              </Button>
              <Button 
                onClick={() => setActiveStep("detail")}
                variant="outline" 
                className="w-full h-10 rounded-xl text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
              >
                Cancel Bargain
              </Button>
            </div>

          </div>
        )}

      </DialogContent>
    </Dialog>
  );
};
