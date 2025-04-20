import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/contexts/AuthContext"; // Import User type
import {
  Card,
  Descriptions,
  Button,
  Typography,
  Divider,
  Result,
  Space,
  Spin,
  message, // Import message
} from "antd";
import {
  LogoutOutlined,
  EditOutlined,
  LockOutlined,
  HistoryOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// Import the new components
import EditProfileForm from "@/components/profile/EditProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import OrderHistory from "@/components/profile/OrderHistory";
import UserSettings from "@/components/profile/UserSettings";

const { Title, Text } = Typography;

type ProfileSection =
  | "view"
  | "edit-profile"
  | "change-password"
  | "order-history"
  | "settings";

/**
 * ProfilePage component displaying user info and allowing access to related sections.
 * Manages which section (view, edit, password, orders, settings) is displayed.
 * @returns {JSX.Element} The rendered profile page.
 */
const ProfilePage = (): JSX.Element => {
  const navigate = useNavigate();
  const user = useAuth((state) => state.user);
  // Assuming updateUser is available in AuthContext for optimistic UI or refetch
  // const { logout, updateUser } = useAuth((state) => ({
  //   logout: state.logout,
  //   updateUser: state.updateUser, // Get updateUser if available
  // }));
  // For now, just get logout
  const { logout } = useAuth((state) => ({ logout: state.logout }));

  const [activeSection, setActiveSection] = useState<ProfileSection>("view");

  // Loading states for form submissions
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  /**
   * Mock handler for successful profile update.
   * Simulates API call and navigates back to view section.
   * @param {Partial<User>} updatedData - The data submitted from the form.
   */
  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    setIsUpdatingProfile(true);
    console.log("Updating profile with (mock):", updatedData);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // --- Mock Update Logic ---
      // In a real app, call backend API here.
      // Then potentially update context state optimistically or refetch user data.
      // if (updateUser) {
      //     // Example: Optimistically update context if updateUser action exists
      //     updateUser({ ...user, ...updatedData });
      //     console.log("AuthContext updated optimistically (mock)");
      // } else {
      //     console.warn("updateUser function not found in AuthContext for optimistic update.");
      //     // If no updateUser, rely on page refresh or manual refetch later
      // }
      console.log(
        "Skipping optimistic update - updateUser not available in context yet."
      );
      // --- End Mock Update Logic ---

      message.success("Profile updated successfully!");
      setActiveSection("view"); // Go back to view mode
    } catch (error) {
      console.error("Profile update failed (mock):", error);
      message.error("Failed to update profile. Please try again.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  /**
   * Mock handler for successful password change.
   * Simulates API call and navigates back to view section.
   * @param {object} passwordData - Object containing oldPassword, newPassword.
   */
  const handleChangePassword = async (passwordData: any) => {
    setIsChangingPassword(true);
    console.log("Changing password with (mock):", passwordData);
    try {
      // Simulate API call - replace with actual backend call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate success/failure based on mock logic
          if (passwordData.oldPassword === "password123") {
            resolve(true);
          } else {
            reject(new Error("Incorrect old password (mock)"));
          }
        }, 1200);
      });

      // message.success is now handled within ChangePasswordForm on successful submit
      // We only handle potential errors thrown by the onFinish promise here
      setActiveSection("view"); // Go back to view mode on success
    } catch (error: any) {
      console.error("Password change failed (mock):", error);
      // Error message is handled within ChangePasswordForm for validation errors
      // Show general error here if the promise rejects for other reasons
      if (!error?.errorFields) {
        // Avoid double message if it's a validation error
        message.error(
          error?.message || "Failed to change password. Please try again."
        );
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Cancel handler remains the same
  const handleCancel = () => {
    setActiveSection("view"); // Go back to view mode
  };

  const handleLogout = () => {
    logout();
    // Optionally navigate to login page or home page after logout
    // navigate('/login');
  };

  // Loading state for initial user data fetch
  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "edit-profile":
        return (
          <EditProfileForm
            initialUserData={user} // Pass current user data
            onFinish={handleUpdateProfile} // Use the new async handler
            isLoading={isUpdatingProfile} // Pass loading state
            // onCancel={handleCancel} // Add if needed
          />
        );
      case "change-password":
        return (
          <ChangePasswordForm
            onFinish={handleChangePassword} // Use the new async handler
            isLoading={isChangingPassword} // Pass loading state
            // onCancel={handleCancel} // Add if needed
          />
        );
      case "order-history":
        return <OrderHistory />;
      case "settings":
        return <UserSettings />;
      case "view":
      default:
        return (
          <>
            <Descriptions
              title="Account Information"
              bordered
              column={{ xs: 1, sm: 1, md: 2 }}
              extra={
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setActiveSection("edit-profile")}
                >
                  Edit Profile
                </Button>
              }
            >
              <Descriptions.Item label="Username">
                <Text strong>{user.username}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              <Descriptions.Item label="Role">
                <Text style={{ textTransform: "capitalize" }}>{user.role}</Text>
              </Descriptions.Item>
              {user.created_at && (
                <Descriptions.Item label="Member Since">
                  {new Date(user.created_at).toLocaleDateString()}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Phone Number">
                <Text type="secondary">Not Provided</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <Text type="secondary">Not Provided</Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4} style={{ marginBottom: 16 }}>
              Manage Account & Security
            </Title>
            <Space wrap size={[16, 16]}>
              {/* Removed Edit Profile button from here */}
              <Button
                icon={<LockOutlined />}
                onClick={() => setActiveSection("change-password")}
              >
                Change Password
              </Button>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => setActiveSection("order-history")}
                // disabled // Disable until implemented
              >
                Order History
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setActiveSection("settings")}
              >
                Settings
              </Button>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ marginLeft: "auto" }} // Push logout to the right if needed
              >
                Logout
              </Button>
            </Space>
          </>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Card bordered={false} style={{ boxShadow: "none" }}>
        {/* Consistent Back Button */}
        {activeSection !== "view" && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setActiveSection("view")}
            style={{ marginBottom: "20px" }}
            type="text"
          >
            Back to Profile
          </Button>
        )}
        {/* Section Title - Optional */}
        {activeSection !== "view" && (
          <Title
            level={3}
            style={{ marginBottom: 24, textTransform: "capitalize" }}
          >
            {activeSection.replace("-", " ")}
          </Title>
        )}

        {renderSection()}
      </Card>
    </div>
  );
};

export default ProfilePage;
