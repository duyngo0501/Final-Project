import React, { useEffect } from "react";
import { Form, Input, Select, Button, Space } from "antd";

// Reusing User type definition idea from AdminUsersPage
// TODO: Centralize this type
interface User {
  id?: string | number; // ID is optional for add
  username: string;
  email: string;
  role: "admin" | "user";
  password?: string; // Password optional, especially for edit
}

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
  initialValues?: Partial<User>; // Can be partial for add, password excluded for edit
  isEditing: boolean; // Flag to differentiate between Add and Edit modes
  onFinish: (values: UserFormValues) => Promise<void> | void; // Can be async
  onCancel?: () => void;
  isLoading?: boolean;
  formInstance?: any;
}

/**
 * @description A reusable form component for adding or editing user details.
 * @param {UserFormProps} props Component props.
 * @returns {React.FC<UserFormProps>} The UserForm component.
 */
const UserForm: React.FC<UserFormProps> = ({
  initialValues,
  isEditing,
  onFinish,
  onCancel,
  isLoading = false,
  formInstance,
}) => {
  const [form] = Form.useForm(formInstance);

  // Reset fields when initialValues change or mode changes
  useEffect(() => {
    if (initialValues && isEditing) {
      // For editing, set values BUT EXCLUDE password
      form.setFieldsValue({ ...initialValues, password: "" });
    } else {
      // For adding, reset everything
      form.resetFields();
    }
  }, [initialValues, isEditing, form]);

  /**
   * @description Handles form submission after validation.
   * @param {UserFormValues} values The validated form values.
   */
  const handleFinish = (values: UserFormValues) => {
    console.log("User Form Submitted:", values);
    // Remove password field if it's empty (especially for edit)
    const finalValues = { ...values };
    if (!finalValues.password) {
      delete finalValues.password;
    }
    onFinish(finalValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name="user_form"
      onFinish={handleFinish}
    >
      <Form.Item
        name="username"
        label="Username"
        rules={[{ required: true, message: "Please enter a username" }]}
      >
        <Input placeholder="Enter username" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email Address"
        rules={[
          { required: true, message: "Please enter an email address" },
          { type: "email", message: "Please enter a valid email address" },
        ]}
      >
        <Input placeholder="Enter email address" />
      </Form.Item>

      {/* Password - Required only for Add, optional placeholder for Edit */}
      <Form.Item
        name="password"
        label={
          isEditing ? "Password (leave blank to keep unchanged)" : "Password"
        }
        rules={[
          {
            required: !isEditing,
            message: "Password is required for new users",
          },
          // Add complexity rules if needed
          { min: 6, message: "Password must be at least 6 characters" },
        ]}
        // Do not set initialValue for password on edit
      >
        <Input.Password
          placeholder={
            isEditing
              ? "Leave blank to keep current password"
              : "Enter new password"
          }
        />
      </Form.Item>

      <Form.Item
        name="role"
        label="Role"
        rules={[{ required: true, message: "Please select a role" }]}
        initialValue="user" // Default to 'user'
      >
        <Select placeholder="Select user role">
          <Option value="user">User</Option>
          <Option value="admin">Admin</Option>
        </Select>
      </Form.Item>

      {/* Buttons are usually in Modal footer */}
      {/* 
       <Form.Item>
         <Space>
           <Button onClick={onCancel} disabled={isLoading}>Cancel</Button>
           <Button type="primary" htmlType="submit" loading={isLoading}>
             Save User
           </Button>
         </Space>
       </Form.Item>
       */}
    </Form>
  );
};

export default UserForm;
