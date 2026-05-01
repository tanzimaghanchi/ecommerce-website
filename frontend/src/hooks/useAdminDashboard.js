import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";
import { categoryGroups } from "../data/catalog";
import { useAuth } from "../context/AuthContext";

const initialSummary = {
  totalProducts: 0,
  archivedProducts: 0,
  totalOrders: 0,
  totalCustomers: 0,
  totalRevenue: 0,
};

const initialRenameForm = {
  currentName: "",
  nextName: "",
};

export const initialProductForm = {
  name: "",
  price: "",
  image: "",
  category: "",
  description: "",
};

const paginate = (items, page, pageSize) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    currentPage: safePage,
  };
};

const normalizeCategorySet = () =>
  new Set(categoryGroups.flatMap((group) => group.items.map((item) => `${group.label} / ${item}`)));

export const useAdminDashboard = () => {
  const { token } = useAuth();
  const [status, setStatus] = useState({ type: "", message: "" });
  const [summary, setSummary] = useState(initialSummary);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [renameForm, setRenameForm] = useState(initialRenameForm);
  const allowedCategories = useMemo(() => normalizeCategorySet(), []);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchDashboardData = useCallback(async () => {
    try {
      const [summaryResponse, productsResponse, ordersResponse, customersResponse, categoriesResponse] = await Promise.all([
        axios.get(apiUrl("/api/admin/summary"), { headers: authHeaders }),
        axios.get(apiUrl("/api/products")),
        axios.get(apiUrl("/api/admin/orders"), { headers: authHeaders }),
        axios.get(apiUrl("/api/admin/customers"), { headers: authHeaders }),
        axios.get(apiUrl("/api/admin/categories"), { headers: authHeaders }),
      ]);

      setSummary(summaryResponse.data.summary || initialSummary);
      setProducts(productsResponse.data.data || []);
      setOrders(ordersResponse.data.orders || []);
      setCustomers(customersResponse.data.customers || []);
      setCategories(categoriesResponse.data.categories || []);
      setStatus({ type: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to load admin dashboard data.",
      });
    }
  }, [authHeaders]);

  const activeProducts = useMemo(
    () => products.filter((product) => allowedCategories.has(product.category)),
    [allowedCategories, products]
  );

  const archivedProducts = useMemo(
    () => products.filter((product) => !allowedCategories.has(product.category)),
    [allowedCategories, products]
  );

  const dashboardSummary = useMemo(
    () => ({
      ...summary,
      totalProducts: activeProducts.length,
      archivedProducts: archivedProducts.length,
    }),
    [summary, activeProducts.length, archivedProducts.length]
  );

  const activeCategories = useMemo(
    () => categories.filter((category) => allowedCategories.has(category.name)),
    [allowedCategories, categories]
  );

  const saveProduct = async (formData, editingId) => {
    setStatus({ type: "", message: "" });

    try {
      if (editingId) {
        await axios.put(apiUrl(`/api/products/${editingId}`), formData, {
          headers: authHeaders,
        });
        setStatus({ type: "success", message: "Product updated successfully." });
      } else {
        await axios.post(apiUrl("/api/products"), formData, {
          headers: authHeaders,
        });
        setStatus({ type: "success", message: "Product added successfully to your FAISHORA catalog." });
      }

      await fetchDashboardData();
      return true;
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to save product right now.",
      });
      return false;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(apiUrl(`/api/products/${productId}`), {
        headers: authHeaders,
      });
      setStatus({ type: "success", message: "Product deleted successfully." });
      await fetchDashboardData();
      return true;
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to delete product right now.",
      });
      return false;
    }
  };

  const updateOrderStatus = async (orderId, nextStatus) => {
    try {
      await axios.patch(
        apiUrl(`/api/admin/orders/${orderId}/status`),
        { status: nextStatus },
        { headers: authHeaders }
      );
      setStatus({ type: "success", message: `Order #${orderId} updated to ${nextStatus}.` });
      await fetchDashboardData();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to update order status.",
      });
    }
  };

  const renameCategory = async () => {
    try {
      const response = await axios.patch(apiUrl("/api/admin/categories"), renameForm, {
        headers: authHeaders,
      });
      setStatus({ type: "success", message: response.data.message });
      setRenameForm(initialRenameForm);
      await fetchDashboardData();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to update category right now.",
      });
    }
  };

  return {
    status,
    setStatus,
    summary: dashboardSummary,
    products,
    activeProducts,
    archivedProducts,
    orders,
    customers,
    categories: activeCategories,
    renameForm,
    setRenameForm,
    fetchDashboardData,
    saveProduct,
    deleteProduct,
    updateOrderStatus,
    renameCategory,
    paginate,
    initialRenameForm,
  };
};
