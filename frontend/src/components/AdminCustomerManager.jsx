import React from "react";
import { formatOrderDate } from "../utils/formatters";

const AdminCustomerManager = ({ customers }) => {
  return (
    <div className="timeline-card admin-panel-card">
      <div className="panel-header-row">
        <h2>Customer manager</h2>
        <span className="category-pill">{customers.length} customers</span>
      </div>

      <div className="admin-table-shell">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Orders</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{formatOrderDate(customer.createdAt)}</td>
                <td>{customer.totalOrders}</td>
                <td>
                  <span className="category-pill">{customer.role}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomerManager;
