import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import CancellationForm from "../components/CancellationForm";
import { apiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatOrderDate } from "../utils/formatters";

const Orders = () => {
  const location = useLocation();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState({
    loading: true,
    error: "",
    success: location.state?.successMessage || "",
  });
  const [cancelState, setCancelState] = useState({
    orderId: null,
    selectedReason: "",
    manualReason: "",
    status: { type: "", message: "" },
  });

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(apiUrl("/api/orders"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
      setStatus((current) => ({ ...current, loading: false, error: "" }));
    } catch (error) {
      setStatus((current) => ({
        ...current,
        loading: false,
        error: error.response?.data?.message || "Unable to load your orders.",
      }));
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const resetCancellation = () => {
    setCancelState({
      orderId: null,
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
      await axios.patch(
        apiUrl(`/api/orders/${cancelState.orderId}/cancel`),
        { cancelReason: finalReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus((current) => ({ ...current, success: "Order cancelled successfully." }));
      resetCancellation();
      fetchOrders();
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
          <span className="eyebrow">My orders</span>
          <h1>Track, review, and manage your FAISHORA orders</h1>
          <p>See placed orders, payment method, delivery details, and cancellation status in one place.</p>
        </div>

        {status.success ? <div className="status-banner status-success">{status.success}</div> : null}
        {status.error ? <div className="status-banner status-error">{status.error}</div> : null}
        {status.loading ? <p className="state-copy">Loading orders...</p> : null}

        {!status.loading && !orders.length ? (
          <div className="timeline-card empty-state-card">
            <h2>No orders yet</h2>
            <p className="state-copy">Your future orders will appear here after checkout.</p>
          </div>
        ) : null}

        <div className="orders-stack">
          {orders.map((order) => {
            const isCancellingThisOrder = cancelState.orderId === order.id;

            return (
              <article key={order.id} className="timeline-card order-card-shell">
                <div className="order-card-header">
                  <div>
                    <span className="category-pill">{order.status}</span>
                    <h2>Order #{order.id}</h2>
                    <p className="state-copy">Placed on {formatOrderDate(order.createdAt)}</p>
                  </div>
                  <div className="order-header-meta">
                    <strong>{formatCurrency(order.totalAmount)}</strong>
                    <span>{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="checkout-mini-list">
                  {order.items.map((item) => (
                    <div key={item.id} className="summary-row order-item-row">
                      <span>{item.name} x {item.quantity}</span>
                      <strong>{formatCurrency(item.lineTotal)}</strong>
                    </div>
                  ))}
                </div>

                <div className="order-address-block">
                  <strong>Shipping address</strong>
                  <p className="state-copy">{order.shippingAddress}</p>
                </div>

                {order.cancelReason ? (
                  <div className="order-address-block">
                    <strong>Cancellation reason</strong>
                    <p className="state-copy">{order.cancelReason}</p>
                  </div>
                ) : null}

                <div className="account-inline-actions">
                  <Link className="secondary-button" to={`/orders/${order.id}`}>
                    View details
                  </Link>
                  {order.status !== "cancelled" && order.status !== "delivered" ? (
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() =>
                        setCancelState({
                          orderId: order.id,
                          selectedReason: "",
                          manualReason: "",
                          status: { type: "", message: "" },
                        })
                      }
                    >
                      Cancel order
                    </button>
                  ) : null}
                </div>

                {isCancellingThisOrder ? (
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
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Orders;
