import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import "../App.css";
import { apiUrl } from "../config/api";
import { categoryGroups, curatedCollections } from "../data/catalog";
import HeroSection from "../components/HeroSection";
import StorefrontCarouselSection from "../components/StorefrontCarouselSection";
import CollectionsSection from "../components/CollectionsSection";
import ProductCatalog from "../components/ProductCatalog";

const PRODUCTS_PER_PAGE = 6;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState({
    loading: true,
    error: "",
  });

  const allowedCategories = useMemo(
    () => categoryGroups.flatMap((group) => [group.label, ...group.items.map((item) => `${group.label} / ${item}`)]),
    []
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(apiUrl("/api/products"));
        const fetchedProducts = (res.data.data || []).filter((product) =>
          allowedCategories.includes(product.category) ||
          categoryGroups.some((group) => product.category.startsWith(`${group.label} /`))
        );
        setProducts(fetchedProducts);
        setStatus({ loading: false, error: "" });
      } catch (err) {
        setStatus({
          loading: false,
          error:
            err.response?.data?.message || "Unable to load products right now.",
        });
      }
    };

    fetchProducts();
  }, [allowedCategories]);

  useEffect(() => {
    const nextSearch = searchParams.get("search") || "";
    const nextCategory = searchParams.get("category") || "All";
    setSearchTerm(nextSearch);
    setActiveCategory(nextCategory);
  }, [searchParams]);

  const categoryOptions = useMemo(() => {
    const departmentCategories = categoryGroups.map((group) => group.label);
    const productCategories = products
      .map((product) => product.category)
      .filter(Boolean);

    return ["All", ...new Set([...departmentCategories, ...productCategories])];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All"
          ? true
          : product.category === activeCategory || product.category.startsWith(`${activeCategory} /`);

      const searchTarget = [
        product.name,
        product.category,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchTarget.includes(normalizedSearch);
    });
  }, [activeCategory, products, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [currentPage, filteredProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const updateCatalogParams = (nextCategory, nextSearch) => {
    const params = new URLSearchParams();

    if (nextCategory && nextCategory !== "All") {
      params.set("category", nextCategory);
    }

    if (nextSearch && nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    }

    setSearchParams(params);
  };

  return (
    <div className="page-shell">
      <HeroSection
        productCount={products.length}
        categoryCount={categoryGroups.length}
        featuredGroups={categoryGroups.slice(0, 3)}
      />
      <StorefrontCarouselSection />
      <CollectionsSection collections={curatedCollections} />
      <ProductCatalog
        searchTerm={searchTerm}
        activeCategory={activeCategory}
        categoryOptions={categoryOptions}
        setSearchTerm={(value) => updateCatalogParams(activeCategory, value)}
        setActiveCategory={(value) => updateCatalogParams(value, searchTerm)}
        status={status}
        paginatedProducts={paginatedProducts}
        filteredProducts={filteredProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() =>
          setCurrentPage((page) => Math.min(totalPages, page + 1))
        }
      />
    </div>
  );
};

export default Products;



