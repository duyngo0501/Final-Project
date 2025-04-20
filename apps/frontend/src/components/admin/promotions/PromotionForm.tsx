import React from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Radio,
  FormInstance,
} from "antd";

const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * @description Interface for Promotion form values. Dates are handled separately.
 */
export interface PromotionFormValues {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  // dateRange: [moment.Moment, moment.Moment]; // Handled by RangePicker
  status: "active" | "inactive";
}

/**
 * @description Props for the PromotionForm component.
 */
interface PromotionFormProps {
  formInstance: FormInstance<PromotionFormValues>;
  onFinish: (values: any) => Promise<void> | void; // `any` because RangePicker adds extra field
  initialValues?: Partial<PromotionFormValues & { dateRange?: any }>; // Allow initial dateRange
  isLoading?: boolean;
}

/**
 * @description Reusable form for creating or editing promotions.
 * @param {PromotionFormProps} props Component props.
 * @returns {React.FC<PromotionFormProps>} The PromotionForm component.
 */
const PromotionForm: React.FC<PromotionFormProps> = ({
  formInstance,
  onFinish,
  initialValues = { discountType: "percentage", status: "inactive" }, // Default values
  isLoading = false,
}) => {
  return (
    <Form
      form={formInstance}
      layout="vertical"
      name="promotion_form"
      onFinish={onFinish}
      initialValues={initialValues}
      preserve={false} // Clear fields when modal closes/reopens
    >
      <Form.Item
        name="code"
        label="Promotion Code"
        rules={[
          { required: true, message: "Please enter a promotion code" },
          { whitespace: true, message: "Code cannot be empty" },
        ]}
      >
        <Input placeholder="e.g., SUMMER20" />
      </Form.Item>

      <Form.Item name="description" label="Description (Optional)">
        <Input.TextArea rows={2} placeholder="Briefly describe the promotion" />
      </Form.Item>

      <Form.Item label="Discount" style={{ marginBottom: 0 }}>
        <Input.Group compact>
          <Form.Item
            name="discountType"
            noStyle
            rules={[{ required: true, message: "Discount type is required" }]}
          >
            <Select style={{ width: "30%" }} placeholder="Type">
              <Option value="percentage">%</Option>
              <Option value="fixed">$</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="discountValue"
            noStyle
            rules={[{ required: true, message: "Discount value is required" }]}
          >
            <InputNumber style={{ width: "70%" }} min={0} placeholder="Value" />
          </Form.Item>
        </Input.Group>
      </Form.Item>

      <Form.Item
        name="dateRange"
        label="Effective Dates"
        rules={[
          { required: true, message: "Please select the effective date range" },
        ]}
      >
        <RangePicker
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          style={{ width: "100%" }}
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: "Please select a status" }]}
      >
        <Radio.Group>
          <Radio value="active">Active</Radio>
          <Radio value="inactive">Inactive</Radio>
          {/* Expired status is usually determined by date, not set manually */}
        </Radio.Group>
      </Form.Item>

      {/* Submit button is typically handled by the Modal footer */}
    </Form>
  );
};

export default PromotionForm;
