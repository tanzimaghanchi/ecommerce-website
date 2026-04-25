import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import CancellationForm from "../components/CancellationForm";
import DeliveryTimeline from "../components/DeliveryTimeline";
import StatusBanner from "../components/StatusBanner";
import { apiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatOrderDate, formatTitleCase } from "../utils/formatters";
import { buildProductFallbackImage, resolveMediaUrl } from "../utils/media";

const OrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState({ loading: true, type: "", message: "" });
  const [cancelState, setCancelState] = useState({
    open: false,
    selectedReason: "",
    manualReason: "",
    status: { type: "", message: "" },
  });

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchOrder = useCallback(async () => {
    setStatus((current) => ({ ...current, loading: true, message: "", type: "" }));

    try {
      const response = await axios.get(apiUrl(`/api/orders/${orderId}`), {
        headers: authHeaders,
      });
      setOrder(response.data.order);
      setStatus({ loading: false, type: "", message: "" });
    } catch (error) {
      setStatus({
        loading: false,
        type: "error",
        message: error.response?.data?.message || "Unable to load order details.",
      });
    }
  }, [authHeaders, orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const resetCancellation = () => {
    setCancelState({
      open: false,
      selectedReason: "",
      manualReason: "",
      status: { type: "", message: "" },
    });
  };

  const handleCancel = async () => {
    const finalReason =
      cancelState.selectedReason === "Other"
        ? cancelState.manualReason.trim()
        : cancelState.selectedReason;

    if (!finalReason) {
      setCancelState((current) => ({
        ...current,
        status: { type: "error", message: "Choose a reason or enter one manually." },
      }));
      return;
    }

    try {
      const response = await axios.patch(
        apiUrl(`/api/orders/${orderId}/cancel`),
        { cancelReason: finalReason },
        { headers: authHeaders }
      );
      setStatus({ loading: false, type: "success", message: response.data.message });
      resetCancellation();
      fetchOrder();
    } catch (error) {
      setCancelState((current) => ({
        ...current,
        status: {
          type: "error",
          message: error.response?.data?.message || "Unable to cancel order.",
        },
      }));
    }
  };

  return (
    <div className="page-shell">
      <section className="container section-space">
        <div className="section-heading">
          <span className="eyebrow">Order details</span>
          <h1>Order #{orderId}</h1>
          <p>Review items, delivery information, payment method, and current order status in one place.</p>
        </div>

        <div className="order-details-topbar">
          <button className="ghost-button" type="button" onClick={() => navigate("/orders")}>
            Back to orders
          </button>
          <Link className="secondary-button" to="/cart">
            Continue shopping
          </Link>
        </div>

        <StatusBanner type={status.type} message={status.message} />
        {status.loading ? <p className="state-copy">Loading order details...</p> : null}

        {order ? (
          <div className="order-details-stack">
            <div className="orders-layout">
              <article className="timeline-card order-card-shell">
                <div className="order-card-header">
                  <div>
                    <span className="category-pill">{formatTitleCase(order.status)}</span>
                    <h2>Placed on {formatOrderDate(order.createdAt)}</h2>
                  </div>
                  <div className="order-header-meta">
                    <strong>{formatCurrency(order.totalAmount)}</strong>
                    <span>{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="order-item-visual-list">
                  {order.items.map((item) => (
                    <article key={item.id} className="order-item-visual-card">
                      <div className="order-item-media-shell">
                        {item.image ? (
                          <img
                            className="order-item-image"
                            src={resolveMediaUrl(item.image)}
                            alt={item.name}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = buildProductFallbackImage(
                                item.name,
                                item.category
                              );
                            }}
                          />
                        ) : (
                          <div className="image-fallback">FAISHORA</div>
                        )}
                      </div>
                      <div className="order-item-copy">
                        <strong>{item.name}</strong>
                        <p className="state-copy">{item.category}</p>
                        <p className="state-copy">Quantity: {item.quantity}</p>
                        <p className="state-copy">Unit price: {formatCurrency(item.unitPrice)}</p>
                      </div>
                      <strong>{formatCurrency(item.lineTotal)}</strong>
                    </article>
                  ))}
                </div>
              </article>

              <aside className="timeline-card order-card-shell">
                <div className="order-address-block">
                  <strong>Shipping address</strong>
                  <p className="state-copy">{order.shippingAddress}</p>
                </div>

                <div className="order-address-block">
                  <strong>Payment method</strong>
                  <p className="state-copy">{order.paymentMethod}</p>
                </div>

                <div className="order-address-block">
                  <strong>Payment status</strong>
                  <p className="state-copy">{formatTitleCase(order.paymentStatus)}</p>
                </div>

                {order.paymentReference ? (
                  <div className="order-address-block">
                    <strong>Payment reference</strong>
                    <p className="state-copy order-reference-copy">{order.paymentReference}</p>
                  </div>
                ) : null}

                {order.cancelReason ? (
                  <div className="order-address-block">
                    <strong>Cancellation reason</strong>
                    <p className="state-copy">{order.cancelReason}</p>
                  </div>
                ) : null}

                {order.status !== "cancelled" && order.status !== "delivered" ? (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() =>
                      setCancelState({
                        open: true,
                        selectedReason: "",
                        manualReason: "",
                        status: { type: "", message: "" },
                      })
                    }
                  >
                    Cancel order
                  </button>
                ) : null}

                {cancelState.open ? (
                  <CancellationForm
                    selectedReason={cancelState.selectedReason}
                    manualReason={cancelState.manualReason}
                    status={cancelState.status}
                    onReasonChange={(value) =>
                      setCancelState((current) => ({
                        ...current,
                        selectedReason: value,
                        manualReason: value === "Other" ? current.manualReason : "",
                        status: { type: "", message: "" },
                      }))
                    }
                    onManualReasonChange={(value) =>
                      setCancelState((current) => ({
                        ...current,
                        manualReason: value,
                        status: { type: "", message: "" },
                      }))
                    }
                    onSubmit={handleCancel}
                    onCancel={resetCancellation}
                  />
                ) : null}
              </aside>
            </div>

            <DeliveryTimeline steps={order.statusTimeline} />
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default OrderDetails;
