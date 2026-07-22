import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Store, MapPin, Package, AlertCircle, ShoppingCart, MessageCircle } from "lucide-react";
import Navbar from "@/components/camemark/Navbar";
import Footer from "@/components/camemark/Footer";
import { supabase } from "@/integrations/supabase/client";
import { getApiUrl } from "@/config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
      try {
        const response = await fetch(getApiUrl("/api/products"));
        const data = await response.json();

        if (response.ok && Array.isArray(data.products)) {
          const filtered = region === "All Regions" 
            ? data.products 
            : data.products.filter((p: any) => p.region === region);
          setProducts(filtered);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [region]);

  const handleAction = (actionName: string) => {
    if (!session) {
      toast.error(`Please sign in to ${actionName.toLowerCase()}`);
      navigate("/signup");
    } else {
      toast.success(`${actionName} feature coming soon!`);
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
                        className="w-full text-xs h-8 bg-primary hover:bg-primary-glow text-primary-foreground"
                        onClick={() => handleAction("Order")}
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
    </div>
  );
};

export default MarketZone;
