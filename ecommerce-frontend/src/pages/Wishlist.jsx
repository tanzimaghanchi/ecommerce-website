import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { formatCurrency } from "../utils/formatters";
import { buildProductFallbackImage, resolveMediaUrl } from "../utils/media";

const Wishlist = () => {
  const { items, loading, removeWishlistItem } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="page-shell">
      <section className="container section-space">
        <div className="section-heading">
          <span className="eyebrow">Wishlist</span>
          <h1>Your saved FAISHORA favorites</h1>
          <p>Keep shortlisted items here and move them to cart whenever you are ready.</p>
        </div>

        {loading ? <p className="state-copy">Loading wishlist...</p> : null}

        {!loading && !items.length ? (
          <div className="timeline-card empty-state-card">
            <h2>Your wishlist is empty</h2>
            <p className="state-copy">Save products from the catalog to compare and shop later.</p>
            <Link className="primary-button" to="/">
              Discover products
            </Link>
          </div>
        ) : null}

        <div className="wishlist-grid">
          {items.map((item) => (
            <article key={item.wishlistItemId} className="product-card product-card-refined wishlist-card-refined">
              <div className="product-media product-media-refined">
                {item.product.image ? (
                  <img
                    src={resolveMediaUrl(item.product.image)}
                    alt={item.product.name}
                    className="product-image"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = buildProductFallbackImage(
                        item.product.name,
                        item.product.category
                      );
                    }}
                  />
                ) : (
                  <div className="image-fallback">No image</div>
                )}
              </div>
              <div className="product-content product-content-refined">
                <span className="category-pill category-pill-compact">{item.product.category}</span>
                <h3>{item.product.name}</h3>
                <p className="product-description">
                  {item.product.description || "Product details will appear here."}
                </p>

                <div className="product-card-bottom">
                  <div className="product-price-row">
                    <strong>{formatCurrency(item.product.price)}</strong>
                    <Link className="product-detail-link" to={`/products/${item.product.id}`}>
                      View details
                    </Link>
                  </div>

                  <div className="product-action-grid">
                    <button
                      className="ghost-button product-card-button wishlist-remove-button"
                      type="button"
                      onClick={() => removeWishlistItem(item.wishlistItemId)}
                    >
                      Remove
                    </button>
                    <button
                      className="primary-button product-card-button"
                      type="button"
                      onClick={() => addToCart(item.product.id, 1)}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Wishlist;
