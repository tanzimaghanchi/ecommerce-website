import React from "react";
import ProductFormFields from "./ProductFormFields";
import StatusBanner from "./StatusBanner";

const ProductForm = ({
  formData,
  status,
  onChange,
  onSubmit,
  submitLabel = "Save Product",
  auxiliaryAction = null,
}) => {
  return (
    <div className="admin-card">
      <form onSubmit={onSubmit}>
        <ProductFormFields formData={formData} onChange={onChange} />
        <StatusBanner type={status.type} message={status.message} />
        <div className="admin-form-actions">
          <button className="primary-button w-100" type="submit">
            {submitLabel}
          </button>
          {auxiliaryAction}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
