import React from "react";
import { Link } from "react-router-dom";

const CategoryHighlights = ({ groups }) => {
  return (
    <section className="container section-space section-space-tight">
      <div className="section-heading section-heading-refined">
        <span className="eyebrow">Department map</span>
        <h2>Shop by category</h2>
        <p>
          Move through the catalog by department and discover focused edits without
          unnecessary clutter.
        </p>
      </div>
      <div className="chip-list chip-list-refined">
        {groups.map((group) => (
          <Link
            key={group.id}
            className="chip chip-link chip-refined"
            to={`/?category=${encodeURIComponent(group.label)}#catalog`}
          >
            <span>{group.label}</span>
            <small>{group.items.slice(0, 2).join(" • ")}</small>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryHighlights;
