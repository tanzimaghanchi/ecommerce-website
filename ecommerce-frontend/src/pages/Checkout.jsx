import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddressForm from "../components/AddressForm";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import SavedAddressList from "../components/SavedAddressList";
import StatusBanner from "../components/StatusBanner";
import { apiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatters";

const initialAddressForm = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

const buildShippingAddress = (address) => {
  const segments = [
    address.fullName,
    address.phone,
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ];

  return segments.filter(Boolean).join(", ");
};

const createPaymentReference = (paymentMethod) => {
  const prefixMap = {
    UPI: "UPI",
    "Credit Card": "CC",
    "Debit Card": "DC",
  };

  return `${prefixMap[paymentMethod] || "PAY"}-${Date.now().toString(36).toUpperCase()}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { items, totalAmount, placeOrder } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [addressStatus, setAddressStatus] = useState({ type: "", message: "" });
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const isDigitalPayment = paymentMethod !== "Cash on Delivery";

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const response = await axios.get(apiUrl("/api/addresses"), {
          headers: authHeaders,
        });
        const nextAddresses = response.data.addresses || [];
        setAddresses(nextAddresses);

        const defaultAddress = nextAddresses.find((address) => address.isDefault) || nextAddresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setUseNewAddress(false);
        } else {
          setUseNewAddress(true);
        }
      } catch (error) {
        setAddressStatus({
          type: "error",
          message: error.response?.data?.message || "Unable to load saved addresses.",
        });
      } finally {
        setLoadingAddresses(false);
      }
    };

    if (token) {
      fetchAddresses();
    }
  }, [authHeaders, token]);

  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value,
    });
  };

  const validateNewAddress = () => {
    return (
      addressForm.fullName &&
      addressForm.phone &&
      addressForm.line1 &&
      addressForm.city &&
      addressForm.state &&
      addressForm.postalCode
    );
  };

  const saveAddress = async (makeDefault = false) => {
    const response = await axios.post(
      apiUrl("/api/addresses"),
      {
        ...addressForm,
        isDefault: makeDefault || !addresses.length,
      },
      { headers: authHeaders }
    );

    const savedAddress = response.data.address;
    const nextAddresses = [savedAddress, ...addresses.filter((address) => address.id !== savedAddress.id)].sort(
      (left, right) => Number(right.isDefault) - Number(left.isDefault)
    );

    setAddresses(nextAddresses);
    setSelectedAddressId(savedAddress.id);
    setUseNewAddress(false);
    setAddressForm(initialAddressForm);
    setAddressStatus({ type: "success", message: response.data.message });

    return savedAddress;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setAddressStatus({ type: "", message: "" });

    try {
      const payload = { paymentMethod };

      if (useNewAddress) {
        if (!validateNewAddress()) {
          setAddressStatus({
            type: "error",
            message: "Complete the full address before placing your order.",
          });
          return;
        }

        if (saveForFuture) {
          const savedAddress = await saveAddress(!addresses.length);
          payload.addressId = savedAddress.id;
        } else {
          payload.shippingAddress = buildShippingAddress(addressForm);
        }
      } else if (selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        setAddressStatus({
          type: "error",
          message: "Choose a saved address or add a new one to continue.",
        });
        return;
      }

      if (isDigitalPayment) {
        setProcessingPayment(true);
        payload.paymentStatus = "paid";
        payload.paymentReference = createPaymentReference(paymentMethod);
      }

      const response = await placeOrder(payload);
      const successMessage = isDigitalPayment
        ? `${response.message} Payment confirmed for ${paymentMethod}.`
        : response.message;

      navigate("/orders", {
        replace: true,
        state: { successMessage },
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to place order.",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="container section-space">
        <div className="section-heading">
          <span className="eyebrow">Checkout</span>
          <h1>Address and payment details</h1>
          <p>Choose a delivery destination, confirm payment, and complete this FAISHORA order with confidence.</p>
        </div>

        <div className="cart-layout">
          <form className="checkout-stack" onSubmit={handleSubmit}>
            {loadingAddresses ? <p className="state-copy">Loading your saved addresses...</p> : null}

            <SavedAddressList
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              useNewAddress={useNewAddress}
              onSelectAddress={(addressId) => {
                setSelectedAddressId(addressId);
                setUseNewAddress(false);
                setAddressStatus({ type: "", message: "" });
              }}
              onChooseNew={() => {
                setUseNewAddress(true);
                setSelectedAddressId(null);
              }}
            />

            {useNewAddress ? (
              <AddressForm
                formData={addressForm}
                onChange={handleAddressChange}
                saveForFuture={saveForFuture}
                onToggleSave={() => setSaveForFuture((currentValue) => !currentValue)}
              />
            ) : null}

            <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

            {isDigitalPayment ? (
              <div className="timeline-card checkout-section-card">
                <div className="panel-header-row">
                  <div>
                    <span className="eyebrow">Secure payment</span>
                    <h2 className="checkout-section-title">Payment confirmation</h2>
                  </div>
                </div>
                <p className="state-copy">
                  FAISHORA is simulating a secure {paymentMethod.toLowerCase()} authorization locally for now. A payment reference will be attached to your order automatically.
                </p>
              </div>
            ) : null}

            <StatusBanner type={addressStatus.type} message={addressStatus.message} />
            <StatusBanner type={status.type} message={status.message} />

            <button className="primary-button w-100" type="submit" disabled={!items.length || processingPayment}>
              {processingPayment ? "Processing payment..." : isDigitalPayment ? "Pay and place order" : "Place order"}
            </button>
          </form>

          <aside className="timeline-card cart-summary-card">
            <h2>Checkout summary</h2>
            <div className="summary-row">
              <span>Items</span>
              <strong>{itemCount}</strong>
            </div>
            <div className="summary-row">
              <span>Total</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
            <div className="summary-row">
              <span>Payment</span>
              <strong>{paymentMethod}</strong>
            </div>
            <div className="summary-row">
              <span>Collection</span>
              <strong>{isDigitalPayment ? "Prepaid" : "Pay on delivery"}</strong>
            </div>
            <div className="checkout-mini-list">
              {items.map((item) => (
                <div key={item.cartItemId} className="summary-row">
                  <span>{item.product.name} x {item.quantity}</span>
                  <strong>{formatCurrency(item.lineTotal)}</strong>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Checkout;
