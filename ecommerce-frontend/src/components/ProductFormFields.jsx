import React from "react";
import { categoryGroups } from "../data/catalog";

const categoryOptions = categoryGroups.flatMap((group) =>
  group.items.map((item) => `${group.label} / ${item}`)
);

const ProductFormFields = ({ formData, onChange }) => {
  return (
    <>
      <div className="form-grid">
        <input
          type="text"
          name="name"
          className="form-control form-control-lg"
          placeholder="Product name"
          value={formData.name}
          onChange={onChange}
          required
        />
        <input
          type="number"
          name="price"
          className="form-control form-control-lg"
          placeholder="Price"
          value={formData.price}
          onChange={onChange}
          required
        />
        <input
          type="text"
          name="image"
          className="form-control form-control-lg"
          placeholder="Image URL or /product-images/... path"
          value={formData.image}
          onChange={onChange}
        />
        <select
          name="category"
          className="form-control form-control-lg"
          value={formData.category}
          onChange={onChange}
          required
        >
          <option value="">Select category</option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <textarea
        name="description"
        className="form-control form-control-lg form-textarea"
        placeholder="Short product description"
        value={formData.description}
        onChange={onChange}
      />
    </>
  );
};

export default ProductFormFields;
