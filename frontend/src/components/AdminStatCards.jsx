import React from "react";
import { formatCurrency } from "../utils/formatters";

const AdminStatCards = ({ summary }) => {
  const stats = [
    { label: "Live Products", value: summary.totalProducts },
    { label: "Archived", value: summary.archivedProducts },
    { label: "Orders", value: summary.totalOrders },
    { label: "Customers", value: summary.totalCustomers },
    { label: "Revenue", value: formatCurrency(summary.totalRevenue) },
  ];

  return (
    <div className="admin-stats-grid admin-stats-grid-wide">
      {stats.map((stat) => (
        <article key={stat.label} className="stat-card admin-stat-card">
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
        </article>
      ))}
    </div>
  );
};

export default AdminStatCards;
