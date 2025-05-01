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
import type { RcFile, UploadFile } from "antd/es/upload/interface"; // Import UploadFile type

// Import Supabase client
import { supabase } from "@/lib/supabaseClient";

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
  // Use UploadFile[] for Ant Design's controlled component state
  thumbnail?: UploadFile[];
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
  const [isMutating, setIsMutating] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]); // State for upload component

  useEffect(() => {
    if (initialValues) {
      // TODO: Handle initialValues for image display if editing
      form.setFieldsValue({
        title: initialValues.name, // Map name to title for form
        description: initialValues.description ?? undefined,
        price: initialValues.price ?? undefined,
        releaseDate: initialValues.released_date
          ? dayjs(initialValues.released_date)
          : null,
        // Reset file list when initialValues change
        thumbnail: [],
      });
      setFileList([]); // Clear internal file list state
    } else {
      form.resetFields();
      setFileList([]); // Clear internal file list state
    }
  }, [initialValues, form]);

  const handleFormSubmit = async (values: GameFormValues) => {
    console.log("Form Values submitted:", values);
    setIsMutating(true); // Start loading
    let uploadedImageUrl: string | undefined = undefined;

    try {
      // --- Handle Image Upload --- //
      const imageFile = fileList[0]?.originFileObj as RcFile | undefined;
      if (imageFile) {
        console.log("Uploading image:", imageFile.name);
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `${Date.now()}-${Math.random()}.${fileExt}`;
        const bucketName = "game-images"; // Define your bucket name

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        // --- Get Public URL --- //
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          console.error("Failed to get public URL for path:", filePath);
          // Attempt cleanup if URL fetch fails after successful upload?
          // await supabase.storage.from(bucketName).remove([filePath]);
          throw new Error("Image uploaded, but failed to get public URL.");
        }

        uploadedImageUrl = urlData.publicUrl;
        console.log("Image uploaded successfully:", uploadedImageUrl);
      }
      // ------------------------ //

      // Prepare data for the API
      const apiData: Partial<z.infer<typeof GameCreateSchema>> = {
        name: values.title,
        description: values.description || undefined,
        price: values.price,
        released_date: values.releaseDate
          ? values.releaseDate.toISOString()
          : undefined,
        // Include the uploaded image URL if available
        background_image: uploadedImageUrl,
      };

      console.log("Data being sent to API:", apiData);

      if (initialValues) {
        // TODO: Implement update logic (including potential image update/removal)
        console.warn("Update functionality not yet implemented in GameForm");
        message.warning("Update functionality is not implemented yet.");
      } else {
        // Create game - Corrected client call signature:
        // First argument: requestBody (apiData)
        // Second argument: optional config
        const response = await gameControllerCreateGame(
          apiData as z.infer<typeof GameCreateSchema>
          // No need for the second argument if no specific config is needed
        );
        message.success(`Game "${response.data.name}" created successfully!`);
        form.resetFields();
        setFileList([]); // Clear file list on successful creation
        if (onSubmitSuccess) {
          onSubmitSuccess(response.data);
        }
      }
    } catch (error: any) {
      // Catch errors (including upload errors)
      console.error("Error submitting game form:", error);
      let errorMsg = "Failed to process game request.";
      const errorDetail =
        error?.response?.data?.detail || error?.detail || error?.message;
      if (errorDetail) {
        if (Array.isArray(errorDetail)) {
          errorMsg = errorDetail
            .map((d) => `${d.loc?.join(".") || "error"}: ${d.msg}`)
            .join("; ");
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

  // Handle file list changes for controlled component
  const handleUploadChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setFileList(newFileList);
  };

  const handleFinishFailed: FormProps<GameFormValues>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Form validation failed:", errorInfo);
    message.error("Please correct the errors in the form.");
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormSubmit}
      onFinishFailed={handleFinishFailed}
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
            label="Category (Mocked)"
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
        {/* Removed Discounted Price for simplicity with generated types */}
        {/* <Col span={8}>
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
        </Col> */}
        <Col span={8}>
          <Form.Item name="releaseDate" label="Release Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Description">
        <TextArea rows={4} placeholder="Enter game description" />
      </Form.Item>

      {/* Add Upload Component */}
      <Form.Item
        name="thumbnail"
        label="Background Image"
        valuePropName="fileList"
        // Use internal state for controlled component
        getValueFromEvent={(e) => {
          if (Array.isArray(e)) {
            return e;
          }
          return e && e.fileList;
        }}
        extra="Upload a single image for the game background."
      >
        <Upload
          name="thumbnailUpload"
          listType="picture"
          beforeUpload={() => false} // Prevent default antd upload
          maxCount={1}
          fileList={fileList} // Control file list state
          onChange={handleUploadChange} // Handle state changes
        >
          <Button icon={<UploadOutlined />}>Click to Upload Image</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isMutating}>
            {initialValues ? "Save Changes (Not Impl.)" : "Create Game"}
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
