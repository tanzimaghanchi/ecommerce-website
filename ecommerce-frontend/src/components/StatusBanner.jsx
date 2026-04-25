import React from "react";

const StatusBanner = ({ type, message }) => {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`status-banner ${
        type === "success" ? "status-success" : "status-error"
      }`}
    >
      {message}
    </div>
  );
};

export default StatusBanner;
