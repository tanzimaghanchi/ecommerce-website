import React from "react";
import StatusBanner from "./StatusBanner";

const ProfileSummaryCard = ({ name, email, status, onChange, onSubmit }) => {
  return (
    <section className="timeline-card account-card">
      <div className="panel-header-row">
        <div>
          <span className="eyebrow">Profile</span>
          <h2 className="checkout-section-title">Your FAISHORA account</h2>
        </div>
      </div>

      <form className="account-form-grid" onSubmit={onSubmit}>
        <input
          className="form-control"
          name="name"
          value={name}
          onChange={onChange}
          placeholder="Your name"
        />
        <input
          className="form-control"
          value={email}
          disabled
          placeholder="Email address"
        />
        <StatusBanner type={status.type} message={status.message} />
        <button className="primary-button account-form-button" type="submit">
          Save profile
        </button>
      </form>
    </section>
  );
};

export default ProfileSummaryCard;
