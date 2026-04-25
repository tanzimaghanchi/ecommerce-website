import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { apiUrl } from "../config/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token, isAuthenticated, authReady } = useAuth();
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setItems([]);
      setTotalAmount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(apiUrl("/api/cart"), {
        headers: authHeaders,
      });
      setItems(response.data.items || []);
      setTotalAmount(Number(response.data.totalAmount || 0));
    } finally {
      setLoading(false);
    }
  }, [authHeaders, isAuthenticated, token]);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!isAuthenticated) {
      setItems([]);
      setTotalAmount(0);
      return;
    }

    fetchCart();
  }, [authReady, fetchCart, isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    const response = await axios.post(
      apiUrl("/api/cart"),
      { productId, quantity },
      { headers: authHeaders }
    );
    await fetchCart();
    return response.data;
  };

  const updateCartItem = async (cartItemId, quantity) => {
    const response = await axios.patch(
      apiUrl(`/api/cart/${cartItemId}`),
      { quantity },
      { headers: authHeaders }
    );
    await fetchCart();
    return response.data;
  };

  const removeCartItem = async (cartItemId) => {
    const response = await axios.delete(apiUrl(`/api/cart/${cartItemId}`), {
      headers: authHeaders,
    });
    await fetchCart();
    return response.data;
  };

  const placeOrder = async (payload) => {
    const response = await axios.post(apiUrl("/api/orders"), payload, {
      headers: authHeaders,
    });
    await fetchCart();
    return response.data;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalAmount,
        loading,
        cartCount: items.reduce((sum, item) => sum + item.quantity, 0),
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
};
