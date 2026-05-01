import React from "react";

const AddressForm = ({
  formData,
  onChange,
  saveForFuture,
  onToggleSave,
  defaultChecked = false,
  onToggleDefault = null,
}) => {
  return (
    <section className="timeline-card checkout-section-card">
      <div className="panel-header-row">
        <div>
          <span className="eyebrow">Step 2</span>
          <h2 className="checkout-section-title">New shipping address</h2>
        </div>
      </div>

      <div className="checkout-address-grid">
        <input
          className="form-control"
          name="label"
          placeholder="Label (Home, Office)"
          value={formData.label}
          onChange={onChange}
        />
        <input
          className="form-control"
          name="fullName"
          placeholder="Full name"
          value={formData.fullName}
          onChange={onChange}
        />
        <input
          className="form-control"
          name="phone"
          placeholder="Phone number"
          value={formData.phone}
          onChange={onChange}
        />
        <input
          className="form-control"
          name="postalCode"
          placeholder="Postal code"
          value={formData.postalCode}
          onChange={onChange}
        />
        <input
          className="form-control checkout-grid-span-2"
          name="line1"
          placeholder="House no, street, area"
          value={formData.line1}
          onChange={onChange}
        />
        <input
          className="form-control checkout-grid-span-2"
          name="line2"
          placeholder="Landmark or apartment (optional)"
          value={formData.line2}
          onChange={onChange}
        />
        <input
          className="form-control"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={onChange}
        />
        <input
          className="form-control"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={onChange}
        />
        <input
          className="form-control checkout-grid-span-2"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={onChange}
        />
      </div>

      {onToggleSave ? (
        <label className="checkout-checkbox-row">
          <input type="checkbox" checked={saveForFuture} onChange={onToggleSave} />
          <span>Save this address for future orders</span>
        </label>
      ) : null}

      {onToggleDefault ? (
        <label className="checkout-checkbox-row">
          <input type="checkbox" checked={defaultChecked} onChange={onToggleDefault} />
          <span>Set as default address</span>
        </label>
      ) : null}
    </section>
  );
};

export default AddressForm;
