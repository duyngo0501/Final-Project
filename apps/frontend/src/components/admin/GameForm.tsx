import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select, Button, Upload } from "antd";
import { Game } from "@/types/game"; // Assuming Game type is defined

const { Option } = Select;
const { TextArea } = Input;

/**
 * @description Interface for the Game form values.
 * Matches the Game type where possible.
 */
export interface GameFormValues {
  title: string;
  description?: string;
  price: number;
  discountedPrice?: number | null; // Allow null or undefined
  category: string;
  thumbnail?: string; // URL for thumbnail
  // Add other fields like platform, genre if needed
}

/**
 * @description Props for the GameForm component.
 */
interface GameFormProps {
  initialValues?: Partial<Game>; // Use Game type, can be partial for add
  onFinish: (values: GameFormValues) => Promise<void> | void; // Can be async
  onCancel?: () => void; // Optional cancel handler
  isLoading?: boolean; // Loading state for submission
  formInstance?: any; // Pass form instance if controlled from parent
}

/**
 * @description A reusable form component for adding or editing game details.
 * @param {GameFormProps} props Component props.
 * @returns {React.FC<GameFormProps>} The GameForm component.
 */
const GameForm: React.FC<GameFormProps> = ({
  initialValues,
  onFinish,
  onCancel,
  isLoading = false,
  formInstance, // Use provided instance or create local one
}) => {
  const [form] = Form.useForm(formInstance); // Use passed form instance if available

  // Reset fields when initialValues change (e.g., when opening modal for edit)
  useEffect(() => {
    if (initialValues) {
      // Ensure discountedPrice is null if not present or zero
      const valuesToSet = {
        ...initialValues,
        discountedPrice: initialValues.discountedPrice || null,
      };
      form.setFieldsValue(valuesToSet);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  /**
   * @description Handles form submission after validation.
   * @param {GameFormValues} values The validated form values.
   */
  const handleFinish = (values: GameFormValues) => {
    // Ensure discountedPrice is a number or null before submitting
    const processedValues = {
      ...values,
      discountedPrice: values.discountedPrice
        ? Number(values.discountedPrice)
        : null,
    };
    console.log("Game Form Submitted:", processedValues);
    onFinish(processedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name="game_form"
      onFinish={handleFinish}
      // initialValues prop is handled by useEffect now
    >
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: "Please enter the game title" }]}
      >
        <Input placeholder="Enter game title" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        // Not required
      >
        <TextArea rows={4} placeholder="Enter game description" />
      </Form.Item>

      <Form.Item
        name="category"
        label="Category"
        rules={[{ required: true, message: "Please select a category" }]}
      >
        <Select placeholder="Select category">
          <Option value="pc">PC</Option>
          <Option value="console">Console</Option>
          <Option value="mobile">Mobile</Option>
          {/* Add other categories */}
        </Select>
      </Form.Item>

      <Form.Item
        name="price"
        label="Price"
        rules={[
          { required: true, message: "Please enter the price" },
          {
            type: "number",
            min: 0,
            message: "Price must be a positive number",
          },
        ]}
      >
        <InputNumber
          min={0}
          precision={2}
          style={{ width: "100%" }}
          placeholder="Enter price (e.g., 59.99)"
          addonAfter="$"
        />
      </Form.Item>

      <Form.Item
        name="discountedPrice"
        label="Discounted Price (Optional)"
        rules={[
          // Only validate if a value is entered
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || (typeof value === "number" && value >= 0)) {
                const price = getFieldValue("price");
                if (price && value && value >= price) {
                  return Promise.reject(
                    new Error("Discount price must be less than regular price")
                  );
                }
                return Promise.resolve();
              }
              return Promise.reject(new Error("Must be a positive number"));
            },
          }),
        ]}
      >
        <InputNumber
          min={0}
          precision={2}
          style={{ width: "100%" }}
          placeholder="Enter discounted price (leave blank if none)"
          addonAfter="$"
        />
      </Form.Item>

      <Form.Item
        name="thumbnail"
        label="Thumbnail URL"
        rules={[{ type: "url", message: "Please enter a valid URL" }]} // Basic URL validation
      >
        <Input placeholder="Enter URL for game thumbnail image" />
        {/* TODO: Consider adding Upload component for direct image uploads */}
      </Form.Item>

      {/* Submit/Cancel buttons are typically rendered in the Modal footer */}
      {/* 
      <Form.Item>
        <Space>
          <Button onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Save Game
          </Button>
        </Space>
      </Form.Item>
      */}
    </Form>
  );
};

export default GameForm;
