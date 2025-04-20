import React from "react";
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
  // We might need a loading state prop later if submission involves async call
  // isLoading?: boolean;
}

/**
 * @description A reusable form component for collecting shipping address information.
 * @param {ShippingAddressFormProps} props Component props including initialValues and onSubmit handler.
 * @returns {React.FC<ShippingAddressFormProps>} The ShippingAddressForm component.
 */
const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
  initialValues = {},
  onSubmit,
}) => {
  const [form] = Form.useForm();

  /**
   * @description Handles form submission after validation.
   * @param {ShippingAddressValues} values The validated form values.
   */
  const onFinish = (values: ShippingAddressValues) => {
    console.log("Shipping Address Submitted:", values);
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name="shipping_address"
      onFinish={onFinish}
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
            ]}
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

      {/* The submit button is typically part of the parent component (CheckoutPage) */}
      {/* 
         <Form.Item>
           <Button type="primary" htmlType="submit">
             Save Address
           </Button>
         </Form.Item>
       */}
    </Form>
  );
};

export default ShippingAddressForm;
