import React, { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import AdminPagination from "../../components/AdminPagination";
import AdminCustomerManager from "../../components/AdminCustomerManager";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

const PAGE_SIZE = 8;

const AdminCustomerPage = () => {
  const [page, setPage] = useState(1);
  const { summary, customers, fetchDashboardData, paginate } = useAdminDashboard();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const paginated = useMemo(
    () => paginate(customers, page, PAGE_SIZE),
    [customers, page, paginate]
  );

  useEffect(() => {
    if (paginated.currentPage !== page) {
      setPage(paginated.currentPage);
    }
  }, [page, paginated.currentPage]);

  return (
    <AdminShell
      title="Customer Manager"
      description="See your customer list in a dedicated page with a cleaner table and less dashboard clutter."
      summary={summary}
    >
      <AdminCustomerManager customers={paginated.items} />
      <AdminPagination
        currentPage={paginated.currentPage}
        totalPages={paginated.totalPages}
        totalItems={customers.length}
        pageSize={PAGE_SIZE}
        label="customers"
        onPageChange={setPage}
      />
    </AdminShell>
  );
};

export default AdminCustomerPage;
