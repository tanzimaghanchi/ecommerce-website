import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import AdminShell from "../components/AdminShell";
import { formatCurrency } from "../utils/formatters";
import { initialProductForm, useAdminDashboard } from "../hooks/useAdminDashboard";

const AddProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(initialProductForm);
  const [editingId, setEditingId] = useState(null);
  const {
    status,
    summary,
    activeProducts,
    fetchDashboardData,
    saveProduct,
  } = useAdminDashboard();

  const editId = searchParams.get("edit");

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!editId) {
      setEditingId(null);
      setFormData(initialProductForm);
      return;
    }

    const selectedProduct = activeProducts.find((product) => String(product.id) === String(editId));
    if (selectedProduct) {
      setEditingId(selectedProduct.id);
      setFormData({
        name: selectedProduct.name || "",
        price: String(selectedProduct.price || ""),
        image: selectedProduct.image || "",
        category: selectedProduct.category || "",
        description: selectedProduct.description || "",
      });
    }
  }, [activeProducts, editId]);

  const latestProducts = useMemo(() => activeProducts.slice(0, 4), [activeProducts]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialProductForm);
    navigate("/admin/products/new", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const wasSaved = await saveProduct(formData, editingId);

    if (wasSaved) {
      resetForm();
    }
  };

  return (
    <AdminShell
      title={editingId ? "Update Product" : "Save Product"}
      description="Use a focused editor to publish new products or update existing items without scrolling through the full admin dashboard."
      summary={summary}
    >
      <div className="admin-page-grid admin-page-grid-wide">
        <ProductForm
          formData={formData}
          status={status}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={editingId ? "Update Product" : "Save Product"}
          auxiliaryAction={
            editingId ? (
              <button className="ghost-button w-100" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            ) : null
          }
        />

        <div className="timeline-card admin-side-info-card">
          <div className="panel-header-row">
            <h2>Publishing notes</h2>
            <span className="category-pill">{editingId ? "Edit mode" : "New entry"}</span>
          </div>
          <p className="state-copy">
            Keep titles short, choose the exact category, and use a clean image so your storefront cards stay consistent.
          </p>
          <div className="admin-mini-list">
            {latestProducts.map((product) => (
              <article key={product.id} className="admin-mini-list-item">
                <div>
                  <strong>{product.name}</strong>
                  <p className="state-copy">{product.category}</p>
                </div>
                <span>{formatCurrency(product.price)}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

export default AddProduct;
