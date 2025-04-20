import React, { useState } from "react";
import { Input, Button, Spin, Alert, message, Form } from "antd";
import { produce } from "immer";

/**
 * @description Simulates an API call to change the user's password.
 * @param {string} oldPassword The current password entered by the user.
 * @param {string} newPassword The new password entered by the user.
 * @returns {Promise<{ success: boolean; message: string }>} A promise resolving to the outcome of the password change attempt.
 */
const mockChangePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  console.log(
    `[Mock API] Attempting to change password. Old: ${oldPassword}, New: ${newPassword}`
  );
  await new Promise((resolve) => setTimeout(resolve, 700)); // Simulate network delay

  // Simulate simple validation/logic
  if (oldPassword !== "password123") {
    // Simulate incorrect old password
    return { success: false, message: "Incorrect old password." };
  }
  if (newPassword.length < 8) {
    return {
      success: false,
      message: "New password must be at least 8 characters long.",
    };
  }
  // Simulate successful password change
  return { success: true, message: "Password changed successfully!" };
};

/**
 * Interface for the values captured by the Change Password form.
 */
interface ChangePasswordFormValues {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

/**
 * Props for the ChangePasswordForm component.
 * @param {function} onFinish - Callback function executed when the form is successfully submitted.
 * @param {boolean} isLoading - Flag indicating if the form submission is in progress.
 */
interface ChangePasswordFormProps {
  onFinish: (values: ChangePasswordFormValues) => Promise<void>;
  isLoading: boolean;
}

/**
 * ChangePasswordForm Component
 * Provides a form for users to change their password.
 * Includes fields for old password, new password, and confirmation, with validation.
 *
 * @param {ChangePasswordFormProps} props - Component props.
 * @returns {React.ReactElement} The rendered change password form.
 */
const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onFinish,
  isLoading,
}) => {
  const [form] = Form.useForm<ChangePasswordFormValues>();

  /**
   * Handles form submission, performing validation and calling the onFinish prop.
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onFinish(values);
      form.resetFields(); // Reset form after successful submission
      message.success("Password changed successfully!");
    } catch (errorInfo: any) {
      console.log("Failed validation or submission:", errorInfo);
      // Check if it's a validation error object from Ant Design Form
      if (
        errorInfo &&
        typeof errorInfo === "object" &&
        errorInfo.hasOwnProperty("errorFields") &&
        Array.isArray(errorInfo.errorFields) &&
        errorInfo.errorFields.length > 0
      ) {
        // Specific validation field errors are displayed by Form.Item automatically.
        // You could add a generic message here if needed, but often not necessary.
        // message.warning('Please correct the errors below.');
      } else {
        // Handle other errors (e.g., network errors from onFinish)
        message.error("Failed to change password. Please try again.");
      }
    }
  };

  return (
    <Spin spinning={isLoading}>
      <Form
        form={form}
        layout="vertical"
        name="changePasswordForm"
        onFinish={handleSubmit} // Use internal handleSubmit for pre-validation
        autoComplete="off"
      >
        <Form.Item
          name="oldPassword"
          label="Old Password"
          rules={[
            {
              required: true,
              message: "Please input your current password!",
            },
          ]}
          hasFeedback
        >
          <Input.Password placeholder="Enter your current password" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            {
              required: true,
              message: "Please input your new password!",
            },
            {
              min: 8, // Example: Minimum length rule
              message: "Password must be at least 8 characters long!",
            },
            // Add more complexity rules if needed (e.g., regex for uppercase, number, symbol)
          ]}
          hasFeedback
        >
          <Input.Password placeholder="Enter your new password (min. 8 characters)" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]} // Dependency for matching rule
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please confirm your new password!",
            },
            // Custom validator function to check if passwords match
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm your new password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default ChangePasswordForm;
