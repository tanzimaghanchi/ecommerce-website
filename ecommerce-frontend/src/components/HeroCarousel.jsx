import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resolveMediaUrl } from "../utils/media";

const AUTO_ADVANCE_MS = 4000;

const HeroCarousel = ({ slides }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!slides.length) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [slides]);

  if (!slides.length) {
    return null;
  }

  const activeSlide = slides[activeIndex];
  const goToSlide = (nextIndex) => {
    const total = slides.length;
    setActiveIndex((nextIndex + total) % total);
  };

  return (
    <div className="hero-carousel hero-carousel-premium storefront-carousel-card">
      <div className="hero-carousel-media-shell hero-carousel-media-shell-premium storefront-carousel-media-shell">
        <img
          className="hero-carousel-image hero-carousel-image-premium storefront-carousel-image"
          src={resolveMediaUrl(activeSlide.image)}
          alt={activeSlide.title}
          style={activeSlide.imagePosition ? { objectPosition: activeSlide.imagePosition } : undefined}
        />

        <div className="hero-carousel-topbar hero-carousel-topbar-premium storefront-carousel-topbar">
          <span className="collection-kicker hero-carousel-kicker">{activeSlide.badge}</span>
          <div className="hero-carousel-arrows">
            <button
              className="hero-carousel-arrow"
              type="button"
              aria-label="Previous slide"
              onClick={() => goToSlide(activeIndex - 1)}
            >
              &#8249;
            </button>
            <button
              className="hero-carousel-arrow"
              type="button"
              aria-label="Next slide"
              onClick={() => goToSlide(activeIndex + 1)}
            >
              &#8250;
            </button>
          </div>
        </div>

        <div className="hero-carousel-overlay hero-carousel-overlay-premium storefront-carousel-overlay">
          <div className="hero-carousel-overlay-copy hero-carousel-overlay-copy-premium storefront-carousel-copy">
            <span className="hero-carousel-spotlight">{activeSlide.spotlight}</span>
            <h2>{activeSlide.title}</h2>
            <p>{activeSlide.copy}</p>
            <div className="hero-carousel-actions">
              <Link className="primary-button" to={activeSlide.href}>
                {activeSlide.actionLabel}
              </Link>
              <Link className="secondary-button" to={activeSlide.secondaryHref}>
                {activeSlide.secondaryLabel}
              </Link>
            </div>
          </div>

          <div className="hero-carousel-bottombar hero-carousel-bottombar-premium storefront-carousel-bottombar">
            <div className="hero-carousel-meta">
              {activeSlide.meta.map((item) => (
                <span key={item} className="hero-carousel-meta-chip">
                  {item}
                </span>
              ))}
            </div>

            <div className="hero-carousel-dots">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  className={index === activeIndex ? "hero-carousel-dot hero-carousel-dot-active" : "hero-carousel-dot"}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
