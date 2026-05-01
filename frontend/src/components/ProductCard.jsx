import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { formatCurrency } from "../utils/formatters";
import { buildProductFallbackImage, resolveMediaUrl } from "../utils/media";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeWishlistItem, isWishlisted, getWishlistItemId } = useWishlist();
  const [status, setStatus] = useState("");
  const fallbackImage = buildProductFallbackImage(product.name, product.category);
  const [imageSrc, setImageSrc] = useState(resolveMediaUrl(product.image) || fallbackImage);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/cart" } } });
      return;
    }

    try {
      await addToCart(product.id, 1);
      setStatus("Added to cart");
      window.setTimeout(() => setStatus(""), 1800);
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to add item");
      window.setTimeout(() => setStatus(""), 2200);
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
        setStatus("Removed from wishlist");
      } else {
        await addToWishlist(product.id);
        setStatus("Saved to wishlist");
      }
      window.setTimeout(() => setStatus(""), 1800);
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to update wishlist");
      window.setTimeout(() => setStatus(""), 2200);
    }
  };

  return (
    <article className="product-card product-card-refined">
      <div className="product-media product-media-refined">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="product-image"
            onError={() => {
              if (imageSrc !== fallbackImage) {
                setImageSrc(fallbackImage);
              } else {
                setImageSrc("");
              }
            }}
          />
        ) : (
          <div className="image-fallback">No image</div>
        )}
      </div>

      <div className="product-content product-content-refined">
        <span className="category-pill category-pill-compact">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="product-description">
          {product.description || "A clean product presentation ready for detailed pages."}
        </p>

        <div className="product-card-bottom">
          <div className="product-price-row">
            <strong>{formatCurrency(product.price)}</strong>
            <Link className="product-detail-link" to={`/products/${product.id}`}>
              View details
            </Link>
          </div>

          <div className="product-action-grid">
            <button className="ghost-button product-card-button" type="button" onClick={handleWishlist}>
              {isWishlisted(product.id) ? "Saved" : "Wishlist"}
            </button>
            <button className="primary-button product-card-button" type="button" onClick={handleAddToCart}>
              Add to cart
            </button>
          </div>
        </div>

        {status ? <p className="product-status-copy">{status}</p> : null}
      </div>
    </article>
  );
};

export default ProductCard;
