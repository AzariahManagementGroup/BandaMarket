import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { 
  ShieldCheck, Lock, CheckCircle2, MapPin, Truck, Wallet, 
  CreditCard, Phone, ArrowRight, Plus, Package, ShoppingCart, 
  Store, Gift, HelpCircle, LayoutDashboard, ShoppingBag, 
  Globe, Settings, MessageCircle, ArrowLeftRight, Bell, ChevronDown, X, Share2, Trash2
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { getApiUrl } from "@/config";
import { toast } from "sonner";
import logo from "@/assets/camemark-logo.png";
import { getCartItems, saveCartItems, CartItem } from "@/utils/cart";
import ReferralModal from "@/components/camemark/ReferralModal";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const [deliveryAddressType, setDeliveryAddressType] = useState("custom_0");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("wallet");

  const toggleItemSelection = (id: string | number) => {
    setCartItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item);
      saveCartItems(updated);
      return updated;
    });
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);
    setCartItems(prev => {
      const updated = prev.map(item => ({ ...item, selected: !allSelected }));
      saveCartItems(updated);
      return updated;
    });
  };

  const updateQuantity = (id: string | number, delta: number) => {
    setCartItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, (item.quantity || 1) + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      saveCartItems(updated);
      return updated;
    });
  };

  const removeItem = (id: string | number) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveCartItems(updated);
      toast.success("Item removed from cart");
      return updated;
    });
  };

  const emptyCart = () => {
    setCartItems([]);
    saveCartItems([]);
    toast.success("🛒 Your cart has been emptied!");
  };
  
  const [userAddresses, setUserAddresses] = useState<any[]>([
    {
      id: "custom_0",
      title: "Home Address",
      address: "Nkolbisson, Avenue Kennedy, Yaoundé",
      city: "Yaoundé",
      region: "Centre",
      country: "Malawi",
      phone: "+237 690 123 456",
      isDefault: true
    }
  ]);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    title: "",
    address: "",
    city: "Douala",
    region: "Littoral",
    country: "Malawi",
    phone: ""
  });

  const [billingDetails, setBillingDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "Nkolbisson, Avenue Kennedy, Yaoundé",
    city: "Yaoundé",
    region: "Centre",
    country: "Malawi",
    saveInfo: true
  });

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const [deliveryFees, setDeliveryFees] = useState({ standardFee: 1000, expressFee: 2500, pickupFee: 0 });

  useEffect(() => {
    document.title = "Checkout | Banda Market Secure Checkout";
    
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

    // Load saved custom user addresses from localStorage
    const savedAddressesStr = localStorage.getItem("camemark_saved_addresses");
    if (savedAddressesStr) {
      try {
        const parsed = JSON.parse(savedAddressesStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUserAddresses(parsed);
          setDeliveryAddressType(parsed[0].id);
          setBillingDetails(prev => ({
            ...prev,
            address: parsed[0].address,
            city: parsed[0].city,
            region: parsed[0].region,
            country: parsed[0].country
          }));
        }
      } catch (e) {}
    }

    // Fetch dynamic logistics delivery fees set by Admin / Logistics Officer
    fetch(getApiUrl("/api/delivery-fees"))
      .then(async res => {
        if (!res || !res.ok) return null;
        const text = await res.text();
        try { return JSON.parse(text); } catch (e) { return null; }
      })
      .then(data => {
        if (data && data.deliveryFees) {
          setDeliveryFees({
            standardFee: parseFloat(data.deliveryFees.standardFee) || 1000,
            expressFee: parseFloat(data.deliveryFees.expressFee) || 2500,
            pickupFee: parseFloat(data.deliveryFees.pickupFee) || 0
          });
        }
      })
      .catch(() => {});

    // Load cart items from localStorage or initialize with selected product
    const existingCart = getCartItems();
    if (existingCart.length > 0) {
      setCartItems(existingCart);
      setLoading(false);
    } else {
      const localProductsStr = localStorage.getItem("camemark_products");
      let availableProducts: any[] = [];
      if (localProductsStr) {
        try { availableProducts = JSON.parse(localProductsStr); } catch (e) {}
      }

      fetch(getApiUrl("/api/products"))
        .then(async res => {
          if (!res || !res.ok) return null;
          const text = await res.text();
          try { return JSON.parse(text); } catch (e) { return null; }
        })
        .then(data => {
          if (data && Array.isArray(data.products) && data.products.length > 0) {
            availableProducts = data.products;
          }
        })
        .catch(() => {})
        .finally(() => {
          const found = availableProducts.find((p: any) => p.id === Number(productId) || p.id === productId);
          const initialP = found || availableProducts[0] || {
            id: 1,
            title: "Red Palm Oil (1L)",
            price: 2100,
            imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
            sellerName: "Best Palm Cooperative",
            region: "South West"
          };
          const initialItem: CartItem = {
            id: initialP.id,
            title: initialP.title,
            price: typeof initialP.price === 'number' ? initialP.price : parseFloat(initialP.price) || 0,
            quantity: 1,
            selected: true,
            imageUrl: initialP.imageUrl || initialP.img || "",
            img: initialP.img || initialP.imageUrl || "",
            sellerName: initialP.sellerName || initialP.seller || "Verified Merchant",
            seller: initialP.seller || initialP.sellerName || "Verified Merchant",
            region: initialP.region || "Littoral"
          };
          setCartItems([initialItem]);
          saveCartItems([initialItem]);
          setLoading(false);
        });
    }
  }, [productId]);

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.address || !newAddressForm.phone) {
      toast.error("Please enter a valid address and phone number.");
      return;
    }

    const newId = "custom_" + Date.now();
    const created = {
      id: newId,
      title: newAddressForm.title || `${newAddressForm.city} Address`,
      address: newAddressForm.address,
      city: newAddressForm.city,
      region: newAddressForm.region,
      country: newAddressForm.country,
      phone: newAddressForm.phone,
      isDefault: false
    };

    setUserAddresses(prev => {
      const updated = [...prev, created];
      try {
        localStorage.setItem("camemark_saved_addresses", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setDeliveryAddressType(newId);
    setBillingDetails(prev => ({
      ...prev,
      address: newAddressForm.address,
      city: newAddressForm.city,
      region: newAddressForm.region,
      country: newAddressForm.country
    }));
    setIsAddAddressModalOpen(false);
    setNewAddressForm({ title: "", address: "", city: "Douala", region: "Littoral", country: "Malawi", phone: "" });
    toast.success("New delivery address added & saved!");
  };

  const [activeStep, setActiveStep] = useState<number>(1);

  // Real-time Stepper Progress Calculation
  const isAddressFilled = Boolean(deliveryAddressType && (billingDetails.address || userAddresses.length > 0));
  const isShippingSelected = Boolean(shippingMethod);
  const isPaymentSelected = Boolean(paymentMethod);
  const isContactFilled = Boolean(billingDetails.fullName && billingDetails.phone);

  const selectedItems = cartItems.filter(item => item.selected);
  const basePrice = selectedItems.reduce((acc, item) => acc + ((typeof item.price === 'number' ? item.price : parseFloat(item.price as any) || 0) * (item.quantity || 1)), 0);
  const totalSelectedCount = selectedItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const shippingFee = selectedItems.length === 0 ? 0 : (shippingMethod === "express" 
    ? deliveryFees.expressFee 
    : shippingMethod === "pickup" 
    ? deliveryFees.pickupFee 
    : deliveryFees.standardFee);
  const serviceFee = selectedItems.length === 0 ? 0 : 300;
  const tax = Math.round(basePrice * 0.1925);
  const totalAmount = Math.max(0, basePrice - discount + shippingFee + serviceFee + tax);

  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingDetails.fullName || !billingDetails.phone || !billingDetails.address) {
      toast.error("Please fill in your full name, phone number, and delivery address.");
      return;
    }

    // Launch Platform Interactive Payment Gateway Modal
    setIsPaymentGatewayOpen(true);
  };

  const handleExecutePaymentGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const firstSelected = selectedItems[0] || cartItems[0];
    const itemsSummary = selectedItems.map(i => `${i.title} (x${i.quantity || 1})`).join(", ") || "Marketplace Products";

    const orderPayload = {
      productId: firstSelected?.id || "lst-default",
      productTitle: itemsSummary,
      amount: totalAmount,
      currency: "XAF",
      sellerId: firstSelected?.sellerId || "",
      sellerName: firstSelected?.sellerName || firstSelected?.seller || "Green Harvest Farms",
      sellerEmail: firstSelected?.sellerEmail || "",
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

      const newOrder = {
        id: (data && data.order && data.order.id) || ("ORD-" + Math.floor(Math.random() * 899999 + 100000)),
        ...orderPayload,
        status: "Pending Dispatch",
        createdAt: new Date().toISOString()
      };

      // Always persist order into localStorage so SellerDashboard reads it instantly
      try {
        const existingStr = localStorage.getItem("camemark_sales_orders");
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const updated = [newOrder, ...existing];
        localStorage.setItem("camemark_sales_orders", JSON.stringify(updated));
      } catch (e) {}

      // Clear purchased selected items from cart
      const remainingCart = cartItems.filter(item => !item.selected);
      saveCartItems(remainingCart);
      setCartItems(remainingCart);

      if (res.ok && data && data.success) {
        toast.success("🎉 Payment Successful! Order placed & seller notified.");
      } else {
        toast.success("🎉 Payment Successful! Order placed.");
      }
      setIsPaymentGatewayOpen(false);
      setTimeout(() => {
        navigate("/seller-dashboard/orders");
      }, 1200);
    } catch (err) {
      toast.success("🎉 Payment Successful! Order placed.");
      setIsPaymentGatewayOpen(false);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans text-gray-800">
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Banda Market Logo" className="h-7 sm:h-9 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-full max-w-md">
            <Input 
              placeholder="Search products, farmers, stores, regions..." 
              className="bg-transparent border-0 focus-visible:ring-0 text-xs h-7 p-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 font-bold bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
            <Globe className="h-3.5 w-3.5" /> EN
          </div>
          
          {profile ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-900">{profile?.fullName || profile?.full_name || "Verified Buyer"}</p>
                <p className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                  <CheckCircle2 className="h-3 w-3" /> Verified Buyer
                </p>
              </div>
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-emerald-100 overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0">
                <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.fullName || "Buyer"}`} alt="User Avatar" />
              </div>
            </div>
          ) : (
            <Link to="/signin" className="text-xs font-extrabold text-emerald-700 hover:text-emerald-950 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Checkout Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row min-h-0">
        {/* Left Side Drawer Navigation - Only shown for Logged In Users */}
        {profile && (
          <aside className="w-full lg:w-60 xl:w-64 bg-white border-r border-gray-200 p-4 space-y-1 shrink-0 hidden lg:block">
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
              <Link to="/checkout" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:text-emerald-700">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-4 w-4" /> Cart
                </div>
                <span className={`h-5 w-5 rounded-full font-bold text-[10px] flex items-center justify-center ${cartItems.length > 0 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {totalSelectedCount}
                </span>
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
                <Button 
                  size="sm" 
                  onClick={() => setIsReferralModalOpen(true)}
                  className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-bold text-xs h-8 rounded-xl mt-1 cursor-pointer"
                >
                  Invite Now →
                </Button>
              </div>
            </div>
          </aside>
        )}

        {/* Center Checkout Content */}
        <main className="flex-1 p-3 sm:p-6 xl:p-8 space-y-6 min-w-0">
          {/* Header Progress Stepper */}
          <div className="flex flex-col gap-3 sm:gap-4 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 flex items-center gap-2">
                Checkout <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full"><Lock className="h-3 w-3" /> Secure</span>
              </h1>
              {cartItems.length > 0 && (
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={emptyCart}
                  className="h-8 px-3 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Empty Cart
                </Button>
              )}
            </div>

            {/* Stepper Steps (1 to 5 Multi-Step Wizard) */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold overflow-x-auto pb-1 custom-scrollbar">
              {[
                { step: 1, title: "Delivery Address" },
                { step: 2, title: "Shipping Method" },
                { step: 3, title: "Payment Method" },
                { step: 4, title: "Contact Details" },
                { step: 5, title: "Order Review" }
              ].map((item, idx, arr) => (
                <div key={item.step} className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveStep(item.step)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      activeStep === item.step
                        ? "text-emerald-950 font-black"
                        : activeStep > item.step
                        ? "text-emerald-700 font-bold"
                        : "text-gray-400 font-medium"
                    }`}
                  >
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      activeStep === item.step
                        ? "bg-[#064E3B] text-white ring-2 ring-emerald-600/30"
                        : activeStep > item.step
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {activeStep > item.step ? "✓" : item.step}
                    </span>
                    <span>{item.title}</span>
                  </button>
                  {idx < arr.length - 1 && (
                    <div className={`h-0.5 w-3 sm:w-6 shrink-0 ${activeStep > item.step ? "bg-emerald-500" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleConfirmOrder} className="space-y-6">
            {/* Step 1: Delivery Address */}
            {activeStep === 1 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-[#064E3B] text-white text-xs flex items-center justify-center">1</span> Delivery Address
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userAddresses.map((addr) => (
                    <div 
                      key={addr.id}
                      onClick={() => {
                        setDeliveryAddressType(addr.id);
                        setBillingDetails(prev => ({
                          ...prev,
                          address: addr.address,
                          city: addr.city,
                          region: addr.region,
                          country: addr.country
                        }));
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        deliveryAddressType === addr.id ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <input type="radio" checked={deliveryAddressType === addr.id} onChange={() => {}} className="accent-emerald-600" />
                          <span className="font-extrabold text-xs text-gray-900">{addr.title}</span>
                        </div>
                        {addr.isDefault && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Default</span>}
                      </div>
                      <p className="text-[11px] text-gray-500 pl-5 leading-tight">{addr.address}, {addr.city}, {addr.region}</p>
                      <p className="text-[10px] text-gray-400 pl-5 mt-1 font-mono">{addr.phone}</p>
                    </div>
                  ))}
                </div>

                <Button 
                  type="button" 
                  onClick={() => setIsAddAddressModalOpen(true)} 
                  variant="outline" 
                  className="w-full border-dashed border-gray-300 text-xs font-bold text-emerald-800 hover:bg-emerald-50 h-10 rounded-xl"
                >
                  + Add New Address
                </Button>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setActiveStep(2)}
                    className="bg-[#064E3B] hover:bg-emerald-950 text-white font-extrabold text-xs h-11 px-8 rounded-xl"
                  >
                    Next: Shipping Method →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Method */}
            {activeStep === 2 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 animate-fade-in">
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-[#064E3B] text-white text-xs flex items-center justify-center">2</span> Delivery / Shipping Method
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

                <div className="pt-4 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveStep(1)}
                    className="font-bold text-xs h-11 px-6 rounded-xl"
                  >
                    ← Back: Address
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveStep(3)}
                    className="bg-[#064E3B] hover:bg-emerald-950 text-white font-extrabold text-xs h-11 px-8 rounded-xl"
                  >
                    Next: Payment Method →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {activeStep === 3 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 animate-fade-in">
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-[#064E3B] text-white text-xs flex items-center justify-center">3</span> Payment Method
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

                <div className="pt-4 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveStep(2)}
                    className="font-bold text-xs h-11 px-6 rounded-xl"
                  >
                    ← Back: Shipping
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveStep(4)}
                    className="bg-[#064E3B] hover:bg-emerald-950 text-white font-extrabold text-xs h-11 px-8 rounded-xl"
                  >
                    Next: Contact Details →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Contact Details */}
            {activeStep === 4 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 animate-fade-in">
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-[#064E3B] text-white text-xs flex items-center justify-center">4</span> Billing Details / Contact
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase">Full Name *</Label>
                      <Input 
                        className="h-10 rounded-xl bg-gray-50 text-xs"
                        value={billingDetails.fullName}
                        onChange={(e) => setBillingDetails({ ...billingDetails, fullName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase">Phone Number *</Label>
                      <Input 
                        className="h-10 rounded-xl bg-gray-50 text-xs"
                        value={billingDetails.phone}
                        onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-gray-500 uppercase">Email Address (Optional)</Label>
                    <Input 
                      className="h-10 rounded-xl bg-gray-50 text-xs"
                      value={billingDetails.email}
                      onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveStep(3)}
                    className="font-bold text-xs h-11 px-6 rounded-xl"
                  >
                    ← Back: Payment
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveStep(5)}
                    className="bg-[#064E3B] hover:bg-emerald-950 text-white font-extrabold text-xs h-11 px-8 rounded-xl"
                  >
                    Next: Order Review →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Order Review & Item Selection */}
            {activeStep === 5 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-[#064E3B] text-white text-xs flex items-center justify-center">5</span> Order Review & Item Selection
                  </h3>
                  {cartItems.length > 0 && (
                    <div className="flex items-center gap-3 text-xs">
                      <button 
                        type="button" 
                        onClick={toggleSelectAll} 
                        className="flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200"
                      >
                        <Checkbox checked={cartItems.length > 0 && cartItems.every(i => i.selected)} />
                        <span>Select All ({selectedItems.length}/{cartItems.length})</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={emptyCart} 
                        className="flex items-center gap-1 font-bold text-red-600 hover:text-red-700 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Clear Cart
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {cartItems.length > 0 ? (
                    cartItems.map((item, idx) => (
                      <div 
                        key={item.id || idx} 
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all gap-3 ${
                          item.selected ? "bg-emerald-50/50 border-emerald-300 shadow-sm" : "bg-gray-50 border-gray-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Checkbox to Select / Deselect individual item */}
                          <Checkbox 
                            checked={!!item.selected} 
                            onCheckedChange={() => toggleItemSelection(item.id)}
                            aria-label={`Select ${item.title}`}
                          />
                          <div className="h-14 w-14 rounded-xl bg-emerald-100 overflow-hidden border border-emerald-200 shrink-0 flex items-center justify-center">
                            {item.imageUrl || item.img ? (
                              <img src={item.imageUrl || item.img} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-6 w-6 text-emerald-700" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-gray-900 text-sm line-clamp-1">{item.title}</h4>
                            <p className="text-[10px] text-gray-500">Seller: {item.sellerName || item.seller || "Verified Merchant"}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[11px] font-bold text-gray-500">Qty:</span>
                              <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                                <button type="button" onClick={() => updateQuantity(item.id, -1)} className="h-6 w-6 font-extrabold text-gray-600 hover:bg-gray-100">-</button>
                                <span className="px-2 text-xs font-black text-gray-900">{item.quantity || 1}</span>
                                <button type="button" onClick={() => updateQuantity(item.id, 1)} className="h-6 w-6 font-extrabold text-gray-600 hover:bg-gray-100">+</button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200/60 shrink-0">
                          <p className="font-black text-emerald-800 text-sm">FCFA {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-700 hover:underline mt-1"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                        <ShoppingCart className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-sm">Your Cart is Empty</h4>
                        <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">You currently have no products in your cart.</p>
                      </div>
                      <Button 
                        type="button"
                        onClick={() => navigate("/market-zone")}
                        className="bg-[#064E3B] hover:bg-emerald-950 text-white font-bold rounded-xl text-xs h-9 px-4"
                      >
                        Browse MarketZone Products
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveStep(4)}
                    className="font-bold text-xs h-11 px-6 rounded-xl"
                  >
                    ← Back: Contact
                  </Button>
                  <Button 
                    type="submit"
                    disabled={selectedItems.length === 0}
                    className="bg-[#064E3B] hover:bg-emerald-950 disabled:bg-gray-300 text-white font-extrabold text-xs h-11 px-8 rounded-xl shadow-lg"
                  >
                    {selectedItems.length === 0 ? "Select Items to Pay" : `🔒 Confirm & Pay (${totalSelectedCount} items) →`}
                  </Button>
                </div>
              </div>
            )}
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
              <p className="text-[10px] text-gray-400">Logistics across Malawi</p>
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
        <aside className="w-full lg:w-72 xl:w-80 bg-white border-l border-gray-200 p-6 space-y-6 shrink-0">
          <div className="space-y-4">
            <h3 className="font-black text-lg text-gray-900">Order Summary</h3>

            <div className="space-y-2.5 text-xs text-gray-600 border-b border-gray-100 pb-4">
              <div className="flex justify-between">
                <span>Subtotal ({totalSelectedCount} {totalSelectedCount === 1 ? 'item' : 'items'})</span>
                <span className="font-bold text-gray-900">FCFA {basePrice.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Bargain Savings</span>
                  <span>- FCFA {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee ({shippingMethod === 'express' ? 'Express' : shippingMethod === 'pickup' ? 'Pickup' : 'Standard'})</span>
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

            {discount > 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center text-xs text-emerald-800 font-bold flex items-center justify-between">
                <span>🎉 Coupon Applied! Saved FCFA {discount.toLocaleString()}</span>
                <button type="button" onClick={() => { setDiscount(0); setPromoCode(""); }} className="text-red-600 underline text-[10px]">Remove</button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-gray-500 uppercase">Promo / Bargain Code</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. BANDA MARKET10 or BARGAIN" 
                    className="h-10 rounded-xl bg-gray-50 text-xs border-gray-200"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button 
                    type="button"
                    onClick={() => {
                      if (!promoCode) {
                        toast.error("Please enter a promo code.");
                        return;
                      }
                      if (promoCode.toUpperCase() === "BANDA MARKET10" || promoCode.toUpperCase() === "BARGAIN") {
                        const calculatedDiscount = Math.round(basePrice * 0.1);
                        setDiscount(calculatedDiscount);
                        toast.success(`🎉 Promo code applied! You saved FCFA ${calculatedDiscount.toLocaleString()} (10% OFF)!`);
                      } else {
                        toast.error("Invalid promo code. Try 'BANDA MARKET10' or 'BARGAIN'.");
                      }
                    }} 
                    className="bg-[#064E3B] hover:bg-emerald-950 text-white font-bold h-10 px-4 rounded-xl text-xs"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}

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
                  <p className="text-[10px] text-gray-400">Quick delivery across Malawi</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Add New Custom Address Modal */}
      <Dialog open={isAddAddressModalOpen} onOpenChange={setIsAddAddressModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" /> Add Custom Delivery Address
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Enter your exact home, office, or local address in Malawi for shipping.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddNewAddress} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Address Label / Title</Label>
              <Input 
                placeholder="e.g. Home - Yaoundé, Shop - Douala"
                required
                className="h-10 rounded-xl bg-gray-50 text-xs"
                value={newAddressForm.title}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">City / Town</Label>
                <Input 
                  placeholder="e.g. Yaoundé, Douala, Bamenda"
                  required
                  className="h-10 rounded-xl bg-gray-50 text-xs"
                  value={newAddressForm.city}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">Region / State</Label>
                <Input 
                  placeholder="e.g. Centre, Littoral, West"
                  required
                  className="h-10 rounded-xl bg-gray-50 text-xs"
                  value={newAddressForm.region}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, region: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Street Address / Landmark</Label>
              <Textarea 
                placeholder="e.g. Nkolbisson, Avenue Kennedy, opposite First Trust Bank"
                required
                className="rounded-xl bg-gray-50 text-xs min-h-[70px]"
                value={newAddressForm.address}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, address: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Contact Phone / WhatsApp</Label>
              <Input 
                placeholder="+237 6xx xxx xxx"
                required
                className="h-10 rounded-xl bg-gray-50 text-xs font-mono"
                value={newAddressForm.phone}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-bold h-11 rounded-xl text-xs mt-2">
              Save & Use Address
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Interactive Platform Payment Gateway Modal */}
      <Dialog open={isPaymentGatewayOpen} onOpenChange={setIsPaymentGatewayOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Banda Market Payment Gateway
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-200">
                256-bit Encrypted
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Complete your order payment of <strong className="text-emerald-700 font-extrabold text-sm">FCFA {totalAmount.toLocaleString()}</strong> using your selected channel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExecutePaymentGateway} className="space-y-4 mt-2">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Selected Gateway Channel:</span>
                <span className="font-extrabold text-gray-900 uppercase">{paymentMethod || 'MTN Mobile Money'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Product(s):</span>
                <span className="font-bold text-gray-800 line-clamp-1 max-w-[200px]">
                  {selectedItems.length > 0 ? selectedItems.map(i => i.title).join(", ") : 'Marketplace Item'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                <span className="font-extrabold text-gray-700">Total Payable:</span>
                <span className="font-black text-emerald-700 text-sm">FCFA {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Channel Inputs */}
            {(paymentMethod === 'momo' || paymentMethod === 'om' || !paymentMethod) && (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-500 uppercase">
                  {paymentMethod === 'om' ? 'Orange Money Number' : 'MTN Mobile Money Number'}
                </Label>
                <Input 
                  type="text"
                  required
                  placeholder="+237 6xx xxx xxx"
                  defaultValue={billingDetails.phone || "+237 690 123 456"}
                  className="h-11 rounded-xl bg-gray-50 px-3 text-xs font-mono font-bold border border-gray-200"
                />
                <p className="text-[10px] text-gray-400 mt-1">A payment prompt USSD push will be sent to your mobile phone.</p>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <p className="font-extrabold">CamRency Wallet Express</p>
                <p className="text-[11px] text-emerald-700">Current Balance: FCFA 24,500. FCFA {totalAmount.toLocaleString()} will be deducted instantly.</p>
              </div>
            )}

            {(paymentMethod === 'card' || paymentMethod === 'bank') && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Card / Account Number</Label>
                  <Input 
                    type="text"
                    required
                    placeholder="4532 •••• •••• 8912"
                    defaultValue="4532 8901 2345 8912"
                    className="h-11 rounded-xl bg-gray-50 px-3 text-xs font-mono border border-gray-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</Label>
                    <Input placeholder="MM/YY" defaultValue="12/28" className="h-10 rounded-xl bg-gray-50 text-xs font-mono" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">CVV Security Code</Label>
                    <Input placeholder="3-digits" defaultValue="321" className="h-10 rounded-xl bg-gray-50 text-xs font-mono" />
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-[#064E3B] hover:bg-emerald-950 text-white font-black h-12 rounded-2xl text-xs sm:text-sm mt-2 shadow-lg shadow-emerald-950/20"
            >
              {isSubmitting ? "Authorizing Payment..." : `Pay FCFA ${totalAmount.toLocaleString()} Now →`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Interactive Refer & Earn Program Modal */}
      <ReferralModal 
        isOpen={isReferralModalOpen} 
        onClose={() => setIsReferralModalOpen(false)} 
        user={profile} 
      />
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
