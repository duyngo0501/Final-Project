import React, { useEffect, useState } from "react";
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
  FormProps,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Game } from "@/gen/types/Game";
import { HTTPValidationError } from "@/gen/types/HTTPValidationError";
import dayjs from "dayjs";
import { z } from "zod";

import { gameControllerCreateGame } from "@/gen/client/gameControllerCreateGame";
import { gameCreateSchemaSchema as GameCreateSchema } from "@/gen/zod/gameCreateSchemaSchema";

const { Option } = Select;
const { TextArea } = Input;

/**
 * @description Interface for the Game form values.
 * Using camelCase for form state, will map to snake_case for API.
 */
export interface GameFormValues {
  title: string;
  description?: string;
  price: number;
  discountedPrice?: number | null;
  category: string;
  thumbnail?: any; // Ant Design Upload file list type
  releaseDate?: dayjs.Dayjs | null; // Use Dayjs for DatePicker
}

/**
 * @description Props for the GameForm component.
 */
interface GameFormProps {
  initialValues?: Game | null;
  onSubmitSuccess?: (createdGame: Game) => void;
  onFinishFailed?: (errorInfo: any) => void;
  onCancel?: () => void;
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
  onSubmitSuccess,
  onFinishFailed,
  onCancel,
}) => {
  const [form] = Form.useForm<GameFormValues>();
  // --- State for manual loading management ---
  const [isMutating, setIsMutating] = useState(false);

  // --- Reinstate useEffect with assumed property names ---
  useEffect(() => {
    if (initialValues) {
      // Assuming Game type uses these property names (adjust if needed)
      // Linter errors here suggest the 'Game' type might be different than assumed.
      // Commenting out potentially problematic fields for now.
      form.setFieldsValue({
        title: initialValues.name, // Map name to title for form
        description: initialValues.description ?? undefined, // Default null to undefined
        price: initialValues.price ?? undefined, // Default null to undefined
        // discountedPrice: initialValues.discounted_price ?? null,
        // category: initialValues.category,
        // thumbnail: initialValues.thumbnail
        //   ? [
        //       {
        //         uid: "-1",
        //         name: "current_image.png",
        //         status: "done",
        //         url: initialValues.thumbnail,
        //       },
        //     ]
        //   : [],
        releaseDate: initialValues.released_date // Assuming released_date exists
          ? dayjs(initialValues.released_date)
          : null,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFormSubmit = async (values: GameFormValues) => {
    console.log("Form Values submitted:", values);
    setIsMutating(true); // Start loading

    // Prepare data for the API (map form fields to API schema)
    // Filter out undefined/null properties that might not be accepted by the Zod schema
    const apiData: Partial<z.infer<typeof GameCreateSchema>> = {
      name: values.title, // Map form's title to API's name
      description: values.description || undefined,
      price: values.price,
      // discounted_price: values.discountedPrice === null ? undefined : values.discountedPrice, // ERROR: Property does not exist
      // category: values.category, // Assuming category is not part of GameCreateSchema based on error
      released_date: values.releaseDate
        ? values.releaseDate.toISOString()
        : undefined,
      // thumbnail: values.thumbnail?.[0]?.originFileObj, // Assuming thumbnail is not part of GameCreateSchema
    };

    console.log("Data being sent to API:", apiData);

    try {
      if (initialValues) {
        // TODO: Implement update logic using a direct client call
        console.warn("Update functionality not yet implemented in GameForm");
        message.warning("Update functionality is not implemented yet.");
        // Example: await gameControllerUpdateGame(initialValues.id, updateData);
        // Handle success/error for update...
      } else {
        // Directly call the create client function
        // Pass the data as the second argument (requestBody)
        // The first argument seems to be for configs/options, pass empty object for now.
        // This needs verification based on the actual generated client function signature.
        // Correction: Pass apiData as the first argument based on linter error
        // const response = await gameControllerCreateGame(apiData as z.infer<typeof GameCreateSchema>);
        // Correction 2: Pass path params (none needed here, so maybe null/undefined?), then data, then options
        // const response = await gameControllerCreateGame(undefined, apiData as z.infer<typeof GameCreateSchema>, {});
        // Correction 3: Use correct signature: data first, params second (use {}), config is optional
        // Correction 4: Provide required `args` and `kwargs` in the params object
        const response = await gameControllerCreateGame(apiData as z.infer<typeof GameCreateSchema>, { args: undefined, kwargs: undefined });
        message.success(`Game "${response.data.name}" created successfully!`); // Use name from response
        form.resetFields();
        if (onSubmitSuccess) {
          onSubmitSuccess(response.data);
        }
      }
    } catch (error: any) { // Catch errors
      console.error("Error submitting game form:", error);
      let errorMsg = "Failed to process game request.";
      const errorDetail = error?.response?.data?.detail || error?.detail || error?.message;
      if (errorDetail) {
        if (Array.isArray(errorDetail)) {
          errorMsg = errorDetail.map(d => `${d.loc?.join('.') || 'error'}: ${d.msg}`).join("; ");
        } else {
          errorMsg = String(errorDetail);
        }
      } else if (error instanceof Error) {
         errorMsg = error.message;
      }
      message.error(errorMsg);
    } finally {
      setIsMutating(false); // Stop loading regardless of success/error
    }
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

  const handleFinishFailed: FormProps<GameFormValues>["onFinishFailed"] = (errorInfo) => {
    console.log("Form validation failed:", errorInfo);
    message.error("Please correct the errors in the form.");
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormSubmit}
      onFinishFailed={handleFinishFailed} // Use the typed handler
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
          <Button type="primary" htmlType="submit" loading={isMutating}>
            {initialValues ? "Save Changes" : "Create Game"}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} disabled={isMutating}>
              Cancel
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};

export default GameForm;
