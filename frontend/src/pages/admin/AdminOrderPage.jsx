import React, { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import AdminPagination from "../../components/AdminPagination";
import { formatCurrency, formatOrderDate } from "../../utils/formatters";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

const PAGE_SIZE = 8;

const AdminOrderPage = () => {
  const [page, setPage] = useState(1);
  const { summary, orders, fetchDashboardData, updateOrderStatus, paginate } = useAdminDashboard();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const paginated = useMemo(
    () => paginate(orders, page, PAGE_SIZE),
    [orders, page, paginate]
  );

  useEffect(() => {
    if (paginated.currentPage !== page) {
      setPage(paginated.currentPage);
    }
  }, [page, paginated.currentPage]);

  return (
    <AdminShell
      title="Order Manager"
      description="Track customer orders in a cleaner status table with focused pagination and less visual overload."
      summary={summary}
    >
      <div className="timeline-card admin-route-card">
        <div className="panel-header-row">
          <h2>Order manager</h2>
          <span className="category-pill">{orders.length} orders</span>
        </div>

        <div className="admin-table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.items.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>
                    <div className="admin-table-copy">
                      <strong>{order.customer?.name || "Customer"}</strong>
                      <span>{order.customer?.email || "-"}</span>
                    </div>
                  </td>
                  <td>{formatOrderDate(order.createdAt)}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <div className="admin-table-copy">
                      <strong>{order.paymentMethod}</strong>
                      <span>{order.paymentStatus}</span>
                    </div>
                  </td>
                  <td>
                    <select
                      className="category-select admin-status-select"
                      value={order.status}
                      onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                    >
                      <option value="placed">placed</option>
                      <option value="processing">processing</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AdminPagination
          currentPage={paginated.currentPage}
          totalPages={paginated.totalPages}
          totalItems={orders.length}
          pageSize={PAGE_SIZE}
          label="orders"
          onPageChange={setPage}
        />
      </div>
    </AdminShell>
  );
};

export default AdminOrderPage;
