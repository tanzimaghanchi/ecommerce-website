import React, { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import AdminPagination from "../../components/AdminPagination";
import { formatCurrency } from "../../utils/formatters";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

const PAGE_SIZE = 10;

const AdminArchivedProductsPage = () => {
  const [page, setPage] = useState(1);
  const { summary, archivedProducts, fetchDashboardData, paginate } = useAdminDashboard();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const paginated = useMemo(
    () => paginate(archivedProducts, page, PAGE_SIZE),
    [archivedProducts, page, paginate]
  );

  useEffect(() => {
    if (paginated.currentPage !== page) {
      setPage(paginated.currentPage);
    }
  }, [page, paginated.currentPage]);

  return (
    <AdminShell
      title="Archived Products"
      description="Keep legacy catalog records out of the way in their own page, while still preserving their history for old orders."
      summary={summary}
    >
      <div className="timeline-card admin-route-card archived-panel-card">
        <div className="panel-header-row">
          <h2>Archived legacy products</h2>
          <span className="category-pill">{archivedProducts.length} archived</span>
        </div>
        <p className="state-copy">
          These products remain in the database because historic orders still point to them.
        </p>

        <div className="admin-table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.items.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>
                    <span className="category-pill">Archived</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AdminPagination
          currentPage={paginated.currentPage}
          totalPages={paginated.totalPages}
          totalItems={archivedProducts.length}
          pageSize={PAGE_SIZE}
          label="archived products"
          onPageChange={setPage}
        />
      </div>
    </AdminShell>
  );
};

export default AdminArchivedProductsPage;
