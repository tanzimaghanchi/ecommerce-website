import React from "react";
import { NavLink } from "react-router-dom";
import AdminIntro from "./AdminIntro";
import AdminStatCards from "./AdminStatCards";

const adminLinks = [
  { to: "/admin/products/new", label: "Save Product" },
  { to: "/admin/catalog", label: "Catalog Manager" },
  { to: "/admin/archived", label: "Archived Products" },
  { to: "/admin/categories/manage", label: "Category Manager" },
  { to: "/admin/customers", label: "Customer Manager" },
  { to: "/admin/orders/manage", label: "Order Manager" },
];

const AdminShell = ({ title, description, summary, children, actions = null }) => {
  return (
    <div className="page-shell">
      <section className="container section-space">
        <div className="admin-workspace">
          <aside className="timeline-card admin-sidebar-panel">
            <AdminIntro />
            <nav className="admin-side-nav">
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    isActive ? "admin-side-link admin-side-link-active" : "admin-side-link"
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="admin-content-panel">
            <div className="admin-page-banner timeline-card">
              <div>
                <span className="eyebrow">Admin workspace</span>
                <h1>{title}</h1>
                <p className="state-copy">{description}</p>
              </div>
              {actions ? <div className="admin-banner-actions">{actions}</div> : null}
            </div>

            <AdminStatCards summary={summary} />
            {children}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminShell;
