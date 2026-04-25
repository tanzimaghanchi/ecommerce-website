import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { formatCurrency } from "../utils/formatters";
import { buildProductFallbackImage, resolveMediaUrl } from "../utils/media";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeWishlistItem, isWishlisted, getWishlistItemId } = useWishlist();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: "", message: "" });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(apiUrl(`/api/products/${productId}`));
        setProduct(response.data.product);
        setStatus({ loading: false, error: "", message: "" });
      } catch (error) {
        setStatus({
          loading: false,
          error: error.response?.data?.message || "Unable to load product details.",
          message: "",
        });
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/products/${productId}` } } });
      return;
    }

    try {
      await addToCart(product.id, 1);
      setStatus((current) => ({ ...current, message: "Added to cart" }));
    } catch (error) {
      setStatus((current) => ({
        ...current,
        message: error.response?.data?.message || "Unable to add item",
      }));
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/wishlist" } } });
      return;
    }

    try {
      if (isWishlisted(product.id)) {
        await removeWishlistItem(getWishlistItemId(product.id));
        setStatus((current) => ({ ...current, message: "Removed from wishlist" }));
      } else {
        await addToWishlist(product.id);
        setStatus((current) => ({ ...current, message: "Saved to wishlist" }));
      }
    } catch (error) {
      setStatus((current) => ({
        ...current,
        message: error.response?.data?.message || "Unable to update wishlist",
      }));
    }
  };

  return (
    <div className="page-shell">
      <section className="container section-space">
        {status.loading ? <p className="state-copy">Loading product details...</p> : null}
        {status.error ? <div className="status-banner status-error">{status.error}</div> : null}

        {product ? (
          <div className="product-detail-layout">
            <div className="product-detail-media timeline-card">
              {product.image ? (
                <img
                  src={resolveMediaUrl(product.image)}
                  alt={product.name}
                  className="product-detail-image"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = buildProductFallbackImage(
                      product.name,
                      product.category
                    );
                  }}
                />
              ) : (
                <div className="image-fallback">No image</div>
              )}
            </div>
            <div className="timeline-card product-detail-copy">
              <span className="eyebrow">Product details</span>
              <h1>{product.name}</h1>
              <span className="category-pill">{product.category}</span>
              <p className="product-description product-detail-description">
                {product.description || "Detailed merchandising copy can be added here for richer storytelling."}
              </p>
              <strong className="product-detail-price">{formatCurrency(product.price)}</strong>
              <div className="detail-action-row">
                <button className="primary-button" type="button" onClick={handleAddToCart}>
                  Add to cart
                </button>
                <button className="ghost-button" type="button" onClick={handleWishlist}>
                  {isWishlisted(product.id) ? "Remove wishlist" : "Save wishlist"}
                </button>
              </div>
              {status.message ? <p className="product-status-copy">{status.message}</p> : null}
              <Link className="product-detail-link" to="/cart">
                Go to cart
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default ProductDetails;
