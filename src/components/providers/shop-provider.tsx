"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import type { CartItem, Order, Product, SavedAddress } from "@/types/commerce";

function mapAddressRow(row: Record<string, unknown>): SavedAddress {
  return {
    id: String(row.id),
    label: String(row.label || "Address"),
    fullName: String(row.full_name || ""),
    phone: String(row.phone || ""),
    address: String(row.address || ""),
    district: String(row.district || ""),
    pincode: String(row.pincode || ""),
    landmark: row.landmark ? String(row.landmark) : undefined,
    isDefault: row.is_default === true
  };
}

function addressToRow(address: Omit<SavedAddress, "id">, userId: string) {
  return {
    user_id: userId,
    label: address.label,
    full_name: address.fullName,
    phone: address.phone,
    address: address.address || "",
    district: address.district,
    pincode: address.pincode,
    landmark: address.landmark || null,
    is_default: address.isDefault
  };
}

function shouldUseSupabaseAddresses(userId?: string) {
  return Boolean(hasSupabaseConfig() && userId && !userId.startsWith("testing-"));
}

type ShopContextValue = {
  cart: CartItem[];
  wishlist: Product[];
  savedAddresses: SavedAddress[];
  orders: Order[];
  cartCount: number;
  wishlistCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number, variant?: string) => boolean;
  addOrder: (order: Order) => boolean;
  removeFromCart: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => boolean;
  moveWishlistToCart: (product: Product) => boolean;
  isWishlisted: (productId: string) => boolean;
  addSavedAddress: (address: Omit<SavedAddress, "id">) => Promise<SavedAddress | null>;
  updateSavedAddress: (addressId: string, address: Omit<SavedAddress, "id">) => Promise<SavedAddress | null>;
  removeSavedAddress: (addressId: string) => Promise<boolean>;
  setDefaultAddress: (addressId: string) => Promise<boolean>;
};

const ShopContext = createContext<ShopContextValue | null>(null);

const CART_KEY = "rida-boutique-cart";
const ADDRESSES_KEY = "rida-boutique-addresses";
const ORDERS_KEY = "rida-boutique-orders";
const WISHLIST_KEY = "rida-boutique-wishlist";

function userStorageKey(base: string, userId: string) {
  return `${base}:${userId}`;
}

function localAddressId() {
  return `local-address-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, requestLogin, user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCart([]);
      setOrders([]);
      setWishlist([]);
      return;
    }

    try {
      const savedCart = window.localStorage.getItem(userStorageKey(CART_KEY, user.id));
      const savedOrders = window.localStorage.getItem(userStorageKey(ORDERS_KEY, user.id));
      const savedWishlist = window.localStorage.getItem(userStorageKey(WISHLIST_KEY, user.id));

      setCart(savedCart ? (JSON.parse(savedCart) as CartItem[]) : []);
      setOrders(savedOrders ? (JSON.parse(savedOrders) as Order[]) : []);
      setWishlist(savedWishlist ? (JSON.parse(savedWishlist) as Product[]) : []);
    } catch {
      setCart([]);
      setOrders([]);
      setWishlist([]);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      window.localStorage.setItem(userStorageKey(CART_KEY, user.id), JSON.stringify(cart));
    }
  }, [cart, isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      window.localStorage.setItem(userStorageKey(WISHLIST_KEY, user.id), JSON.stringify(wishlist));
    }
  }, [isAuthenticated, user, wishlist]);

  useEffect(() => {
    if (isAuthenticated && user) {
      window.localStorage.setItem(userStorageKey(ORDERS_KEY, user.id), JSON.stringify(orders));
    }
  }, [isAuthenticated, orders, user]);

  useEffect(() => {
    let active = true;

    async function loadAddresses() {
      if (!isAuthenticated || !user) {
        setSavedAddresses([]);
        return;
      }

      const localAddresses = window.localStorage.getItem(userStorageKey(ADDRESSES_KEY, user.id));
      const parsedLocalAddresses = localAddresses ? (JSON.parse(localAddresses) as SavedAddress[]) : [];

      if (!shouldUseSupabaseAddresses(user.id)) {
        setSavedAddresses(parsedLocalAddresses);
        return;
      }

      try {
        const { data, error } = await getSupabaseBrowserClient()
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (!active) {
          return;
        }

        if (error) {
          setSavedAddresses(parsedLocalAddresses);
          return;
        }

        setSavedAddresses((data || []).map(mapAddressRow));
      } catch {
        if (active) {
          setSavedAddresses(parsedLocalAddresses);
        }
      }
    }

    void loadAddresses();

    return () => {
      active = false;
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      window.localStorage.setItem(userStorageKey(ADDRESSES_KEY, user.id), JSON.stringify(savedAddresses));
    }
  }, [isAuthenticated, savedAddresses, user]);

  const addToCart = useCallback((product: Product, quantity = 1, variant?: string) => {
    if (!requestLogin("Sign in with email to add items to your cart.")) {
      return false;
    }

    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id && item.variant === variant);

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id && item.variant === variant
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...current, { product, quantity, variant }];
    });
    return true;
  }, [requestLogin]);

  const removeFromCart = useCallback((productId: string, variant?: string) => {
    setCart((current) =>
      current.filter((item) => !(item.product.id === productId && item.variant === variant))
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variant?: string) => {
    setCart((current) =>
      current.map((item) => {
        if (item.product.id !== productId || item.variant !== variant) {
          return item;
        }

        const maxQuantity = Math.max(1, item.product.stock);
        return { ...item, quantity: Math.min(maxQuantity, Math.max(1, quantity)) };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addOrder = useCallback((order: Order) => {
    if (!isAuthenticated || !user) {
      return false;
    }

    setOrders((current) => [order, ...current.filter((item) => item.id !== order.id)].slice(0, 50));
    return true;
  }, [isAuthenticated, user]);

  const toggleWishlist = useCallback((product: Product) => {
    if (!requestLogin("Sign in with email to save products to your wishlist.")) {
      return false;
    }

    setWishlist((current) => {
      if (current.some((item) => item.id === product.id)) {
        return current.filter((item) => item.id !== product.id);
      }

      return [...current, product];
    });
    return true;
  }, [requestLogin]);

  const moveWishlistToCart = useCallback(
    (product: Product) => {
      if (!requestLogin("Sign in with email to move wishlist items to cart.")) {
        return false;
      }

      if (!addToCart(product)) {
        return false;
      }
      setWishlist((current) => current.filter((item) => item.id !== product.id));
      return true;
    },
    [addToCart, requestLogin]
  );

  const isWishlisted = useCallback(
    (productId: string) => isAuthenticated && wishlist.some((product) => product.id === productId),
    [isAuthenticated, wishlist]
  );

  const addSavedAddress = useCallback(async (address: Omit<SavedAddress, "id">) => {
    if (!requestLogin("Sign in with email to save delivery addresses.")) {
      return null;
    }

    const shouldBeDefault = address.isDefault || savedAddresses.length === 0;
    const localAddress: SavedAddress = {
      ...address,
      id: localAddressId(),
      isDefault: shouldBeDefault
    };

    function applyLocal(next: SavedAddress) {
      setSavedAddresses((current) => [
        ...current.map((item) => ({ ...item, isDefault: shouldBeDefault ? false : item.isDefault })),
        next
      ]);
    }

    if (user && shouldUseSupabaseAddresses(user.id)) {
      try {
        const supabase = getSupabaseBrowserClient();

        if (shouldBeDefault) {
          await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
        }

        const { data, error } = await supabase
          .from("addresses")
          .insert(addressToRow({ ...address, isDefault: shouldBeDefault }, user.id))
          .select("*")
          .single();

        if (error || !data) {
          throw error || new Error("Address insert failed.");
        }

        const nextAddress = mapAddressRow(data);
        applyLocal(nextAddress);
        return nextAddress;
      } catch {
        applyLocal(localAddress);
        return localAddress;
      }
    }

    applyLocal(localAddress);
    return localAddress;
  }, [requestLogin, savedAddresses.length, user]);

  const updateSavedAddress = useCallback(async (addressId: string, address: Omit<SavedAddress, "id">) => {
    if (!requestLogin("Sign in with email to edit saved addresses.")) {
      return null;
    }

    function applyLocal(next: SavedAddress) {
      setSavedAddresses((current) =>
        current.map((item) =>
          item.id === addressId
            ? next
            : { ...item, isDefault: next.isDefault ? false : item.isDefault }
        )
      );
    }

    const localAddress: SavedAddress = { ...address, id: addressId };

    if (user && shouldUseSupabaseAddresses(user.id)) {
      try {
        const supabase = getSupabaseBrowserClient();

        if (address.isDefault) {
          await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
        }

        const row = addressToRow(address, user.id);
        const { data, error } = await supabase
          .from("addresses")
          .update(row)
          .eq("id", addressId)
          .eq("user_id", user.id)
          .select("*")
          .single();

        if (error || !data) {
          throw error || new Error("Address update failed.");
        }

        const nextAddress = mapAddressRow(data);
        applyLocal(nextAddress);
        return nextAddress;
      } catch {
        applyLocal(localAddress);
        return localAddress;
      }
    }

    applyLocal(localAddress);
    return localAddress;
  }, [requestLogin, user]);

  const removeSavedAddress = useCallback(async (addressId: string) => {
    if (!requestLogin("Sign in with email to manage saved addresses.")) {
      return false;
    }

    function applyLocal() {
      setSavedAddresses((current) => {
        const remaining = current.filter((address) => address.id !== addressId);

        if (!remaining.length || remaining.some((address) => address.isDefault)) {
          return remaining;
        }

        return remaining.map((address, index) => ({ ...address, isDefault: index === 0 }));
      });
    }

    if (user && shouldUseSupabaseAddresses(user.id)) {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", user.id);

        const remaining = savedAddresses.filter((address) => address.id !== addressId);
        if (remaining.length && !remaining.some((address) => address.isDefault)) {
          await supabase.from("addresses").update({ is_default: true }).eq("id", remaining[0].id).eq("user_id", user.id);
        }
      } catch {
        // fall through to local update
      }
    }

    applyLocal();
    return true;
  }, [requestLogin, savedAddresses, user]);

  const setDefaultAddress = useCallback(async (addressId: string) => {
    if (!requestLogin("Sign in with email to manage saved addresses.")) {
      return false;
    }

    if (user && shouldUseSupabaseAddresses(user.id)) {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
        await supabase.from("addresses").update({ is_default: true }).eq("id", addressId).eq("user_id", user.id);
      } catch {
        // fall through to local update
      }
    }

    setSavedAddresses((current) =>
      current.map((address) => ({ ...address, isDefault: address.id === addressId }))
    );
    return true;
  }, [requestLogin, user]);

  const value = useMemo(
    () => ({
      cart: isAuthenticated ? cart : [],
      wishlist: isAuthenticated ? wishlist : [],
      savedAddresses: isAuthenticated ? savedAddresses : [],
      orders: isAuthenticated ? orders : [],
      cartCount: isAuthenticated ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0,
      wishlistCount: isAuthenticated ? wishlist.length : 0,
      subtotal: isAuthenticated
        ? cart.reduce((sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity, 0)
        : 0,
      addOrder,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      moveWishlistToCart,
      isWishlisted,
      addSavedAddress,
      updateSavedAddress,
      removeSavedAddress,
      setDefaultAddress
    }),
    [
      addOrder,
      addSavedAddress,
      addToCart,
      cart,
      clearCart,
      isAuthenticated,
      isWishlisted,
      moveWishlistToCart,
      removeFromCart,
      removeSavedAddress,
      orders,
      savedAddresses,
      setDefaultAddress,
      toggleWishlist,
      updateSavedAddress,
      updateQuantity,
      wishlist
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider.");
  }

  return context;
}
