import React from "react";
import StatusBanner from "./StatusBanner";

const cancellationOptions = [
  "Changed my mind",
  "Found a better price elsewhere",
  "Ordered by mistake",
  "Delivery is taking too long",
  "Need to update address or contact details",
  "Other",
];

const CancellationForm = ({
  selectedReason,
  manualReason,
  status,
  onReasonChange,
  onManualReasonChange,
  onSubmit,
  onCancel,
}) => {
  const isOtherReason = selectedReason === "Other";

  return (
    <div className="cancellation-card">
      <div className="panel-header-row">
        <div>
          <span className="eyebrow">Cancellation</span>
          <h3 className="checkout-section-title">Tell us why you want to cancel</h3>
        </div>
      </div>

      <select
        className="category-select cancellation-select"
        value={selectedReason}
        onChange={(event) => onReasonChange(event.target.value)}
      >
        <option value="">Choose a reason</option>
        {cancellationOptions.map((reason) => (
          <option key={reason} value={reason}>
            {reason}
          </option>
        ))}
      </select>

      {isOtherReason ? (
        <textarea
          className="form-control form-textarea cancellation-textarea"
          placeholder="Enter your reason manually"
          value={manualReason}
          onChange={(event) => onManualReasonChange(event.target.value)}
        />
      ) : null}

      <StatusBanner type={status.type} message={status.message} />

      <div className="account-inline-actions">
        <button className="primary-button" type="button" onClick={onSubmit}>
          Confirm cancellation
        </button>
        <button className="ghost-button" type="button" onClick={onCancel}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CancellationForm;
