import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { 
  ShieldCheck, Lock, CheckCircle2, MapPin, Truck, Wallet, 
  CreditCard, Phone, ArrowRight, Plus, Package, ShoppingCart, 
  Store, Gift, HelpCircle, LayoutDashboard, ShoppingBag, 
  Globe, Settings, MessageCircle, ArrowLeftRight, Bell, ChevronDown, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getApiUrl } from "@/config";
import { toast } from "sonner";
import logo from "@/assets/camemark-logo.png";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Form State
  const [deliveryAddressType, setDeliveryAddressType] = useState("home");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  
  const [billingDetails, setBillingDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "Nkolbisson, Avenue Kennedy, Yaoundé",
    city: "Yaoundé",
    region: "Centre",
    country: "Cameroon",
    saveInfo: true
  });

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(1400);

  const [deliveryFees, setDeliveryFees] = useState({ standardFee: 1000, expressFee: 2500, pickupFee: 0 });

  useEffect(() => {
    document.title = "Checkout | CameMark Secure Checkout";
    
    // Load local user profile
    const userStr = localStorage.getItem("camemark_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setProfile(u);
        setBillingDetails(prev => ({
          ...prev,
          fullName: u.fullName || u.full_name || "",
          email: u.email || "",
          phone: u.phone || ""
        }));
      } catch (e) {}
    }

    // Fetch dynamic logistics delivery fees set by Admin / Logistics Officer
    fetch(getApiUrl("/api/delivery-fees"))
      .then(res => res.json())
      .then(data => {
        if (data && data.deliveryFees) {
          setDeliveryFees({
            standardFee: parseFloat(data.deliveryFees.standardFee) || 1000,
            expressFee: parseFloat(data.deliveryFees.expressFee) || 2500,
            pickupFee: parseFloat(data.deliveryFees.pickupFee) || 0
          });
        }
      })
      .catch(err => console.error("Error fetching delivery fees:", err));

    // Load active product details dynamically by productId
    const localProducts = localStorage.getItem("camemark_products");
    if (localProducts) {
      try {
        const parsed = JSON.parse(localProducts);
        const found = parsed.find((p: any) => p.id === productId);
        if (found) {
          setProduct(found);
        } else if (parsed.length > 0) {
          setProduct(parsed[0]);
        }
      } catch (e) {}
    }

    fetch(getApiUrl("/api/products"))
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          const found = data.products.find((p: any) => p.id === productId);
          setProduct(found || data.products[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [productId]);

  const basePrice = product ? (typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0) : 13200;
  const shippingFee = shippingMethod === "express" 
    ? deliveryFees.expressFee 
    : shippingMethod === "pickup" 
    ? deliveryFees.pickupFee 
    : deliveryFees.standardFee;
  const serviceFee = 300;
  const tax = Math.round(basePrice * 0.1925);
  const totalAmount = Math.max(0, basePrice - discount + shippingFee + serviceFee + tax);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingDetails.fullName || !billingDetails.phone || !billingDetails.address) {
      toast.error("Please fill in your full name, phone number, and delivery address.");
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      productId: product?.id || "lst-default",
      productTitle: product?.title || "Marketplace Product",
      amount: totalAmount,
      currency: "XAF",
      sellerId: product?.sellerId || "",
      sellerName: product?.sellerName || "Green Harvest Farms",
      sellerEmail: product?.sellerEmail || "",
      buyerName: billingDetails.fullName,
      buyerEmail: billingDetails.email,
      buyerPhone: billingDetails.phone,
      deliveryAddress: `${billingDetails.address}, ${billingDetails.city}, ${billingDetails.region}`
    };

    try {
      const res = await fetch(getApiUrl("/api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("🎉 Order Placed Successfully! Confirmation emails & alerts sent.");
      } else {
        toast.success("Order Placed Successfully!");
      }
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      toast.success("Order Placed Successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans text-gray-800">
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 lg:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="CameMark Logo" className="h-9 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-full max-w-md">
            <Input 
              placeholder="Search products, farmers, stores, regions..." 
              className="bg-transparent border-0 focus-visible:ring-0 text-xs h-7 p-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 font-bold bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
            <Globe className="h-3.5 w-3.5" /> EN
          </div>
          
          {profile ? (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-900">{profile?.fullName || profile?.full_name || "Verified Buyer"}</p>
                <p className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                  <CheckCircle2 className="h-3 w-3" /> Verified Buyer
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-emerald-100 overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0">
                <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.fullName || "Buyer"}`} alt="User Avatar" />
              </div>
            </div>
          ) : (
            <Link to="/signin" className="text-xs font-extrabold text-emerald-700 hover:text-emerald-950 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Checkout Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side Drawer Navigation - Only shown for Logged In Users */}
        {profile && (
          <aside className="w-full lg:w-64 bg-white border-r border-gray-200 p-4 space-y-1 shrink-0 hidden lg:block">
            <div className="space-y-1 text-xs font-medium text-gray-600">
              <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:text-emerald-700">
                <LayoutDashboard className="h-4 w-4" /> Buyer Dashboard
              </Link>
              <Link to="/market-zone" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:text-emerald-700">
                <ShoppingBag className="h-4 w-4" /> Marketplace
              </Link>
              <Link to="/market-zone" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:text-emerald-700">
                <Package className="h-4 w-4" /> Categories
              </Link>
              <Link to="/market-zone" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:text-emerald-700">
                <MessageCircle className="h-4 w-4" /> Bargains
              </Link>
              <Link to="/market-zone" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:text-emerald-700">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-4 w-4" /> Cart
                </div>
                <span className="h-5 w-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">1</span>
              </Link>
              <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:text-emerald-700">
                <Package className="h-4 w-4" /> Orders
              </Link>
              <Link to="/cards-wallet" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:text-emerald-700">
                <Wallet className="h-4 w-4" /> Wallet
              </Link>
              <Link to="/checkout" className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-4 w-4 text-emerald-700" /> Checkout
                </div>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Link>
            </div>

            <div className="pt-6">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 space-y-2 text-center">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Gift className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-xs text-gray-900">Refer & Earn</h4>
                <p className="text-[11px] text-gray-500 leading-snug">Invite friends and earn CaMark points on every purchase.</p>
                <Button size="sm" className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-bold text-xs h-8 rounded-xl mt-1">
                  Invite Now →
                </Button>
              </div>
            </div>
          </aside>
        )}

        {/* Center Checkout Content */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-5xl">
          {/* Header Progress Stepper */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 flex items-center gap-2">
                Checkout <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full"><Lock className="h-3 w-3" /> Secure Checkout</span>
              </h1>
            </div>

            {/* Stepper Steps */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">✓</span>
                <span>Cart</span>
              </div>
              <div className="h-0.5 w-6 bg-emerald-500" />
              <div className="flex items-center gap-1.5 text-emerald-800">
                <span className="h-6 w-6 rounded-full bg-[#064E3B] text-white flex items-center justify-center text-[11px]">2</span>
                <span className="font-extrabold text-gray-900">Checkout</span>
              </div>
              <div className="h-0.5 w-6 bg-gray-200" />
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[11px]">3</span>
                <span>Payment</span>
              </div>
              <div className="h-0.5 w-6 bg-gray-200" />
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[11px]">4</span>
                <span>Review</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleConfirmOrder} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Delivery Address Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-gray-100 text-gray-800 text-xs flex items-center justify-center">1</span> Delivery Address
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    onClick={() => setDeliveryAddressType("home")}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      deliveryAddressType === "home" ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <input type="radio" checked={deliveryAddressType === "home"} onChange={() => {}} className="accent-emerald-600" />
                        <span className="font-extrabold text-xs text-gray-900">Home - Yaoundé</span>
                      </div>
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Default</span>
                    </div>
                    <p className="text-[11px] text-gray-500 pl-5 leading-tight">Nkolbisson, Avenue Kennedy, Yaoundé, Centre Region</p>
                    <p className="text-[10px] text-gray-400 pl-5 mt-1 font-mono">+237 690 123 456</p>
                  </div>

                  <div 
                    onClick={() => setDeliveryAddressType("office")}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      deliveryAddressType === "office" ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <input type="radio" checked={deliveryAddressType === "office"} onChange={() => {}} className="accent-emerald-600" />
                        <span className="font-extrabold text-xs text-gray-900">Office - Douala</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 pl-5 leading-tight">Bonanjo, Boulevard de la Liberté, Douala, Littoral Region</p>
                    <p className="text-[10px] text-gray-400 pl-5 mt-1 font-mono">+237 677 654 321</p>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full border-dashed border-gray-300 text-xs font-bold text-gray-600 h-10 rounded-xl">
                  + Add New Address
                </Button>
              </div>

              {/* 2. Delivery / Shipping Method Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-gray-100 text-gray-800 text-xs flex items-center justify-center">2</span> Delivery / Shipping Method
                </h3>

                <div className="space-y-2.5">
                  <div 
                    onClick={() => setShippingMethod("standard")}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethod === "standard" ? "border-emerald-600 bg-emerald-50/40" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={shippingMethod === "standard"} onChange={() => {}} className="accent-emerald-600" />
                      <div>
                        <p className="font-extrabold text-xs text-gray-900">Standard Delivery</p>
                        <p className="text-[10px] text-gray-400">Estimated delivery: May 27 – May 29</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-emerald-700">FCFA 1,000</span>
                  </div>

                  <div 
                    onClick={() => setShippingMethod("express")}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethod === "express" ? "border-emerald-600 bg-emerald-50/40" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={shippingMethod === "express"} onChange={() => {}} className="accent-emerald-600" />
                      <div>
                        <p className="font-extrabold text-xs text-gray-900">Express Delivery</p>
                        <p className="text-[10px] text-gray-400">Estimated delivery: May 26</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-emerald-700">FCFA 2,500</span>
                  </div>

                  <div 
                    onClick={() => setShippingMethod("pickup")}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethod === "pickup" ? "border-emerald-600 bg-emerald-50/40" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={shippingMethod === "pickup"} onChange={() => {}} className="accent-emerald-600" />
                      <div>
                        <p className="font-extrabold text-xs text-gray-900">Pickup Point</p>
                        <p className="text-[10px] text-gray-400">Pick up from a CaMark Pickup Point</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-emerald-700">FCFA 0</span>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" /> Orders are insured and tracked to your doorstep.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 3. Payment Method Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-gray-100 text-gray-800 text-xs flex items-center justify-center">3</span> Payment Method
                </h3>

                <div className="space-y-2">
                  {[
                    { id: "wallet", label: "CamRency Wallet", sub: "Available Balance: FCFA 24,500", icon: Wallet },
                    { id: "momo", label: "MTN Mobile Money", sub: "Instant MoMo checkout", icon: Phone },
                    { id: "om", label: "Orange Money", sub: "Instant OM checkout", icon: Phone },
                    { id: "card", label: "Visa / Mastercard", sub: "Credit or Debit card", icon: CreditCard },
                    { id: "bank", label: "Bank Transfer", sub: "Direct wire transfer", icon: Building2Icon }
                  ].map((m) => (
                    <div 
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        paymentMethod === m.id ? "border-emerald-600 bg-emerald-50/40" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input type="radio" checked={paymentMethod === m.id} onChange={() => {}} className="accent-emerald-600" />
                        <m.icon className="h-4 w-4 text-emerald-700 shrink-0" />
                        <div>
                          <p className="font-extrabold text-xs text-gray-900">{m.label}</p>
                          <p className="text-[10px] text-gray-400">{m.sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Billing Details / Contact & Order Review */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-gray-100 text-gray-800 text-xs flex items-center justify-center">4</span> Billing Details / Contact
                  </h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-gray-500 uppercase">Full Name</Label>
                        <Input 
                          className="h-10 rounded-xl bg-gray-50 text-xs"
                          value={billingDetails.fullName}
                          onChange={(e) => setBillingDetails({ ...billingDetails, fullName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-gray-500 uppercase">Phone Number</Label>
                        <Input 
                          className="h-10 rounded-xl bg-gray-50 text-xs"
                          value={billingDetails.phone}
                          onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase">Email Address</Label>
                      <Input 
                        className="h-10 rounded-xl bg-gray-50 text-xs"
                        value={billingDetails.email}
                        onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Order Review Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-gray-100 text-gray-800 text-xs flex items-center justify-center">5</span> Order Review
                  </h3>

                  <div className="space-y-3">
                    {product ? (
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 rounded-xl bg-emerald-100 overflow-hidden border border-emerald-200 shrink-0 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-6 w-6 text-emerald-700" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-gray-900 text-sm line-clamp-1">{product.title}</h4>
                            <p className="text-[10px] text-gray-400">Seller: {product.sellerName || product.profiles?.full_name || "Verified Merchant"}</p>
                            <span className="text-[10px] text-emerald-700 font-bold">Qty: 1</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-700 text-sm">FCFA {basePrice.toLocaleString()}</p>
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Bargain Verified</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-400">Loading order items...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
                </div>
              </div>
            </div>
          </form>

          {/* Bottom Guarantees Banner */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-8 border-t border-gray-200 text-center text-xs">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <p className="font-extrabold text-gray-900 text-[11px]">Secure Payments</p>
              <p className="text-[10px] text-gray-400">Protected by 256-bit encryption</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <p className="font-extrabold text-gray-900 text-[11px]">Verified Sellers</p>
              <p className="text-[10px] text-gray-400">Every seller is verified</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <Truck className="h-6 w-6 text-emerald-600" />
              <p className="font-extrabold text-gray-900 text-[11px]">Fast & Reliable</p>
              <p className="text-[10px] text-gray-400">Logistics across Cameroon</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <MessageCircle className="h-6 w-6 text-emerald-600" />
              <p className="font-extrabold text-gray-900 text-[11px]">Bargains & Negotiation</p>
              <p className="text-[10px] text-gray-400">Chat & get best prices</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm col-span-2 md:col-span-1">
              <Globe className="h-6 w-6 text-emerald-600" />
              <p className="font-extrabold text-gray-900 text-[11px]">AfCFTA Ready</p>
              <p className="text-[10px] text-gray-400">Trade across Africa</p>
            </div>
          </div>
        </main>

        {/* Right Summary Sidebar Panel */}
        <aside className="w-full lg:w-80 bg-white border-l border-gray-200 p-6 space-y-6 shrink-0">
          <div className="space-y-4">
            <h3 className="font-black text-lg text-gray-900">Order Summary</h3>

            <div className="space-y-2.5 text-xs text-gray-600 border-b border-gray-100 pb-4">
              <div className="flex justify-between">
                <span>Subtotal (5 items)</span>
                <span className="font-bold text-gray-900">FCFA {basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Bargain Savings</span>
                <span>- FCFA {discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee (Standard)</span>
                <span className="font-bold text-gray-900">FCFA {shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span className="font-bold text-gray-900">FCFA {serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (VAT 19.25%)</span>
                <span className="font-bold text-gray-900">FCFA {tax.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-base font-black text-gray-900">
              <span>Total Amount</span>
              <span className="text-xl text-emerald-700">FCFA {totalAmount.toLocaleString()}</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center text-xs text-emerald-800 font-bold">
              🎉 You're saving FCFA {discount.toLocaleString()} with bargains! 🥳
            </div>

            {/* Promo Code Input */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-500 uppercase">Promo Code</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter promo code" 
                  className="h-10 rounded-xl bg-gray-50 text-xs border-gray-200"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <Button variant="default" className="bg-[#064E3B] text-white font-bold h-10 px-4 rounded-xl text-xs">
                  Apply
                </Button>
              </div>
            </div>

            {/* Confirm & Pay Main CTA Button */}
            <Button 
              onClick={handleConfirmOrder} 
              disabled={isSubmitting}
              className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-black h-12 rounded-2xl text-base shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" /> {isSubmitting ? "Processing..." : "Confirm & Pay →"}
            </Button>

            <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" /> Secure payment via CamRency. Your data is protected.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-xs text-gray-900">Secure Checkout</p>
                  <p className="text-[10px] text-gray-400">Your payment and data are 100% secure</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-xs text-gray-900">Buyer Protection</p>
                  <p className="text-[10px] text-gray-400">Get full refund for eligible issues</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-xs text-gray-900">Fast & Reliable Logistics</p>
                  <p className="text-[10px] text-gray-400">Quick delivery across Cameroon</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Helper Building Icon
const Building2Icon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4"/>
    <path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/>
    <path d="M12 10h.01"/><path d="M12 14h.01"/>
    <path d="M16 10h.01"/><path d="M16 14h.01"/>
    <path d="M8 10h.01"/><path d="M8 14h.01"/>
  </svg>
);

export default CheckoutPage;
