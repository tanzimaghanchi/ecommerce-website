import React, { useState } from "react";
import AuthShell from "../components/AuthShell";
import AuthField from "../components/AuthField";
import AuthFormCard from "../components/AuthFormCard";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const { requestPasswordReset } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    securityAnswer: "",
    newPassword: "",
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
      await requestPasswordReset(formData);
      setStatus({
        type: "success",
        message: "Password updated. You can now log in with your new password.",
      });
      setFormData({
        email: "",
        securityAnswer: "",
        newPassword: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || error.message,
      });
    }
  };

  return (
    <AuthShell
      eyebrow="Recovery"
      title="Reset password with your security answer"
      description="This starter flow now talks to your backend API and gives you a clean bridge to future email OTP or reset-link features."
      asideTitle="Future production upgrade"
      asideList={[
        "Replace this starter flow with server-side reset tokens",
        "Send recovery links over email or SMS",
        "Add rate limiting and audit logs for safety",
      ]}
    >
      <AuthFormCard
        title="Recover account"
        subtitle="Answer your security question and choose a new password."
        status={status}
        onSubmit={handleSubmit}
        submitLabel="Reset Password"
        footerText="Remembered your password?"
        footerLinkLabel="Login"
        footerLinkTo="/login"
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
          type="text"
          name="securityAnswer"
          placeholder="Security answer"
          value={formData.securityAnswer}
          onChange={handleChange}
          required
        />
        <AuthField
          type="password"
          name="newPassword"
          placeholder="New password"
          value={formData.newPassword}
          onChange={handleChange}
          required
        />
      </AuthFormCard>
    </AuthShell>
  );
};

export default ForgotPassword;
