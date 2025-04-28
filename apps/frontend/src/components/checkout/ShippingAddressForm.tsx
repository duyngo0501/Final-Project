import React, { useEffect } from "react";
// Remove useState as Form will manage state
// import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Row, Col, message } from "antd";

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
  onSubmit: (values: ShippingAddressValues) => void | Promise<void>; // Allow async submit
  submitButtonText?: string;
  isLoading?: boolean; // Add optional loading state prop
}

// Basic ZIP code patterns (adjust as needed for specific countries)
const zipPatterns: { [key: string]: RegExp } = {
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  // Add more country patterns here
};

/**
 * @description A reusable form component for collecting shipping address information using Ant Design Form.
 * @param {ShippingAddressFormProps} props Component props including initialValues and onSubmit handler.
 * @returns {React.FC<ShippingAddressFormProps>} The ShippingAddressForm component.
 */
const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
  initialValues = { country: "US" }, // Set default country here
  onSubmit,
  submitButtonText = "Save Address",
  isLoading = false, // Default loading to false
}) => {
  // Use Ant Design Form instance
  const [form] = Form.useForm<ShippingAddressValues>();

  // Get selected country to apply conditional validation
  const selectedCountry = Form.useWatch("country", form);

  // Reset fields when initialValues change
  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(initialValues); // Set initial values using form instance
  }, [initialValues, form]);

  /**
   * @description Handles form submission via Ant Design Form's onFinish.
   */
  const handleFinish = async (values: ShippingAddressValues) => {
    console.log("AntD Form Submitted Values:", values);
    // Trim values before submitting
    const trimmedValues: ShippingAddressValues = {
      fullName: values.fullName.trim(),
      addressLine1: values.addressLine1.trim(),
      addressLine2: values.addressLine2?.trim() || undefined,
      city: values.city.trim(),
      stateProvince: values.stateProvince.trim(),
      zipCode: values.zipCode.trim(),
      country: values.country, // Country is from Select, no trim needed
    };

    try {
      await onSubmit(trimmedValues); // Call the parent onSubmit handler
    } catch (error) {
      console.error("Error submitting address:", error);
      message.error("Failed to save address."); // Show error via message
    }
  };

  const handleFinishFailed = (errorInfo: any) => {
    console.log("Form validation failed:", errorInfo);
    message.error("Please correct the errors in the form.");
  };

  return (
    <Form
      form={form}
      layout="vertical" // Set layout to vertical for labels above inputs
      onFinish={handleFinish} // Use AntD onFinish for submission
      onFinishFailed={handleFinishFailed}
      initialValues={initialValues} // Set initial values directly on Form
      requiredMark={false} // Optional: hide required mark
    >
      {/* Full Name */}
      <Form.Item
        label="Full Name"
        name="fullName"
        rules={[
          {
            required: true,
            message: "Please enter your full name",
            whitespace: true,
          },
        ]}
      >
        <Input placeholder="Enter your full name" />
      </Form.Item>

      {/* Address Line 1 */}
      <Form.Item
        label="Address Line 1"
        name="addressLine1"
        rules={[
          {
            required: true,
            message: "Please enter your street address",
            whitespace: true,
          },
        ]}
      >
        <Input placeholder="Street address, P.O. box, company name, c/o" />
      </Form.Item>

      {/* Address Line 2 */}
      <Form.Item label="Address Line 2 (Optional)" name="addressLine2">
        <Input placeholder="Apartment, suite, unit, building, floor, etc." />
      </Form.Item>

      {/* City / State-Province Row */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="City"
            name="city"
            rules={[
              {
                required: true,
                message: "Please enter your city",
                whitespace: true,
              },
            ]}
          >
            <Input placeholder="Enter city" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="State / Province"
            name="stateProvince"
            rules={[
              {
                required: true,
                message: "Please enter your state or province",
                whitespace: true,
              },
            ]}
          >
            <Input placeholder="Enter state or province" />
          </Form.Item>
        </Col>
      </Row>

      {/* Zip / Country Row */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="ZIP / Postal Code"
            name="zipCode"
            rules={[
              {
                required: true,
                message: "Please enter your ZIP or postal code",
                whitespace: true,
              },
              // Conditional validation based on country
              {
                validator(_, value) {
                  const pattern = zipPatterns[selectedCountry];
                  if (!value || !pattern || pattern.test(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Please enter a valid postal code for the selected country"
                    )
                  );
                },
              },
            ]}
            dependencies={["country"]} // Re-validate when country changes
          >
            <Input placeholder="Enter ZIP or postal code" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: "Please select your country" }]}
          >
            <Select placeholder="Select country">
              {/* TODO: Populate with a real list of countries */}
              <Option value="US">United States</Option>
              <Option value="CA">Canada</Option>
              <Option value="GB">United Kingdom</Option>
              <Option value="AU">Australia</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Submit Button */}
      <Form.Item style={{ marginTop: "24px" }}>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          {submitButtonText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ShippingAddressForm;
