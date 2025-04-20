import React from "react";
import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserData } from "@/contexts/AuthContext"; // Import UserData type

const { Title } = Typography;

/**
 * @description Registration page component with username, email, and password form.
 * Uses AuthContext to handle registration logic.
 * @returns {React.FC} The RegisterPage component.
 */
const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  // Select necessary state/functions from AuthContext
  const register = useAuth((state) => state.register);
  const isLoading = useAuth((state) => state.loading);
  const error = useAuth((state) => state.error);
  const clearError = useAuth((state) => state.clearError);

  const onFinish = async (values: UserData) => {
    clearError(); // Clear previous errors
    // The UserData type expects username, email, password
    // Form values directly match this structure
    try {
      await register(values);
      navigate("/"); // Redirect to home on successful registration
      // Optionally show success message (e.g., "Registration successful! Please log in.")
      // navigate('/login'); // Or redirect to login page
    } catch (err) {
      // Error is already set in AuthContext state by the register function
      console.error("Registration failed on page:", err);
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
          Register
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
          name="register"
          onFinish={onFinish}
          size="large"
          // Add scroll to first error if needed
          // scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your Username!",
                whitespace: true,
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your Email!" },
              { type: "email", message: "The input is not valid E-mail!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              } /* Add min length rule? */,
            ]}
            hasFeedback // Adds icon feedback for validation status
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password!" },
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
              placeholder="Confirm Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              Register
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
