import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import AuthField from "../components/AuthField";
import AuthFormCard from "../components/AuthFormCard";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const redirectTo = location.state?.from?.pathname || "/account";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      const user = await login(formData);
      navigate(user.role === "admin" ? "/admin" : redirectTo, { replace: true });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || error.message,
      });
    }
  };

  return (
    <AuthShell
      eyebrow="Account access"
      title="Sign in to your FAISHORA account"
      description="Access your wishlist, cart, checkout history, and customer account details from one secure login."
      asideTitle="Customer account benefits"
      asideList={[
        "Protected cart and wishlist syncing",
        "Saved addresses and order history",
        "Fast checkout across future visits",
      ]}
    >
      <AuthFormCard
        title="Welcome back"
        subtitle="Sign in to continue shopping with FAISHORA."
        status={status}
        onSubmit={handleSubmit}
        submitLabel="Login"
        footerText="Need an account?"
        footerLinkLabel="Register"
        footerLinkTo="/register"
      >
        <AuthField
          type="email"
          name="email"
          placeholder="Email address"
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
        <Link className="auth-inline-link" to="/admin/login">
          Admin login
        </Link>
      </AuthFormCard>
    </AuthShell>
  );
};

export default Login;
