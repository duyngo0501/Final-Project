import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button, Alert, Typography, Card } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { Credentials } from "@/contexts/AuthContext";

const { Title, Text } = Typography;

/**
 * LoginPage component providing a form for user login.
 * Uses Ant Design components for UI and useState for form management.
 * @returns {JSX.Element} The rendered login page.
 */
const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { login } = useAuth((state) => ({ login: state.login }));
  const authError = useAuth((state) => state.error);
  const { clearError } = useAuth((state) => ({ clearError: state.clearError }));

  const [loading, setLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Credentials>({
    email: "",
    password: "",
  });

  useEffect(() => {
    setLocalError(null);
    if (authError) clearError();
  }, []);

  useEffect(() => {
    if (authError) {
      setLocalError(null);
    }
  }, [authError]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    if (authError) clearError();
    setLoading(true);

    try {
      await login(formData);
      navigate("/");
    } catch (err: any) {
      console.error("Login submission error:", err);
      setLocalError(
        authError || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md shadow-lg">
        <Title level={2} className="text-center mb-8">
          Login
        </Title>

        {(localError || authError) && (
          <Alert
            message={localError || authError}
            type="error"
            showIcon
            closable
            onClose={() => {
              setLocalError(null);
              if (authError) clearError();
            }}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Email"
              size="large"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              size="large"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={loading}
              size="large"
            >
              Log in
            </Button>
          </div>
        </form>

        <div className="text-center mt-6">
          <Text className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-800">
              Register here
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
