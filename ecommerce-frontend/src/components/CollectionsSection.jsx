import React from "react";
import { Link } from "react-router-dom";
import { resolveMediaUrl } from "../utils/media";

const CollectionsSection = ({ collections }) => {
  return (
    <section id="collections" className="container section-space section-space-tight">
      <div className="section-heading section-heading-refined">
        <span className="eyebrow">Curated edits</span>
        <h2>Collections crafted for every moment</h2>
        <p>
          Explore campaign-led selections for everyday dressing, festive occasions,
          and standout seasonal drops.
        </p>
      </div>
      <div className="collection-grid collection-grid-refined">
        {collections.map((collection, index) => (
          <article key={collection.title} className="collection-card collection-card-refined collection-card-visual">
            <img
              className="collection-card-image"
              src={resolveMediaUrl(collection.image)}
              alt={collection.title}
            />
            <div className="collection-card-overlay" />
            <div className="collection-card-top collection-card-top-visual">
              <span className="collection-kicker collection-kicker-light">Editor&apos;s pick</span>
              <strong className="collection-index collection-index-light">0{index + 1}</strong>
            </div>
            <div className="collection-card-body">
              <h3>{collection.title}</h3>
              <p>{collection.subtitle}</p>
              <Link className="collection-card-link" to={collection.href}>
                Shop now
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CollectionsSection;
