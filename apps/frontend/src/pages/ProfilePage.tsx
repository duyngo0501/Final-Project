import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/contexts/AuthContext"; // Import User type
import { Card, Descriptions, Button, Typography, Divider, Result } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const { Title, Text } = Typography;

/**
 * ProfilePage component displaying the logged-in user's information.
 * Uses Ant Design components for layout.
 * @returns {JSX.Element} The rendered profile page.
 */
const ProfilePage = (): JSX.Element => {
  const navigate = useNavigate();
  const user = useAuth((state) => state.user);
  const { logout } = useAuth((state) => ({ logout: state.logout }));

  // Handle potential case where user data is not yet loaded or unavailable
  // Although PrivateRoute should prevent access if not authenticated,
  // the user object might be null briefly during initial load/context update.
  if (!user) {
    // Optional: Show a loading state or redirect
    return (
      <Result
        status="warning"
        title="User data not available."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Go Home
          </Button>
        }
      />
    );
    // Or return <Spin />;
  }

  const handleLogout = () => {
    logout();
    // Optionally navigate after logout, e.g., to home or login
    // navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Title level={2} className="mb-8 text-center">
        My Profile
      </Title>

      <Card>
        <Descriptions
          title="Account Information"
          bordered
          column={{ xs: 1, sm: 1, md: 2 }}
        >
          <Descriptions.Item label="Username">
            <Text strong>{user.username}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Role">
            <Text style={{ textTransform: "capitalize" }}>{user.role}</Text>
          </Descriptions.Item>
          {/* Assuming created_at is available and is a string/number parsable by Date */}
          {user.created_at && (
            <Descriptions.Item label="Member Since">
              {new Date(user.created_at).toLocaleDateString()}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider />

        <div className="flex justify-end">
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            size="large"
          >
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
