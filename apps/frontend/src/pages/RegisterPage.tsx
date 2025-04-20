import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button, Alert, Typography, Card } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { UserData } from "@/contexts/AuthContext"; // Import placeholder type

const { Title } = Typography;

// Define type for form values, including confirmPassword
interface RegisterFormData extends UserData {
  confirmPassword: string;
}

/**
 * RegisterPage component providing a form for new user registration.
 * Uses Ant Design components and useState for form management.
 * @returns {JSX.Element} The rendered registration page.
 */
const RegisterPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { register } = useAuth((state) => ({ register: state.register }));
  const authError = useAuth((state) => state.error);
  const { clearError } = useAuth((state) => ({ clearError: state.clearError }));

  const [loading, setLoading] = useState<boolean>(false);
  // Combined local error state for client-side validation or API errors
  const [error, setError] = useState<string | null>(null);
  // State for form data
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Clear errors on mount
  useEffect(() => {
    setError(null);
    if (authError) clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use authError if it appears
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  /**
   * Handles input changes.
   * @param {ChangeEvent<HTMLInputElement>} e The input change event.
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  /**
   * Handles form submission.
   * @param {FormEvent<HTMLFormElement>} e The form submission event.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (authError) clearError();

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    // Add other client-side validations if needed (e.g., username format)

    setLoading(true);

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate("/");
    } catch (err: any) {
      console.error("Registration submission error:", err);
      // Use authError from context if available, otherwise show local generic message
      setError(authError || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md shadow-lg">
        <Title level={2} className="text-center mb-8">
          Register
        </Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => {
              setError(null);
              if (authError) clearError(); // Also clear auth error if closing alert
            }}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              size="large"
            />
          </div>
          <div>
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              size="large"
            />
          </div>
          <div>
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password (min. 8 characters)"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              size="large"
            />
          </div>
          <div>
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              size="large"
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
              Register
            </Button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Login here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
