import React from "react";
import { Form, Input, Button, Space } from "antd";

/**
 * @description Interface for the Change Password form values.
 */
export interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * @description Props for the ChangePasswordForm component.
 */
interface ChangePasswordFormProps {
  onFinish: (values: ChangePasswordFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  formInstance?: any;
}

/**
 * @description Form component for changing the user's password.
 * @param {ChangePasswordFormProps} props Component props.
 * @returns {React.FC<ChangePasswordFormProps>} The ChangePasswordForm component.
 */
const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onFinish,
  onCancel,
  isLoading = false,
  formInstance,
}) => {
  const [form] = Form.useForm(formInstance);

  return (
    <Form
      form={form}
      layout="vertical"
      name="change_password_form"
      onFinish={onFinish}
      // Clear fields on initial render or when modal reopens
      preserve={false}
    >
      <Form.Item
        name="oldPassword"
        label="Current Password"
        rules={[
          { required: true, message: "Please enter your current password" },
        ]}
      >
        <Input.Password placeholder="Enter your current password" />
      </Form.Item>

      <Form.Item
        name="newPassword"
        label="New Password"
        rules={[
          { required: true, message: "Please enter a new password" },
          { min: 6, message: "Password must be at least 6 characters" },
          // Add complexity rules if desired
        ]}
        hasFeedback // Show validation status icon
      >
        <Input.Password placeholder="Enter new password (min. 6 characters)" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm New Password"
        dependencies={["newPassword"]} // Depends on newPassword field
        hasFeedback
        rules={[
          { required: true, message: "Please confirm your new password" },
          // Validator to check if it matches the new password
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("The two passwords do not match!")
              );
            },
          }),
        ]}
      >
        <Input.Password placeholder="Confirm your new password" />
      </Form.Item>

      {/* Buttons usually in Modal footer */}
      {/* 
      <Form.Item>
        <Space>
           <Button onClick={onCancel} disabled={isLoading}>Cancel</Button>
           <Button type="primary" htmlType="submit" loading={isLoading}>
             Change Password
           </Button>
        </Space>
      </Form.Item>
      */}
    </Form>
  );
};

export default ChangePasswordForm;
