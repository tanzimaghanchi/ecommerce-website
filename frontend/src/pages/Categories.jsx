import React from "react";
import { Link } from "react-router-dom";
import { categoryGroups } from "../data/catalog";

const Categories = () => {
  return (
    <div className="page-shell">
      <section className="container section-space">
        <div className="section-heading">
          <span className="eyebrow">Browse departments</span>
          <h1>Category-wise shopping built for easier discovery</h1>
          <p>
            Explore mens, womens, and kids collections split into western and
            traditional styles for cleaner browsing.
          </p>
        </div>

        <div className="category-grid">
          {categoryGroups.map((group) => (
            <article key={group.id} className="category-card">
              <Link
                className="category-pill category-pill-link"
                to={`/?category=${encodeURIComponent(group.label)}#catalog`}
              >
                {group.label}
              </Link>
              <p className="category-blurb">{group.blurb}</p>
              <div className="chip-list">
                {group.items.map((item) => {
                  const categoryValue = `${group.label} / ${item}`;

                  return (
                    <Link
                      key={item}
                      className="chip chip-link"
                      to={`/?category=${encodeURIComponent(categoryValue)}#catalog`}
                    >
                      {item}
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Categories;
