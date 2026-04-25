import React from "react";
import ProductCard from "./ProductCard";

const ProductCatalog = ({
  searchTerm,
  activeCategory,
  categoryOptions,
  setSearchTerm,
  setActiveCategory,
  status,
  paginatedProducts,
  filteredProducts,
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) => {
  return (
    <section id="catalog" className="container section-space">
      <div className="catalog-toolbar">
        <div>
          <span className="eyebrow">Live catalog</span>
          <h2 className="catalog-title">Category-wise products</h2>
        </div>

        <div className="catalog-controls">
          <input
            type="search"
            className="search-input"
            placeholder="Search by product, category, or detail"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="category-select"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {status.loading ? <p className="state-copy">Loading products...</p> : null}
      {status.error ? <p className="state-copy error-copy">{status.error}</p> : null}

      {!status.loading && !status.error ? (
        <>
          <div className="catalog-summary">
            Showing {paginatedProducts.length} of {filteredProducts.length} matching
            products
          </div>

          <div className="product-grid">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <p className="state-copy">No products match your filters yet.</p>
          ) : null}

          <div className="pagination-row">
            <button
              className="pagination-button"
              type="button"
              onClick={onPrevious}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-status">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-button"
              type="button"
              onClick={onNext}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
};

export default ProductCatalog;
