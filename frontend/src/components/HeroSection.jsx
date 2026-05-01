import React from "react";

const scrollToSection = (sectionId) => {
  const target = document.getElementById(sectionId);

  if (!target) {
    return;
  }

  const topbar = document.querySelector(".topbar");
  const headerOffset = topbar ? topbar.offsetHeight + 16 : 16;
  const elementPosition = target.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: Math.max(elementPosition - headerOffset, 0),
    behavior: "smooth",
  });
};

const HeroSection = ({ productCount, categoryCount }) => {
  return (
    <section className="hero-section hero-section-premium hero-section-storefront">
      <div className="container hero-premium-layout hero-premium-layout-aside hero-premium-layout-storefront">
        <div className="hero-top-row hero-top-row-stats hero-top-row-storefront">
          <div className="hero-premium-copy hero-premium-copy-left hero-premium-copy-compact hero-premium-copy-storefront">
            <span className="eyebrow">FAISHORA edit</span>
            <h1 className="hero-title hero-title-premium hero-title-left hero-title-storefront">
              Premium fashion collections for everyday wear and special moments.
            </h1>
            <p className="hero-copy hero-copy-premium hero-copy-left hero-copy-storefront">
              Discover western and traditional styles for mens, womens, and kids with a storefront designed to feel clear, modern, and easy to shop.
            </p>
            <div className="hero-actions hero-actions-premium hero-actions-left hero-actions-storefront">
              <button className="primary-button" type="button" onClick={() => scrollToSection("catalog")}>
                Shop Now
              </button>
              <button className="secondary-button" type="button" onClick={() => scrollToSection("collections")}>
                Explore Edits
              </button>
            </div>
            <div className="hero-trust-row">
              <span>Curated styles</span>
              <span>Easy browsing</span>
              <span>Fashion-first catalog</span>
            </div>
          </div>

          <div className="hero-stats-band hero-stats-band-aside hero-stats-band-storefront">
            <div className="stat-card hero-stat-card-premium hero-stat-card-storefront">
              <strong>{productCount}+</strong>
              <span>Products in catalog</span>
            </div>
            <div className="stat-card hero-stat-card-premium hero-stat-card-storefront">
              <strong>{categoryCount}</strong>
              <span>Curated departments</span>
            </div>
            <div className="stat-card hero-stat-card-premium hero-stat-card-storefront">
              <strong>24/7</strong>
              <span>Storefront ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
