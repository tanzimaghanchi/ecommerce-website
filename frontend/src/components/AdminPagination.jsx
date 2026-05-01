import React from "react";

const AdminPagination = ({ currentPage, totalPages, totalItems, pageSize, label, onPageChange }) => {
  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, currentPage + 1);

  for (let page = startPage; page <= endPage; page += 1) {
    pageNumbers.push(page);
  }

  const firstItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const lastItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <div className="admin-pagination-row">
      <div className="admin-pagination-copy">
        <strong>{totalItems}</strong>
        <span>
          {label} . Showing {firstItem}-{lastItem}
        </span>
      </div>

      <div className="admin-pagination-controls">
        <button
          className="pagination-button"
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>

        <div className="admin-pagination-pages">
          {pageNumbers.map((page) => (
            <button
              key={page}
              className={page === currentPage ? "admin-page-chip admin-page-chip-active" : "admin-page-chip"}
              type="button"
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          className="pagination-button"
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminPagination;
