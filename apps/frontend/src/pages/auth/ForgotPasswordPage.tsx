import React, { useState } from "react";
import { Input, Button, Card, Typography, Alert, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
// Assuming an API client setup exists or will be created
// import { apiClient } from '@/lib/api-client';

const { Title } = Typography;

/**
 * Renders the Forgot Password page component using useState.
 * Allows users to enter their email address to receive a password reset link.
 * @returns {JSX.Element} The ForgotPasswordPage component.
 */
const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  /**
   * Handles the form submission for the forgot password request.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!email) {
      message.error("Please input your Email!");
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      message.error("The input is not valid E-mail!");
      setLoading(false);
      return;
    }

    try {
      // Direct fetch call (replace with your actual API client if available)
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      setSuccess(
        result.message ||
          "If an account exists for this email, a password reset link has been sent."
      );
      setEmail("");
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(
        err.message || "Failed to send password reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: "center", marginBottom: "24px" }}>
          Forgot Password
        </Title>
        <p style={{ textAlign: "center", marginBottom: "24px" }}>
          Enter your email address below, and we'll send you a link to reset
          your password.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="forgot_email"
              style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
            >
              Email Address
            </label>
            <Input
              id="forgot_email"
              prefix={<MailOutlined />}
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
                if (success) setSuccess(null);
              }}
              size="large"
              type="email"
            />
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: "16px" }}
            />
          )}

          {success && (
            <Alert
              message={success}
              type="success"
              showIcon
              style={{ marginBottom: "16px" }}
            />
          )}

          <div style={{ marginBottom: "16px" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Send Reset Link
            </Button>
          </div>

          <div style={{ textAlign: "center" }}>
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
