import React from "react";
import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Credentials } from "@/contexts/AuthContext"; // Import Credentials type

const { Title } = Typography;

/**
 * @description Login page component with email and password form.
 * Uses AuthContext to handle login logic.
 * @returns {React.FC} The LoginPage component.
 */
const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  // Select necessary state/functions from AuthContext
  const login = useAuth((state) => state.login);
  const isLoading = useAuth((state) => state.loading);
  const error = useAuth((state) => state.error);
  const clearError = useAuth((state) => state.clearError);

  const onFinish = async (values: Credentials) => {
    clearError(); // Clear previous errors
    try {
      await login(values);
      navigate("/"); // Redirect to home on successful login
      // Optionally show success message
    } catch (err) {
      // Error is already set in AuthContext state by the login function
      console.error("Login failed on page:", err);
      // No need to set local error state, just rely on context error
    }
  };

  // Clear error when component unmounts or form changes
  React.useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 150px)",
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: "center" }}>
          Login
        </Title>
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: 20 }}
          />
        )}
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          initialValues={{ remember: true }}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your Email!",
                type: "email",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          {/* Add Remember me or Forgot password if needed */}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              Log in
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            Or <Link to="/register">register now!</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
