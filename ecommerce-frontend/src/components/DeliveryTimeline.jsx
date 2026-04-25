import React from "react";

const DeliveryTimeline = ({ steps = [] }) => {
  if (!steps.length) {
    return null;
  }

  return (
    <section className="timeline-card order-card-shell">
      <div className="panel-header-row">
        <div>
          <span className="eyebrow">Delivery journey</span>
          <h2>Order timeline</h2>
        </div>
      </div>

      <div className="delivery-timeline">
        {steps.map((step) => (
          <div key={step.key} className="delivery-step">
            <div
              className={`delivery-step-dot ${step.completed ? "delivery-step-dot-complete" : ""} ${
                step.active ? "delivery-step-dot-active" : ""
              }`}
            />
            <div>
              <strong>{step.label}</strong>
              <p className="state-copy">
                {step.active
                  ? "Current status"
                  : step.completed
                    ? "Completed"
                    : "Pending"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DeliveryTimeline;
