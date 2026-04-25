import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "../../components/AdminShell";
import AdminPagination from "../../components/AdminPagination";
import { formatCurrency } from "../../utils/formatters";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

const PAGE_SIZE = 10;

const AdminCatalogPage = () => {
  const [page, setPage] = useState(1);
  const { status, summary, activeProducts, fetchDashboardData, deleteProduct, paginate } = useAdminDashboard();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const paginated = useMemo(
    () => paginate(activeProducts, page, PAGE_SIZE),
    [activeProducts, page, paginate]
  );

  useEffect(() => {
    if (paginated.currentPage !== page) {
      setPage(paginated.currentPage);
    }
  }, [page, paginated.currentPage]);

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product from the catalog?")) {
      return;
    }

    await deleteProduct(productId);
  };

  return (
    <AdminShell
      title="Catalog Manager"
      description="Manage the live catalog in a dedicated table with cleaner actions, shorter scans, and readable pagination."
      summary={summary}
      actions={
        <Link className="primary-button" to="/admin/products/new">
          Add product
        </Link>
      }
    >
      <div className="timeline-card admin-route-card">
        <div className="panel-header-row">
          <h2>Live products</h2>
          <span className="category-pill">{activeProducts.length} products</span>
        </div>

        {status.type === "error" ? <p className="error-copy">{status.message}</p> : null}

        <div className="admin-table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.items.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>{product.category}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.description}</td>
                  <td>
                    <div className="admin-inline-actions admin-table-actions">
                      <Link className="ghost-button admin-table-button" to={`/admin/products/new?edit=${product.id}`}>
                        Edit
                      </Link>
                      <button className="ghost-button admin-table-button" type="button" onClick={() => handleDelete(product.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AdminPagination
          currentPage={paginated.currentPage}
          totalPages={paginated.totalPages}
          totalItems={activeProducts.length}
          pageSize={PAGE_SIZE}
          label="catalog items"
          onPageChange={setPage}
        />
      </div>
    </AdminShell>
  );
};

export default AdminCatalogPage;
