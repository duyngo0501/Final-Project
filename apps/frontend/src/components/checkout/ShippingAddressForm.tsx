import React, { useEffect } from "react";
import { Form, Input, Button, Select, Row, Col } from "antd";

const { Option } = Select;

/**
 * @description Interface for the shipping address form values.
 */
export interface ShippingAddressValues {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string; // State or Province
  zipCode: string; // ZIP or Postal Code
  country: string;
}

/**
 * @description Props for the ShippingAddressForm component.
 */
interface ShippingAddressFormProps {
  initialValues?: Partial<ShippingAddressValues>;
  onSubmit: (values: ShippingAddressValues) => void;
  submitButtonText?: string;
}

// Basic ZIP code patterns (adjust as needed for specific countries)
const zipPatterns: { [key: string]: RegExp } = {
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  // Add more country patterns here
};

/**
 * @description A reusable form component for collecting shipping address information.
 * @param {ShippingAddressFormProps} props Component props including initialValues and onSubmit handler.
 * @returns {React.FC<ShippingAddressFormProps>} The ShippingAddressForm component.
 */
const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
  initialValues = {},
  onSubmit,
  submitButtonText = "Save Address",
}) => {
  const [form] = Form.useForm();
  const selectedCountry = Form.useWatch("country", form);

  // Reset fields when initialValues change (e.g., when editing a different address)
  useEffect(() => {
    form.resetFields();
  }, [initialValues, form]);

  /**
   * @description Handles form submission after validation.
   * @param {ShippingAddressValues} values The validated form values.
   */
  const onFinish = (values: ShippingAddressValues) => {
    console.log("Shipping Address Submitted:", values);
    onSubmit(values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Address Form Failed:", errorInfo);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name="shipping_address"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={initialValues}
      requiredMark="optional" // Mark optional fields instead of required
    >
      <Form.Item
        name="fullName"
        label="Full Name"
        rules={[{ required: true, message: "Please enter your full name" }]}
      >
        <Input placeholder="Enter your full name" />
      </Form.Item>

      <Form.Item
        name="addressLine1"
        label="Address Line 1"
        rules={[
          { required: true, message: "Please enter your street address" },
        ]}
      >
        <Input placeholder="Street address, P.O. box, company name, c/o" />
      </Form.Item>

      <Form.Item
        name="addressLine2"
        label="Address Line 2 (Optional)"
        // No required rule
      >
        <Input placeholder="Apartment, suite, unit, building, floor, etc." />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: "Please enter your city" }]}
          >
            <Input placeholder="Enter city" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="stateProvince"
            label="State / Province"
            rules={[
              {
                required: true,
                message: "Please enter your state or province",
              },
            ]}
          >
            {/* TODO: Potentially replace with a Select dropdown based on country */}
            <Input placeholder="Enter state or province" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="zipCode"
            label="ZIP / Postal Code"
            rules={[
              {
                required: true,
                message: "Please enter your ZIP or postal code",
              },
              {
                pattern:
                  selectedCountry && zipPatterns[selectedCountry]
                    ? zipPatterns[selectedCountry]
                    : /^.+$/,
                message:
                  "Please enter a valid postal code for the selected country",
              },
            ]}
            dependencies={["country"]}
          >
            <Input placeholder="Enter ZIP or postal code" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: "Please select your country" }]}
            initialValue="US" // Default to US for example
          >
            {/* TODO: Populate with a real list of countries */}
            <Select placeholder="Select country">
              <Option value="US">United States</Option>
              <Option value="CA">Canada</Option>
              <Option value="GB">United Kingdom</Option>
              <Option value="AU">Australia</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {submitButtonText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ShippingAddressForm;
