import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, Trash2, ChevronLeft, Plus, Minus
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getCartItems, saveCartItems, CartItem } from "@/utils/cart";
import { toast } from "sonner";

interface CartBasketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartBasketDrawer = ({ isOpen, onClose }: CartBasketDrawerProps) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const refreshCart = () => {
    setCartItems(getCartItems());
  };

  useEffect(() => {
    refreshCart();
    window.addEventListener("cart_updated", refreshCart);
    return () => window.removeEventListener("cart_updated", refreshCart);
  }, []);

  const updateQuantity = (id: string | number, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updated);
    saveCartItems(updated);
  };

  const removeItem = (id: string | number) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    saveCartItems(updated);
    toast.success("Item removed from cart");
  };

  const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const subtotal = cartItems.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-gray-50 p-0 flex flex-col h-full font-sans border-l border-gray-200">
        
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0">
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-lg text-gray-900">Banda Market</span>
          </div>
        </div>

        <div className="p-4 bg-white shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Cart <span className="text-lg font-medium text-gray-500">({totalQuantity} items)</span>
          </h2>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
          {cartItems.length > 0 ? (
            cartItems.map((item, idx) => (
              <div 
                key={item.id || idx} 
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4"
              >
                {/* Image */}
                <div className="h-20 w-20 rounded-lg bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.imageUrl || item.img ? (
                    <img src={item.imageUrl || item.img} alt={item.title} className="h-full w-full object-contain mix-blend-multiply" />
                  ) : (
                    <ShoppingCart className="h-8 w-8 text-gray-300" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{item.sellerName || item.seller || "Brand"}</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    <span className="font-bold text-base text-gray-900">${(item.price || 0).toLocaleString()}</span>
                    
                    {/* Quantity Control */}
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white h-8">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)} 
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-l-lg"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900">
                        {item.quantity || 1}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-r-lg"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <ShoppingCart className="h-10 w-10" />
              </div>
              <h4 className="font-bold text-xl text-gray-900">Your Cart is Empty</h4>
              <p className="text-sm text-gray-500">Looks like you haven't added anything yet.</p>
              <Button 
                onClick={() => {
                  onClose();
                  navigate("/market-zone");
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg px-8"
              >
                Start Shopping
              </Button>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-200 space-y-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold text-gray-900">Subtotal <span className="text-sm font-normal text-gray-500">({totalQuantity} items)</span></span>
              <span className="font-bold text-gray-900">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <Button 
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 rounded-xl text-base"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}

      </SheetContent>
    </Sheet>
  );
};

export default CartBasketDrawer;
