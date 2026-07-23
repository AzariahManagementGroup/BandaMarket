import { toast } from "sonner";

export interface CartItem {
  id: string | number;
  title: string;
  price: number;
  quantity: number;
  selected: boolean;
  imageUrl?: string;
  img?: string;
  sellerName?: string;
  seller?: string;
  region?: string;
}

export const getCartItems = (): CartItem[] => {
  try {
    const data = localStorage.getItem("camemark_cart_items");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveCartItems = (items: CartItem[]) => {
  try {
    localStorage.setItem("camemark_cart_items", JSON.stringify(items));
    window.dispatchEvent(new Event("cart_updated"));
  } catch (e) {
    console.error("Failed to save cart items:", e);
  }
};

export const addToCart = (product: any, qty: number = 1) => {
  if (!product) return;

  const items = getCartItems();
  const prodId = product.id || `prod_${Date.now()}`;
  const priceNum = typeof product.price === "number" ? product.price : parseFloat(product.price) || 0;

  const existingIndex = items.findIndex(i => i.id === prodId || i.title === product.title);

  if (existingIndex >= 0) {
    items[existingIndex].quantity = (items[existingIndex].quantity || 1) + qty;
    items[existingIndex].selected = true; // Ensure re-selected upon adding
  } else {
    items.push({
      id: prodId,
      title: product.title || "Marketplace Product",
      price: priceNum,
      quantity: qty,
      selected: true,
      imageUrl: product.imageUrl || product.img || "",
      img: product.img || product.imageUrl || "",
      sellerName: product.sellerName || product.seller || "Verified Merchant",
      seller: product.seller || product.sellerName || "Verified Merchant",
      region: product.region || "Littoral"
    });
  }

  saveCartItems(items);
  toast.success(`🛒 Added "${product.title}" to cart!`);
};
