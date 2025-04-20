import React, { useState, useEffect } from "react";
import { Input, Button, Card, Typography, Spin, Alert, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

/**
 * Renders the Reset Password page component using useState.
 * Allows users to set a new password after clicking the reset link.
 * Handles Supabase auth callback implicitly.
 * @returns {JSX.Element} The ResetPasswordPage component.
 */
const ResetPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSupabaseSessionChecked, setIsSupabaseSessionChecked] =
    useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  // State for form fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const supabase = (window as any).supabase; // Replace with actual import
    if (!supabase) {
      console.error("Supabase client is not available.");
      setError("Configuration error. Please contact support.");
      setIsSupabaseSessionChecked(true);
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        console.log("Supabase auth event:", event, session);
        if (event === "PASSWORD_RECOVERY") {
          console.log("Password recovery flow initiated.");
        }
        if (session?.access_token) {
          setAccessToken(session.access_token);
        } else {
          // setError("Invalid or expired password reset link."); // Avoid setting error prematurely
        }
        setIsSupabaseSessionChecked(true);
      }
    );

    const checkInitialSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (data?.session?.access_token) {
          setAccessToken(data.session.access_token);
        }
      } catch (err) {
        console.error("Error checking initial Supabase session:", err);
      } finally {
        if (!isSupabaseSessionChecked) {
          setIsSupabaseSessionChecked(true);
        }
      }
    };
    checkInitialSession();

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [isSupabaseSessionChecked]);

  /**
   * Handles the form submission for resetting the password.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!password) {
      message.error("Please input your new password!");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      // Example minimum length check
      message.error("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      message.error("The two passwords that you entered do not match!");
      setLoading(false);
      return;
    }

    if (!accessToken) {
      setError(
        "Authentication token not found. Please ensure you followed the reset link correctly or try requesting a reset again."
      );
      setLoading(false);
      return;
    }

    try {
      // Direct fetch call (replace with your actual API client if available)
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/reset-password", // Ensure URL is correct
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ new_password: password }), // Send password from state
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
          "Your password has been reset successfully! You can now log in."
      );
      setPassword(""); // Clear fields on success
      setConfirmPassword("");

      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(
        err.message ||
          "Failed to reset password. The link may have expired or been used already."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseSessionChecked) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Spin size="large" tip="Verifying reset link..." />
      </div>
    );
  }

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
          Reset Your Password
        </Title>
        <p style={{ textAlign: "center", marginBottom: "24px" }}>
          Please enter your new password below.
        </p>
        {/* Use standard form element */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="reset_password"
              style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
            >
              New Password
            </label>
            <Input.Password
              id="reset_password"
              prefix={<LockOutlined />}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="large"
              autoComplete="new-password"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="reset_confirm"
              style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
            >
              Confirm New Password
            </label>
            <Input.Password
              id="reset_confirm"
              prefix={<LockOutlined />}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              size="large"
              autoComplete="new-password"
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
              disabled={!accessToken || !!success} // Disable if no token or already success
            >
              Reset Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
