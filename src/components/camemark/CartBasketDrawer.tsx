import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, Trash2, ArrowRight, Package, Lock, CheckCircle2, ShieldCheck, Plus, Minus, X
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

  const toggleItemSelection = (id: string | number) => {
    const updated = cartItems.map(item => item.id === id ? { ...item, selected: !item.selected } : item);
    setCartItems(updated);
    saveCartItems(updated);
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);
    const updated = cartItems.map(item => ({ ...item, selected: !allSelected }));
    setCartItems(updated);
    saveCartItems(updated);
  };

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
    toast.success("Item removed from cart basket");
  };

  const emptyCart = () => {
    setCartItems([]);
    saveCartItems([]);
    toast.success("🛒 Your cart basket has been emptied!");
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
  const totalQuantity = selectedItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const tax = Math.round(subtotal * 0.1925);
  const shippingEst = selectedItems.length > 0 ? 1000 : 0;
  const totalAmount = subtotal + tax + shippingEst;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-white p-0 flex flex-col h-full font-sans border-l border-gray-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-none">Cart Basket</h3>
              <p className="text-[11px] text-emerald-200 mt-1 font-medium">
                {selectedItems.length} of {cartItems.length} items selected
              </p>
            </div>
          </div>
          {cartItems.length > 0 && (
            <button 
              onClick={emptyCart}
              className="text-xs font-bold text-red-300 hover:text-red-100 flex items-center gap-1 hover:underline bg-red-950/50 px-2.5 py-1 rounded-lg border border-red-900/50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Empty
            </button>
          )}
        </div>

        {/* Master Select All bar */}
        {cartItems.length > 0 && (
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200/80 flex items-center justify-between text-xs shrink-0">
            <button 
              onClick={toggleSelectAll} 
              className="flex items-center gap-2 font-extrabold text-gray-700 hover:text-emerald-900 cursor-pointer"
            >
              <Checkbox checked={cartItems.length > 0 && cartItems.every(i => i.selected)} />
              <span>Select All Items ({selectedItems.length}/{cartItems.length})</span>
            </button>
            <span className="text-[11px] text-emerald-800 font-black">
              {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in total
            </span>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cartItems.length > 0 ? (
            cartItems.map((item, idx) => (
              <div 
                key={item.id || idx} 
                className={`p-3.5 rounded-2xl border transition-all space-y-3 ${
                  item.selected ? "bg-emerald-50/40 border-emerald-300 shadow-sm" : "bg-gray-50 border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={!!item.selected} 
                    onCheckedChange={() => toggleItemSelection(item.id)} 
                    className="mt-1"
                  />
                  <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center">
                    {item.imageUrl || item.img ? (
                      <img src={item.imageUrl || item.img} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-gray-900 text-xs line-clamp-1">{item.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.sellerName || item.seller || "Verified Seller"}</p>
                    <p className="text-xs font-black text-emerald-800 mt-1">FCFA {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                  <span className="text-[11px] font-bold text-gray-500">Unit Price: FCFA {(item.price || 0).toLocaleString()}</span>
                  <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-xs">
                    <button onClick={() => updateQuantity(item.id, -1)} className="h-7 w-7 font-extrabold text-gray-600 hover:bg-gray-100 flex items-center justify-center">-</button>
                    <span className="px-2.5 text-xs font-black text-gray-900">{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="h-7 w-7 font-extrabold text-gray-600 hover:bg-gray-100 flex items-center justify-center">+</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500 space-y-3">
              <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm">Your Cart Basket is Empty</h4>
              <p className="text-xs text-gray-400 max-w-xs">Explore products on the Marketplace and tap the cart icon to add items.</p>
              <Button 
                onClick={() => {
                  onClose();
                  navigate("/market-zone");
                }}
                className="bg-[#064E3B] hover:bg-emerald-950 text-white font-bold rounded-xl text-xs h-10 px-5"
              >
                Browse Marketplace
              </Button>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-200 space-y-3 shrink-0 shadow-lg">
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Selected Subtotal ({totalQuantity} items):</span>
                <span className="font-bold text-gray-900">FCFA {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery & Tax:</span>
                <span className="font-bold text-gray-900">FCFA {(tax + shippingEst).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 pt-1.5 border-t border-gray-100">
                <span>Total Amount:</span>
                <span className="text-emerald-800 text-base font-extrabold">FCFA {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <Button 
              disabled={selectedItems.length === 0}
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
              className="w-full bg-[#064E3B] hover:bg-emerald-950 disabled:bg-gray-300 text-white font-extrabold h-12 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <Lock className="h-4 w-4" />
              {selectedItems.length === 0 ? "Select Items to Checkout" : `Proceed to Checkout (${totalQuantity} items) →`}
            </Button>
          </div>
        )}

      </SheetContent>
    </Sheet>
  );
};

export default CartBasketDrawer;
