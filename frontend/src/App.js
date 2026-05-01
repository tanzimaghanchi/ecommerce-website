import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import AddProduct from "./pages/AddProduct";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Account from "./pages/Account";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminCatalogPage from "./pages/admin/AdminCatalogPage";
import AdminArchivedProductsPage from "./pages/admin/AdminArchivedProductsPage";
import AdminCategoryPage from "./pages/admin/AdminCategoryPage";
import AdminCustomerPage from "./pages/admin/AdminCustomerPage";
import AdminOrderPage from "./pages/admin/AdminOrderPage";

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Products />} />
              <Route path="/products/:productId" element={<ProductDetails />} />
              <Route path="/categories" element={<Categories />} />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Navigate to="/admin/catalog" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products/new"
                element={
                  <ProtectedRoute requireAdmin>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/catalog"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminCatalogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/archived"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminArchivedProductsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories/manage"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminCategoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminCustomerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders/manage"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminOrderPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/add" element={<Navigate to="/admin/products/new" replace />} />
            </Routes>
            <Footer />
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
