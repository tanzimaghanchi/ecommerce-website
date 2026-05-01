import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import AuthField from "../components/AuthField";
import AuthFormCard from "../components/AuthFormCard";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    securityQuestion: "What is your favorite color?",
    securityAnswer: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

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
      await register(formData);
      navigate("/account", { replace: true });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || error.message,
      });
    }
  };

  return (
    <AuthShell
      eyebrow="New account"
      title="Create your FAISHORA customer account"
      description="Register to save addresses, manage orders, and keep your shopping activity synced across visits."
      asideTitle="What you get"
      asideList={[
        "Saved cart, wishlist, and order history",
        "Secure password recovery with a security answer",
        "A clean customer flow separate from admin access",
      ]}
    >
      <AuthFormCard
        title="Create account"
        subtitle="Register once, then shop and manage your orders easily."
        status={status}
        onSubmit={handleSubmit}
        submitLabel="Register"
        footerText="Already have an account?"
        footerLinkLabel="Login"
        footerLinkTo="/login"
      >
        <AuthField
          type="text"
          name="name"
          placeholder="Full name"
          value={formData.name}
          onChange={handleChange}
          required
        />
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
        <select
          className="form-control auth-input"
          name="securityQuestion"
          value={formData.securityQuestion}
          onChange={handleChange}
        >
          <option>What is your favorite color?</option>
          <option>What is your first school name?</option>
          <option>What city were you born in?</option>
        </select>
        <AuthField
          type="text"
          name="securityAnswer"
          placeholder="Security answer"
          value={formData.securityAnswer}
          onChange={handleChange}
          required
        />
      </AuthFormCard>
    </AuthShell>
  );
};

export default Register;
