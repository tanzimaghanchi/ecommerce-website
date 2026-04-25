import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import AuthField from "../components/AuthField";
import AuthFormCard from "../components/AuthFormCard";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      const user = await login(formData);
      if (user.role !== "admin") {
        setStatus({ type: "error", message: "This account does not have admin access." });
        return;
      }
      navigate("/admin", { replace: true });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || error.message,
      });
    }
  };

  return (
    <AuthShell
      eyebrow="Admin access"
      title="Sign in to the FAISHORA admin dashboard"
      description="Use your administrator account to manage products, customers, and orders in a protected workspace."
      asideTitle="Admin responsibilities"
      asideList={[
        "Manage products and category inventory",
        "Track orders and fulfillment status",
        "Review store activity from one dashboard",
      ]}
    >
      <AuthFormCard
        title="Admin login"
        subtitle="Only approved admin accounts can access this area."
        status={status}
        onSubmit={handleSubmit}
        submitLabel="Access dashboard"
        footerText="Need a customer account?"
        footerLinkLabel="Go to login"
        footerLinkTo="/login"
      >
        <AuthField
          type="email"
          name="email"
          placeholder="Admin email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <AuthField
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Link className="auth-inline-link" to="/forgot-password">
          Forgot password?
        </Link>
      </AuthFormCard>
    </AuthShell>
  );
};

export default AdminLogin;
