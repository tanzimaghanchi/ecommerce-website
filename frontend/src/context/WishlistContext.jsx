import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { token, isAuthenticated, authReady } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(apiUrl("/api/wishlist"), {
        headers: authHeaders,
      });
      setItems(response.data.items || []);
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
      return;
    }

    fetchWishlist();
  }, [authReady, fetchWishlist, isAuthenticated]);

  const addToWishlist = async (productId) => {
    const response = await axios.post(
      apiUrl("/api/wishlist"),
      { productId },
      { headers: authHeaders }
    );
    await fetchWishlist();
    return response.data;
  };

  const removeWishlistItem = async (wishlistItemId) => {
    const response = await axios.delete(apiUrl(`/api/wishlist/${wishlistItemId}`), {
      headers: authHeaders,
    });
    await fetchWishlist();
    return response.data;
  };

  const isWishlisted = (productId) =>
    items.some((item) => item.product.id === productId);

  const getWishlistItemId = (productId) =>
    items.find((item) => item.product.id === productId)?.wishlistItemId;

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        wishlistCount: items.length,
        fetchWishlist,
        addToWishlist,
        removeWishlistItem,
        isWishlisted,
        getWishlistItemId,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider.");
  }

  return context;
};
