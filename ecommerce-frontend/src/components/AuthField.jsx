import React from "react";

const AuthField = ({ as = "input", className = "", ...props }) => {
  if (as === "textarea") {
    return <textarea className={`form-control auth-input ${className}`.trim()} {...props} />;
  }

  return <input className={`form-control auth-input ${className}`.trim()} {...props} />;
};

export default AuthField;
