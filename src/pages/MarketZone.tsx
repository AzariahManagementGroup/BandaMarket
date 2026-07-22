import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Store, MapPin, Package, AlertCircle, ShoppingCart, MessageCircle } from "lucide-react";
import Navbar from "@/components/camemark/Navbar";
import Footer from "@/components/camemark/Footer";
import { supabase } from "@/integrations/supabase/client";
import { getApiUrl } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const MarketZone = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const region = searchParams.get("region") || "All Regions";
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [userCurrency, setUserCurrency] = useState("XAF");

  // Approximate conversion rates from XAF
  const XAF_RATES: Record<string, number> = {
    "USD": 1 / 610,
    "EUR": 1 / 655,
    "NGN": 1.5,
    "GBP": 1 / 780,
    "XAF": 1
  };

  useEffect(() => {
    document.title = `Market Zone: ${region} — CameMark`;
    
    // Check if user is logged in
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

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
        const response = await fetch(getApiUrl("/api/products"));
        const data = await response.json();

        if (response.ok && Array.isArray(data.products) && data.products.length > 0) {
          const filtered = region === "All Regions" 
            ? data.products 
            : data.products.filter((p: any) => p.region === region);
          setProducts(filtered);
          localStorage.setItem("camemark_products", JSON.stringify(data.products));
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [region]);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [guestDetails, setGuestDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    deliveryAddress: "",
    region: region !== "All Regions" ? region : "Littoral",
    city: "Douala",
    createAccount: false
  });

  const handleOrderClick = (product: any) => {
    setSelectedProduct(product);
    const userStr = localStorage.getItem("camemark_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setGuestDetails(prev => ({
          ...prev,
          fullName: u.fullName || u.full_name || "",
          email: u.email || "",
          phone: u.phone || ""
        }));
      } catch (e) {}
    }
    setIsCheckoutOpen(true);
  };

  const handleCompleteGuestOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestDetails.fullName || !guestDetails.phone || !guestDetails.deliveryAddress) {
      toast.error("Please fill in your delivery name, phone number, and address.");
      return;
    }

    toast.success(`Order placed successfully for ${selectedProduct.title}! Merchant will contact you at ${guestDetails.phone}.`);
    setIsCheckoutOpen(false);

    if (guestDetails.createAccount) {
      setTimeout(() => {
        toast.info("Redirecting to account creation...");
        navigate(`/signup?email=${encodeURIComponent(guestDetails.email)}&name=${encodeURIComponent(guestDetails.fullName)}`);
      }, 1500);
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
              Discover authentic products, agricultural goods, and services directly from verified sellers and farmers in the {region} region of Cameroon.
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
          ) : products.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover-lift shadow-sm flex flex-col">
                  <div className="h-44 bg-muted flex items-center justify-center relative overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package className="h-10 w-10 text-muted-foreground/30" />
                    )}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Store className="h-3 w-3" /> {product.sellerName || product.profiles?.full_name || "Verified Merchant"}
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
                        onClick={() => handleAction("Bargain")}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" /> Bargain
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-full text-xs h-8 bg-primary hover:bg-primary-glow text-primary-foreground font-bold"
                        onClick={() => handleAction("Order", product)}
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
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Checkbox 
                  id="createAccount" 
                  checked={guestDetails.createAccount}
                  onCheckedChange={(checked) => setGuestDetails({ ...guestDetails, createAccount: !!checked })}
                />
                <label htmlFor="createAccount" className="text-xs font-medium text-gray-700 cursor-pointer leading-snug">
                  <span className="font-bold text-gray-900 block">Save details & create account (Optional)</span>
                  Track your order status and receive future order updates easily.
                </label>
              </div>
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
    </div>
  );
};

export default MarketZone;
