import React, { useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Switch,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Interface for form values
export interface BlogFormValues {
  title: string;
  author: string;
  dateRange?: [Dayjs | null, Dayjs | null]; // Use tuple for range picker
  excerpt?: string;
  content: string; // Assuming main content is required
}

// Props for the BlogForm component
interface BlogFormProps {
  initialValues?: Partial<BlogFormValues> | null; // Allow partial for editing
  onSubmit: (values: BlogFormValues) => Promise<void>; // Make async to handle loading
  onCancel: () => void;
  isLoading: boolean; // Receive loading state from parent
}

const BlogForm: React.FC<BlogFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [form] = Form.useForm<BlogFormValues>();

  // Set initial form values when editing
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      // Set defaults for adding new post
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = (values: BlogFormValues) => {
    // Add any pre-processing here if needed (e.g., date formatting for API)
    console.log("Blog Form Submitted Values:", values);
    onSubmit(values); // Call parent submit handler
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ status: "draft" }} // Default status for new posts
    >
      <Form.Item
        name="title"
        label="Post Title"
        rules={[{ required: true, message: "Please enter the post title" }]}
      >
        <Input placeholder="Enter title" />
      </Form.Item>

      <Form.Item
        name="author"
        label="Author"
        rules={[{ required: true, message: "Please enter the author name" }]}
      >
        <Input placeholder="Enter author name" />
      </Form.Item>

      <Form.Item
        name="dateRange"
        label="Publish Date Range (Optional)"
        help="Leave empty if not applicable or for immediate publish (if status is Published)"
      >
        <RangePicker
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          style={{ width: "100%" }}
        />
      </Form.Item>

      <Form.Item
        name="excerpt"
        label="Excerpt (Optional)"
        help="A short summary shown in post lists."
      >
        <TextArea rows={3} placeholder="Enter a brief excerpt" />
      </Form.Item>

      <Form.Item
        name="content"
        label="Content"
        rules={[{ required: true, message: "Please enter the post content" }]}
        help="Full content of the blog post (HTML can be used, ensure sanitization on display)."
      >
        {/* Replace with a Rich Text Editor later if needed */}
        <TextArea rows={10} placeholder="Enter the full post content here..." />
      </Form.Item>

      <Form.Item style={{ textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? "Update Post" : "Create Post"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default BlogForm;
