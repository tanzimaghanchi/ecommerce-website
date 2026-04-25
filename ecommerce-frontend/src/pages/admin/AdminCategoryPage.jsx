import React, { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import AdminPagination from "../../components/AdminPagination";
import AdminCategoryManager from "../../components/AdminCategoryManager";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

const PAGE_SIZE = 8;

const AdminCategoryPage = () => {
  const [page, setPage] = useState(1);
  const {
    summary,
    categories,
    renameForm,
    setRenameForm,
    fetchDashboardData,
    renameCategory,
    paginate,
  } = useAdminDashboard();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const paginated = useMemo(
    () => paginate(categories, page, PAGE_SIZE),
    [categories, page, paginate]
  );

  useEffect(() => {
    if (paginated.currentPage !== page) {
      setPage(paginated.currentPage);
    }
  }, [page, paginated.currentPage]);

  return (
    <AdminShell
      title="Category Manager"
      description="Review category coverage and rename storefront categories from a focused management page."
      summary={summary}
    >
      <AdminCategoryManager
        categories={paginated.items}
        renameForm={renameForm}
        onSelectCategory={(name) =>
          setRenameForm({
            currentName: name,
            nextName: name,
          })
        }
        onRenameChange={(event) =>
          setRenameForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
          }))
        }
        onRenameSubmit={renameCategory}
      />

      <AdminPagination
        currentPage={paginated.currentPage}
        totalPages={paginated.totalPages}
        totalItems={categories.length}
        pageSize={PAGE_SIZE}
        label="categories"
        onPageChange={setPage}
      />
    </AdminShell>
  );
};

export default AdminCategoryPage;
