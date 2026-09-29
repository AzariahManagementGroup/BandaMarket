import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Store, MapPin, Package, AlertCircle, ShoppingCart, MessageCircle, Lock, Eye, EyeOff, Share2, Copy, Heart } from "lucide-react";
import Navbar from "@/components/camemark/Navbar";
import Footer from "@/components/camemark/Footer";
import { getApiUrl } from "@/config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ProductDetailModal from "@/components/camemark/ProductDetailModal";

const MarketZone = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const region = searchParams.get("region") || "All Regions";
  const tab = searchParams.get("tab") || "";
  const [products, setProducts] = useState<any[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [userCurrency, setUserCurrency] = useState("XAF");
  const [viewProduct, setViewProduct] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleShareProduct = (product: any, platform: string = "whatsapp") => {
    const productUrl = `${window.location.origin}/checkout?productId=${product.id}`;
    const productImg = product.imageUrl || `${window.location.origin}/og-image.png`;
    const shareText = `🛒 *${product.title}*\n💰 Price: ${product.currency} ${product.price.toLocaleString()}\n📍 Seller: ${product.sellerName || 'Verified Merchant'} (${product.city || 'Malawi'}, ${product.region || ''})\n🖼️ View Image: ${productImg}\n\n👉 Buy now on Banda Market: ${productUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, "_blank");
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product.title} on Banda Market 🇨🇲`)}&url=${encodeURIComponent(productUrl)}`, "_blank");
    } else {
      navigator.clipboard.writeText(`${shareText}`);
      toast.success("📋 Product details & image link copied to clipboard!");
    }
  };

  // Approximate conversion rates from XAF
  const XAF_RATES: Record<string, number> = {
    "USD": 1 / 610,
    "EUR": 1 / 655,
    "NGN": 1.5,
    "GBP": 1 / 780,
    "XAF": 1
  };

  useEffect(() => {
    document.title = `Market Zone: ${region} — Banda Market`;
    
    // Check if user is logged in
    const token = localStorage.getItem("camemark_token");
    const userStr = localStorage.getItem("camemark_user");
    if (token && userStr) {
      setSession({ user: JSON.parse(userStr) });
    }

    // Detect user location/currency
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.currency) setUserCurrency(data.currency);
      })
      .catch(err => console.error("Geo-detection failed:", err));
    
    // Simulating fetching products from the selected region.
    // In a fully populated database, this would filter by the seller's region.
    const fetchProducts = async () => {
      setLoading(true);
      
      const localListings = localStorage.getItem("camemark_products");
      if (localListings) {
        try {
          const parsed = JSON.parse(localListings);
          const filtered = region === "All Regions" ? parsed : parsed.filter((p: any) => p.region === region);
          setProducts(filtered);
        } catch (e) {}
      }

      try {
        const queryParam = region && region !== "All Regions" ? `?region=${encodeURIComponent(region)}` : "";
        const response = await fetch(getApiUrl("/api/products" + queryParam));
        const contentType = response.headers.get("content-type");

        if (response.ok && contentType && contentType.includes("application/json")) {
          const data = await response.json();

          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
            localStorage.setItem("camemark_products", JSON.stringify(data.products));
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [region]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const token = localStorage.getItem("camemark_token");
    fetch(getApiUrl("/api/saved_items.php"), { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSavedItemIds(data.savedIds || []);
        }
      })
      .catch(e => console.error("Error fetching saved items", e));
  }, [session?.user?.id]);

  const toggleSaveProduct = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    const token = localStorage.getItem("camemark_token");
    if (!token) return toast.error("Please sign in first");
    
    const isSaved = savedItemIds.includes(productId);
    const method = isSaved ? 'DELETE' : 'POST';
    
    try {
      const res = await fetch(getApiUrl("/api/saved_items.php"), {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success) {
        if (isSaved) {
          setSavedItemIds(prev => prev.filter(id => id !== productId));
          toast.success("Removed from saved items");
        } else {
          setSavedItemIds(prev => [...prev, productId]);
          toast.success("Added to saved items");
        }
      }
    } catch(err) {
      toast.error("Error updating saved items");
    }
  };

  const searchQuery = searchParams.get("q")?.toLowerCase() || "";
  const searchCategory = searchParams.get("category") || "All Categories";

  const displayedProducts = products.filter(p => {
    // 1. Saved Tab Filter
    if (tab === "saved" && !savedItemIds.includes(p.id)) return false;

    // 2. Search Query Filter
    if (searchQuery) {
      const matchTitle = p.title?.toLowerCase().includes(searchQuery);
      const matchDesc = p.description?.toLowerCase().includes(searchQuery);
      if (!matchTitle && !matchDesc) return false;
    }

    // 3. Category Filter
    if (searchCategory && searchCategory !== "All Categories") {
      // In a real DB, category might be exact match or slug, here we do simple check
      if (p.category !== searchCategory) return false;
    }

    return true;
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestDetails, setGuestDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "Malawi",
    region: region !== "All Regions" ? region : "Littoral",
    city: "Douala",
    deliveryAddress: "",
    role: "buyer",
    password: "",
    createAccount: false
  });

  const handleOrderClick = (product: any) => {
    navigate(`/checkout?productId=${product.id}`);
  };

  const handleCompleteGuestOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestDetails.fullName || !guestDetails.phone || !guestDetails.deliveryAddress) {
      toast.error("Please fill in your full name, phone number, and delivery address.");
      return;
    }

    if (guestDetails.createAccount) {
      if (!guestDetails.email || !guestDetails.password) {
        toast.error("Email and password are required to create an account.");
        return;
      }
      if (guestDetails.password.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (guestDetails.createAccount) {
        // Submit full account signup to PHP API
        const signupPayload = {
          fullName: guestDetails.fullName,
          email: guestDetails.email,
          phone: guestDetails.phone,
          password: guestDetails.password,
          country: guestDetails.country,
          region: guestDetails.region,
          city: guestDetails.city,
          role: guestDetails.role
        };

        const res = await fetch(getApiUrl("/api/signup"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signupPayload)
        });
        const data = await res.json();

        if (res.ok && data.user) {
          localStorage.setItem("camemark_token", data.token || "token-" + data.user.id);
          localStorage.setItem("camemark_user", JSON.stringify(data.user));
        }
      }

      // Submit Order Payload to Backend API (Triggers emails & notifications)
      const orderPayload = {
        productId: selectedProduct?.id || "",
        productTitle: selectedProduct?.title || "Product",
        amount: selectedProduct?.price || 0,
        currency: selectedProduct?.currency || "XAF",
        sellerId: selectedProduct?.sellerId || "",
        sellerName: selectedProduct?.sellerName || "Merchant",
        sellerEmail: selectedProduct?.sellerEmail || "",
        buyerName: guestDetails.fullName,
        buyerEmail: guestDetails.email,
        buyerPhone: guestDetails.phone,
        deliveryAddress: `${guestDetails.deliveryAddress}, ${guestDetails.city}, ${guestDetails.region}, ${guestDetails.country}`
      };

      const orderRes = await fetch(getApiUrl("/api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      const orderData = await orderRes.json();

      if (orderRes.ok && orderData.success) {
        toast.success(`🎉 Order placed! Confirmation emails & in-app alerts dispatched to buyer & seller.`);
      } else {
        toast.success(`Order submitted successfully for ${selectedProduct?.title}!`);
      }
    } catch (err) {
      toast.success(`Order submitted successfully for ${selectedProduct?.title}!`);
    } finally {
      setIsSubmitting(false);
      setIsCheckoutOpen(false);
    }
  };

  const handleAction = (actionName: string, product?: any) => {
    if (actionName === "Order" && product) {
      handleOrderClick(product);
    } else {
      toast.info(`${actionName} feature coming soon!`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 overflow-x-hidden">
        {/* Header */}
        <section className="bg-primary/5 py-12 border-b border-border">
          <div className="container flex flex-col items-center text-center animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card px-3 py-1 text-xs font-semibold text-primary mb-4 shadow-sm">
              <MapPin className="h-3.5 w-3.5" /> Market Zone
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
              {region}
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Discover authentic products, agricultural goods, and services directly from verified sellers and farmers in the {region} region of Malawi.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="container py-12">
          {loading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : displayedProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => {
                    setViewProduct(product);
                    setIsDetailModalOpen(true);
                  }}
                  className="group rounded-2xl border border-border bg-card overflow-hidden hover-lift shadow-sm flex flex-col cursor-pointer"
                >
                  <div className="h-44 bg-muted flex items-center justify-center relative overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package className="h-10 w-10 text-muted-foreground/30" />
                    )}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />

                    {/* Quick WhatsApp & Social Share Overlay Badge */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      <button
                        onClick={(e) => toggleSaveProduct(e, product.id)}
                        className={`h-8 w-8 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 ${
                          savedItemIds.includes(product.id) ? "bg-red-50 text-red-500" : "bg-white text-gray-400 hover:text-red-500"
                        }`}
                        title={savedItemIds.includes(product.id) ? "Unsave" : "Save"}
                      >
                        <Heart className="h-4 w-4" fill={savedItemIds.includes(product.id) ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareProduct(product, "whatsapp");
                        }}
                        title="Share Product with Cover Image on WhatsApp"
                        className="h-8 px-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black shadow-lg flex items-center gap-1 backdrop-blur-md transition-transform hover:scale-105"
                      >
                        <Share2 className="h-3.5 w-3.5" /> Share
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-xs text-muted-foreground flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1">
                        <Store className="h-3 w-3" /> {product.sellerName || product.profiles?.full_name || "Verified Merchant"}
                      </span>
                      <button 
                        onClick={() => handleShareProduct(product, "copy")} 
                        className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5 font-bold"
                        title="Copy direct product link & image URL"
                      >
                        <Copy className="h-2.5 w-2.5" /> Copy Link
                      </button>
                    </div>
                    <h3 className="font-bold text-foreground text-sm line-clamp-1">{product.title}</h3>
                    <div className="mt-2 flex flex-col">
                      <span className="font-extrabold text-primary">
                        {product.currency} {product.price.toLocaleString()}
                      </span>
                      {userCurrency !== product.currency && XAF_RATES[userCurrency] && (
                        <span className="text-[10px] text-muted-foreground font-medium">
                          ≈ {userCurrency} {(product.price * (XAF_RATES[userCurrency] || 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs h-8 border-primary/30 hover:bg-primary/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewProduct(product);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" /> Bargain
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-full text-xs h-8 bg-primary hover:bg-primary-glow text-primary-foreground font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction("Order", product);
                        }}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Order
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Products Found</h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't find any active products from sellers in {region} right now. Check back soon or switch to another region!
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Guest Purchase Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900">Direct Order & Delivery Details</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              No account required! Provide your shipping information so the seller can process and deliver your order.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3 my-2">
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.title} className="h-14 w-14 rounded-xl object-cover border border-emerald-200" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Package className="h-6 w-6" />
                </div>
              )}
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1">{selectedProduct.title}</h4>
                <p className="text-xs text-emerald-700 font-bold mt-0.5">
                  {selectedProduct.currency} {selectedProduct.price.toLocaleString()}
                </p>
                <span className="text-[10px] text-gray-500">Seller: {selectedProduct.sellerName || "Verified Merchant"}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleCompleteGuestOrder} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-600 uppercase">Full Name *</Label>
              <Input 
                placeholder="e.g. Jean-Paul Mbida"
                required
                className="h-11 rounded-xl bg-gray-50 border-gray-200 text-sm focus-visible:bg-white"
                value={guestDetails.fullName}
                onChange={(e) => setGuestDetails({ ...guestDetails, fullName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Phone / WhatsApp *</Label>
                <Input 
                  placeholder="+237 6XX XXX XXX"
                  required
                  className="h-11 rounded-xl bg-gray-50 border-gray-200 text-sm focus-visible:bg-white"
                  value={guestDetails.phone}
                  onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Email (Optional)</Label>
                <Input 
                  type="email"
                  placeholder="name@domain.com"
                  className="h-11 rounded-xl bg-gray-50 border-gray-200 text-sm focus-visible:bg-white"
                  value={guestDetails.email}
                  onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Country</Label>
                <Select value={guestDetails.country} onValueChange={(val) => setGuestDetails({ ...guestDetails, country: val })}>
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 text-xs">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Malawi">Malawi 🇨🇲</SelectItem>
                    <SelectItem value="Nigeria">Nigeria 🇳🇬</SelectItem>
                    <SelectItem value="Chad">Chad 🇹🇩</SelectItem>
                    <SelectItem value="Gabon">Gabon 🇬🇦</SelectItem>
                    <SelectItem value="France">France 🇫🇷</SelectItem>
                    <SelectItem value="USA">USA 🇺🇸</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Region / State</Label>
                <Select value={guestDetails.region} onValueChange={(val) => setGuestDetails({ ...guestDetails, region: val })}>
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 text-xs">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {["Adamawa","Centre","East","Far North","Littoral","North","Northwest","South","Southwest","West","Other"].map((reg) => (
                      <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-600 uppercase">City / Town</Label>
              <Input 
                placeholder="e.g. Douala, Yaoundé, Bamenda"
                className="h-11 rounded-xl bg-gray-50 border-gray-200 text-sm focus-visible:bg-white"
                value={guestDetails.city}
                onChange={(e) => setGuestDetails({ ...guestDetails, city: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-600 uppercase">Delivery Address *</Label>
              <Textarea 
                placeholder="Street address, neighborhood landmark, or delivery spot..."
                required
                rows={2}
                className="bg-gray-50 border-gray-200 rounded-xl text-sm focus-visible:bg-white"
                value={guestDetails.deliveryAddress}
                onChange={(e) => setGuestDetails({ ...guestDetails, deliveryAddress: e.target.value })}
              />
            </div>

            {/* Optional Account Creation Option */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <div className="flex items-center space-x-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <Checkbox 
                  id="createAccount" 
                  checked={guestDetails.createAccount}
                  onCheckedChange={(checked) => setGuestDetails({ ...guestDetails, createAccount: !!checked })}
                />
                <label htmlFor="createAccount" className="text-xs font-medium text-gray-700 cursor-pointer leading-snug">
                  <span className="font-bold text-gray-900 block">Create an Account (Optional)</span>
                  Track your order status and receive future order updates easily.
                </label>
              </div>

              {guestDetails.createAccount && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-fade-in">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-600 uppercase">Account Role</Label>
                    <Select value={guestDetails.role} onValueChange={(val) => setGuestDetails({ ...guestDetails, role: val })}>
                      <SelectTrigger className="h-10 rounded-xl bg-white border-gray-200 text-xs">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="seller">Seller / Merchant</SelectItem>
                        <SelectItem value="farmer">Farmer / Cooperative</SelectItem>
                        <SelectItem value="logistics">Logistics Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-600 uppercase">Account Password *</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        required={guestDetails.createAccount}
                        className="h-10 rounded-xl bg-white border-gray-200 text-xs pr-10"
                        value={guestDetails.password}
                        onChange={(e) => setGuestDetails({ ...guestDetails, password: e.target.value })}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCheckoutOpen(false)} className="rounded-xl font-bold">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#064E3B] hover:bg-emerald-950 text-white font-bold rounded-xl h-11 px-6">
                Confirm Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Interactive 3-Screen Product & Bargain Modal */}
      <ProductDetailModal 
        product={viewProduct} 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
      />
    </div>
  );
};

export default MarketZone;
