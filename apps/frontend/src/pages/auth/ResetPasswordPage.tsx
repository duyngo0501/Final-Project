import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, Spin, Alert } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; // Assuming React Router for navigation
// Assuming Supabase JS client is configured and exported
// import { supabase } from '@/lib/supabaseClient';

const { Title } = Typography;

/**
 * Renders the Reset Password page component.
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
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    // Placeholder for Supabase JS client initialization if not global
    const supabase = (window as any).supabase; // Replace with actual import: import { supabase } from '@/lib/supabaseClient';

    if (!supabase) {
      console.error("Supabase client is not available.");
      setError("Configuration error. Please contact support.");
      setIsSupabaseSessionChecked(true);
      return;
    }

    // Supabase JS client automatically handles the #access_token fragment
    // and updates the session when the page loads after redirect.
    // We listen for the SIGNED_IN event or PASSWORD_RECOVERY event.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        console.log("Supabase auth event:", event, session);
        if (event === "PASSWORD_RECOVERY") {
          // This event confirms the user clicked the recovery link
          // The session should now contain the necessary access token to update the password
          console.log("Password recovery flow initiated.");
          // Session might be automatically set, or you might need to use setSession here
        }

        if (session?.access_token) {
          setAccessToken(session.access_token);
        } else {
          // If no session after potential recovery, maybe token expired/invalid
          // setError("Invalid or expired password reset link."); // Might cause issues if initial state is null
        }
        setIsSupabaseSessionChecked(true); // Mark check as complete
      }
    );

    // Initial check in case the event listener fires late or was missed
    const checkInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data?.session?.access_token) {
          setAccessToken(data.session.access_token);
        }
      } catch (err) {
        console.error("Error checking initial Supabase session:", err);
      } finally {
        if (!isSupabaseSessionChecked) {
          setIsSupabaseSessionChecked(true); // Mark check complete even on error
        }
      }
    };
    checkInitialSession();

    return () => {
      // Cleanup the listener when the component unmounts
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [isSupabaseSessionChecked]); // Rerun if session check state changes (though usually only runs once)

  /**
   * Handles the form submission for resetting the password.
   * @param {Record<string, any>} values - The form values containing the new password.
   */
  const handleResetPasswordSubmit = async (values: Record<string, any>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!accessToken) {
      setError(
        "Authentication token not found. Please ensure you followed the reset link correctly or try requesting a reset again."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/reset-password",
        {
          // Assuming Flask runs on port 5000
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Send the token obtained via Supabase callback
          },
          body: JSON.stringify({ new_password: values.password }), // Send the new password
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Use error message from backend if available
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      setSuccess(
        result.message ||
          "Your password has been reset successfully! You can now log in."
      );
      form.resetFields();

      // Optional: Redirect to login after a short delay
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
        <Form
          form={form}
          name="reset_password"
          onFinish={handleResetPasswordSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: "Please input your new password!" },
              {
                min: 6,
                message: "Password must be at least 6 characters long",
              }, // Example rule
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm New Password"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your new password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "The two passwords that you entered do not match!"
                    )
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm New Password"
            />
          </Form.Item>

          {error && (
            <Form.Item>
              <Alert message={error} type="error" showIcon />
            </Form.Item>
          )}

          {success && (
            <Form.Item>
              <Alert message={success} type="success" showIcon />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              disabled={!accessToken || !!success}
            >
              Reset Password
            </Button>
          </Form.Item>

          {success && (
            <Form.Item style={{ textAlign: "center" }}>
              <a href="/login">Proceed to Login</a>
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
