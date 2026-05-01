import React from "react";
import AddressForm from "./AddressForm";
import StatusBanner from "./StatusBanner";

const AddressBookManager = ({
  addresses,
  formData,
  status,
  editingAddressId,
  isDefault,
  onChange,
  onToggleDefault,
  onSubmit,
  onEdit,
  onDelete,
  onSetDefault,
  onCancel,
}) => {
  return (
    <section className="timeline-card account-card">
      <div className="panel-header-row">
        <div>
          <span className="eyebrow">Addresses</span>
          <h2 className="checkout-section-title">Address book</h2>
        </div>
        <span className="category-pill">{addresses.length} saved</span>
      </div>

      <div className="account-address-grid">
        {addresses.map((address) => (
          <article key={address.id} className="saved-address-card saved-address-card-static">
            <div className="saved-address-header">
              <strong>{address.label}</strong>
              {address.isDefault ? <span className="category-pill">Default</span> : null}
            </div>
            <p>{address.fullName}</p>
            <p>{address.phone}</p>
            <p>
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
            </p>
            <p>
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p>{address.country}</p>
            <div className="account-inline-actions">
              {!address.isDefault ? (
                <button className="ghost-button" type="button" onClick={() => onSetDefault(address.id)}>
                  Set default
                </button>
              ) : null}
              <button className="ghost-button" type="button" onClick={() => onEdit(address)}>
                Edit
              </button>
              <button className="ghost-button" type="button" onClick={() => onDelete(address.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="account-address-form-block">
        <AddressForm
          formData={formData}
          onChange={onChange}
          defaultChecked={isDefault}
          onToggleDefault={onToggleDefault}
        />
        <StatusBanner type={status.type} message={status.message} />
        <div className="account-inline-actions">
          <button className="primary-button" type="button" onClick={onSubmit}>
            {editingAddressId ? "Update address" : "Save address"}
          </button>
          {editingAddressId ? (
            <button className="ghost-button" type="button" onClick={onCancel}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default AddressBookManager;
