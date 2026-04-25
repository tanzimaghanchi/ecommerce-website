import React from "react";

const SavedAddressList = ({
  addresses,
  selectedAddressId,
  useNewAddress,
  onSelectAddress,
  onChooseNew,
}) => {
  return (
    <section className="timeline-card checkout-section-card">
      <div className="panel-header-row">
        <div>
          <span className="eyebrow">Step 1</span>
          <h2 className="checkout-section-title">Delivery address</h2>
        </div>
        <span className="category-pill">{addresses.length} saved</span>
      </div>

      <div className="saved-address-stack">
        {addresses.map((address) => {
          const isActive = Number(selectedAddressId) === Number(address.id) && !useNewAddress;

          return (
            <button
              key={address.id}
              className={`saved-address-card ${isActive ? "saved-address-card-active" : ""}`}
              type="button"
              onClick={() => onSelectAddress(address.id)}
            >
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
            </button>
          );
        })}

        <button
          className={`saved-address-card ${useNewAddress ? "saved-address-card-active" : ""}`}
          type="button"
          onClick={onChooseNew}
        >
          <div className="saved-address-header">
            <strong>Use a new address</strong>
          </div>
          <p>Add a fresh shipping destination for this FAISHORA order.</p>
        </button>
      </div>
    </section>
  );
};

export default SavedAddressList;
