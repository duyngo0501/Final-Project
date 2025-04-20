import React, { useState, useEffect } from "react";
import { Input, Select, Button, Space, message } from "antd";

// TODO: Centralize this type (assuming it exists in @/types/user)
import { User } from "@/types/user";

const { Option } = Select;

/**
 * @description Interface for the User form values.
 */
export interface UserFormValues {
  username: string;
  email: string;
  role: "admin" | "user";
  password?: string; // Password might not always be submitted
}

/**
 * @description Props for the UserForm component.
 */
interface UserFormProps {
  initialValues?: Partial<User>;
  isEditing: boolean;
  onFinish: (values: UserFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * @description A reusable form component for adding or editing user details using useState.
 * @param {UserFormProps} props Component props.
 * @returns {React.FC<UserFormProps>} The UserForm component.
 */
const UserForm: React.FC<UserFormProps> = ({
  initialValues = {},
  isEditing,
  onFinish,
  onCancel,
  isLoading = false,
}) => {
  // State for form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user"); // Default role

  // Reset fields when initialValues change or mode changes
  useEffect(() => {
    if (initialValues && isEditing) {
      setUsername(initialValues.username || "");
      setEmail(initialValues.email || "");
      setRole(initialValues.role || "user");
      setPassword(""); // Always clear password field for edit form
    } else {
      // For adding, reset everything
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("user");
    }
  }, [initialValues, isEditing]);

  /**
   * @description Handles form submission and validation.
   */
  const handleSubmit =
    async (/* event?: React.FormEvent<HTMLFormElement> */) => {
      // If triggered by an external button (like Modal Ok), event might not be passed.
      // event?.preventDefault();

      // --- Validation ---
      if (!username.trim()) {
        message.error("Please enter a username");
        return;
      }
      if (!email.trim()) {
        message.error("Please enter an email address");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        message.error("Please enter a valid email address");
        return;
      }
      // Password validation: required for adding, minimum length if provided
      if (!isEditing && !password) {
        message.error("Password is required for new users");
        return;
      }
      if (password && password.length < 6) {
        message.error("Password must be at least 6 characters");
        return;
      }
      if (!role) {
        message.error("Please select a role");
        return;
      }
      // --- End Validation ---

      const finalValues: UserFormValues = {
        username: username.trim(),
        email: email.trim(),
        role,
      };

      // Only include password if it has been entered
      if (password) {
        finalValues.password = password;
      }

      console.log("User Form Submitted:", finalValues);
      try {
        await onFinish(finalValues);
        // Clearing the form might be handled by the parent modal closing
      } catch (error) {
        console.error("Error submitting user form:", error);
        message.error("Failed to save user details.");
      }
    };

  return (
    <div>
      {/* Username */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          Username
        </label>
        <Input
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          Email Address
        </label>
        <Input
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          type="email"
        />
      </div>

      {/* Password */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          {isEditing ? "Password (leave blank to keep unchanged)" : "Password"}
        </label>
        <Input.Password
          placeholder={
            isEditing
              ? "Leave blank to keep current password"
              : "Enter new password"
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="new-password"
        />
        {isEditing && !password && (
          <small style={{ color: "#888" }}>
            Current password will be retained.
          </small>
        )}
        {password && password.length < 6 && (
          <small style={{ color: "red" }}>
            Password must be at least 6 characters.
          </small>
        )}
      </div>

      {/* Role */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Role</label>
        <Select
          placeholder="Select user role"
          value={role}
          onChange={(value) => setRole(value)}
          disabled={isLoading}
          style={{ width: "100%" }}
        >
          <Option value="user">User</Option>
          <Option value="admin">Admin</Option>
        </Select>
      </div>

      {/* Render buttons here if needed, or rely on parent Modal footer */}
      <div style={{ marginTop: "24px", textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            {isEditing ? "Save Changes" : "Add User"}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default UserForm;
