import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatters";
import { buildProductFallbackImage, resolveMediaUrl } from "../utils/media";

const Cart = () => {
  const { items, totalAmount, loading, updateCartItem, removeCartItem } = useCart();

  return (
    <div className="page-shell">
      <section className="container section-space">
        <div className="section-heading">
          <span className="eyebrow">Shopping cart</span>
          <h1>Review your FAISHORA selections</h1>
          <p>Update quantity, remove items, and continue to checkout when ready.</p>
        </div>

        {loading ? <p className="state-copy">Loading cart...</p> : null}

        {!loading && items.length === 0 ? (
          <div className="timeline-card empty-state-card">
            <h2>Your cart is empty</h2>
            <p className="state-copy">Browse products and add your favorites to start checkout.</p>
            <Link className="primary-button" to="/">
              Continue shopping
            </Link>
          </div>
        ) : null}

        {items.length ? (
          <div className="cart-layout">
            <div className="cart-items-panel">
              {items.map((item) => (
                <article key={item.cartItemId} className="cart-item-card">
                  <div className="cart-item-media">
                    {item.product.image ? (
                      <img
                        src={resolveMediaUrl(item.product.image)}
                        alt={item.product.name}
                        className="cart-thumb"
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
                  <div className="cart-item-content">
                    <span className="category-pill">{item.product.category}</span>
                    <h3>{item.product.name}</h3>
                    <p className="product-description">
                      {item.product.description || "Product details will appear here."}
                    </p>
                    <div className="cart-item-actions">
                      <select
                        className="category-select quantity-select"
                        value={item.quantity}
                        onChange={(e) => updateCartItem(item.cartItemId, Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5].map((qty) => (
                          <option key={qty} value={qty}>
                            Qty {qty}
                          </option>
                        ))}
                      </select>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => removeCartItem(item.cartItemId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <strong className="cart-line-total">{formatCurrency(item.lineTotal)}</strong>
                </article>
              ))}
            </div>

            <aside className="timeline-card cart-summary-card">
              <h2>Order summary</h2>
              <div className="summary-row">
                <span>Items</span>
                <strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong>
              </div>
              <div className="summary-row">
                <span>Total</span>
                <strong>{formatCurrency(totalAmount)}</strong>
              </div>
              <Link className="primary-button w-100" to="/checkout">
                Continue to checkout
              </Link>
            </aside>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default Cart;
