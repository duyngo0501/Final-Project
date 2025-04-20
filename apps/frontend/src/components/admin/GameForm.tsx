import React, { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Upload,
  Space,
  Row,
  Col,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Game } from "@/types/game"; // Assuming Game type is defined
import dayjs from "dayjs";

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
  thumbnail?: any; // Handle Ant Design Upload file list
  releaseDate?: dayjs.Dayjs | null;
  // Add other fields like platform if needed
}

/**
 * @description Props for the GameForm component.
 */
interface GameFormProps {
  initialValues?: Game | null; // Game object for editing, null/undefined for creating
  onFinish: (values: GameFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
}

// Mock categories for the select dropdown
const MOCK_CATEGORIES = [
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Simulation",
  "Puzzle",
  "Sports",
];

/**
 * @description A reusable form component for creating or editing game details.
 * @param {GameFormProps} props Component props.
 * @returns {React.ReactElement} The GameForm component.
 */
const GameForm: React.FC<GameFormProps> = ({
  initialValues,
  onFinish,
  onCancel,
  isLoading = false,
}) => {
  const [form] = Form.useForm();

  // Set initial form values when editing
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        // Convert string date from Game type to Dayjs object for DatePicker
        releaseDate: initialValues.releaseDate
          ? dayjs(initialValues.releaseDate)
          : null,
        // Handle thumbnail display if needed (initialValues.thumbnail might be URL string)
        // For now, just setting the field value if it exists
        thumbnail: initialValues.thumbnail
          ? [
              {
                uid: "-1",
                name: "current_image.png",
                status: "done",
                url: initialValues.thumbnail,
              },
            ]
          : [],
        discountedPrice: initialValues.discountedPrice ?? null, // Ensure null if undefined
      });
    } else {
      form.resetFields(); // Reset form for creating new game
    }
  }, [initialValues, form]);

  const handleFormSubmit = (values: GameFormValues) => {
    console.log("Form Values:", values);
    // Process thumbnail - might need to extract file object from list
    const processedValues = {
      ...values,
      // Convert Dayjs back to string or handle as needed by API
      releaseDate: values.releaseDate
        ? values.releaseDate.toISOString()
        : undefined,
      // Extract file if needed, or handle upload separately
      thumbnail:
        values.thumbnail?.[0]?.originFileObj ||
        (initialValues?.thumbnail && !values.thumbnail?.[0]?.originFileObj
          ? initialValues.thumbnail
          : undefined),
    };
    console.log("Processed Form Values for API:", processedValues);
    onFinish(processedValues as any); // Pass processed values (adjust type assertion)
  };

  // Basic validation for upload (customize as needed)
  const normFile = (e: any) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    // Limit to one file for thumbnail
    return e && e.fileList ? e.fileList.slice(-1) : [];
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormSubmit}
      // initialValues prop on Form might interfere with useEffect/setFieldsValue
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter the game title" }]}
          >
            <Input placeholder="Enter game title" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select placeholder="Select game category">
              {MOCK_CATEGORIES.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="price"
            label="Price ($)"
            rules={[
              { required: true, message: "Please enter the price" },
              { type: "number", min: 0, message: "Price cannot be negative" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} placeholder="e.g., 59.99" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="discountedPrice"
            label="Discounted Price ($) (Optional)"
            rules={[
              {
                type: "number",
                min: 0,
                message: "Discount price cannot be negative",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value < getFieldValue("price")) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Discount price must be less than original price")
                  );
                },
              }),
            ]}
          >
            <InputNumber style={{ width: "100%" }} placeholder="e.g., 49.99" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="releaseDate" label="Release Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Description">
        <TextArea rows={4} placeholder="Enter game description" />
      </Form.Item>

      <Form.Item
        name="thumbnail"
        label="Thumbnail Image"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        extra="Upload a single image for the game thumbnail. Current image will be replaced."
        // Add rules if upload is mandatory for creation
      >
        <Upload
          name="thumbnailUpload"
          listType="picture"
          beforeUpload={() => false}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? "Save Changes" : "Create Game"}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};

export default GameForm;
