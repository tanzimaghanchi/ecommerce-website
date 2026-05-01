import React from "react";
import HeroCarousel from "./HeroCarousel";
import { heroSlides } from "../data/catalog";

const StorefrontCarouselSection = () => {
  return (
    <section className="container section-space section-space-tight storefront-carousel-section">
      <div className="section-heading section-heading-refined storefront-carousel-heading">
        <span className="eyebrow">Featured campaigns</span>
        <h2>Discover collections customers want to open first</h2>
        <p>
          Browse visual campaigns designed to pull shoppers into the right collection,
          increase curiosity, and make buying feel easier from the first click.
        </p>
      </div>
      <HeroCarousel slides={heroSlides} />
    </section>
  );
};

export default StorefrontCarouselSection;
