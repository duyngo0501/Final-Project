import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Spin, Alert } from "antd";
import { MailOutlined } from "@ant-design/icons";
// Assuming an API client setup exists or will be created
// import { apiClient } from '@/lib/api-client';

const { Title } = Typography;

/**
 * Renders the Forgot Password page component.
 * Allows users to enter their email address to receive a password reset link.
 * @returns {JSX.Element} The ForgotPasswordPage component.
 */
const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form] = Form.useForm();

  /**
   * Handles the form submission for the forgot password request.
   * @param {{ email: string }} values - The form values containing the user's email.
   */
  const handleForgotPasswordSubmit = async (values: { email: string }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/forgot-password",
        {
          // Assuming Flask runs on port 5000
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: values.email }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      // Assume success for now
      setSuccess(
        result.message ||
          "If an account exists for this email, a password reset link has been sent."
      );
      form.resetFields();
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
        <Form
          form={form}
          name="forgot_password"
          onFinish={handleForgotPasswordSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please input your Email!" },
              { type: "email", message: "The input is not valid E-mail!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
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
            <Button type="primary" htmlType="submit" loading={loading} block>
              Send Reset Link
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <a href="/login">Back to Login</a>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
