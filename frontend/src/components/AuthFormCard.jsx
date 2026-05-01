import React from "react";
import { Link } from "react-router-dom";
import StatusBanner from "./StatusBanner";

const AuthFormCard = ({
  title,
  subtitle,
  status,
  onSubmit,
  children,
  submitLabel,
  footerText,
  footerLinkLabel,
  footerLinkTo,
}) => {
  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <form onSubmit={onSubmit} className="auth-form">
        {children}
        <StatusBanner type={status.type} message={status.message} />
        <button className="primary-button w-100" type="submit">
          {submitLabel}
        </button>
      </form>
      {footerText ? (
        <p className="auth-footer-text">
          {footerText} <Link to={footerLinkTo}>{footerLinkLabel}</Link>
        </p>
      ) : null}
    </div>
  );
};

export default AuthFormCard;
