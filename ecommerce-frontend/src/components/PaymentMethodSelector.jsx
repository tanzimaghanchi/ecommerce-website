import React from "react";

const paymentOptions = [
  {
    value: "Cash on Delivery",
    title: "Cash on Delivery",
    description: "Accept payment when the order reaches your doorstep.",
  },
  {
    value: "UPI",
    title: "UPI",
    description: "Fast checkout for UPI-ready customers.",
  },
  {
    value: "Credit Card",
    title: "Credit Card",
    description: "Card checkout experience for premium shoppers.",
  },
  {
    value: "Debit Card",
    title: "Debit Card",
    description: "Great for direct bank-linked purchases.",
  },
];

const PaymentMethodSelector = ({ value, onChange }) => {
  return (
    <section className="timeline-card checkout-section-card">
      <div className="panel-header-row">
        <div>
          <span className="eyebrow">Step 3</span>
          <h2 className="checkout-section-title">Payment method</h2>
        </div>
      </div>

      <div className="payment-option-grid">
        {paymentOptions.map((option) => {
          const isActive = value === option.value;

          return (
            <label
              key={option.value}
              className={`payment-option-card ${isActive ? "payment-option-card-active" : ""}`}
            >
              <input
                checked={isActive}
                className="payment-option-input"
                name="paymentMethod"
                onChange={() => onChange(option.value)}
                type="radio"
                value={option.value}
              />
              <strong>{option.title}</strong>
              <p>{option.description}</p>
            </label>
          );
        })}
      </div>
    </section>
  );
};

export default PaymentMethodSelector;
