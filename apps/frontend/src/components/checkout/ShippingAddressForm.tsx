import React, { useState, useEffect } from "react";
import { Input, Button, Select, Row, Col, message } from "antd";

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
 * @description A reusable form component for collecting shipping address information using useState.
 * @param {ShippingAddressFormProps} props Component props including initialValues and onSubmit handler.
 * @returns {React.FC<ShippingAddressFormProps>} The ShippingAddressForm component.
 */
const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
  initialValues = {},
  onSubmit,
  submitButtonText = "Save Address",
  isLoading = false, // Default loading to false
}) => {
  // State for form fields
  const [fullName, setFullName] = useState(initialValues.fullName || "");
  const [addressLine1, setAddressLine1] = useState(
    initialValues.addressLine1 || ""
  );
  const [addressLine2, setAddressLine2] = useState(
    initialValues.addressLine2 || ""
  );
  const [city, setCity] = useState(initialValues.city || "");
  const [stateProvince, setStateProvince] = useState(
    initialValues.stateProvince || ""
  );
  const [zipCode, setZipCode] = useState(initialValues.zipCode || "");
  const [country, setCountry] = useState(initialValues.country || "US"); // Default to US

  // Reset fields when initialValues change
  useEffect(() => {
    setFullName(initialValues.fullName || "");
    setAddressLine1(initialValues.addressLine1 || "");
    setAddressLine2(initialValues.addressLine2 || "");
    setCity(initialValues.city || "");
    setStateProvince(initialValues.stateProvince || "");
    setZipCode(initialValues.zipCode || "");
    setCountry(initialValues.country || "US");
  }, [initialValues]);

  /**
   * @description Handles form submission and validation.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // --- Validation ---
    if (!fullName.trim()) {
      message.error("Please enter your full name");
      return;
    }
    if (!addressLine1.trim()) {
      message.error("Please enter your street address");
      return;
    }
    if (!city.trim()) {
      message.error("Please enter your city");
      return;
    }
    if (!stateProvince.trim()) {
      message.error("Please enter your state or province");
      return;
    }
    if (!country) {
      message.error("Please select your country");
      return;
    }
    if (!zipCode.trim()) {
      message.error("Please enter your ZIP or postal code");
      return;
    }
    // Conditional ZIP validation
    const zipPattern = zipPatterns[country];
    if (zipPattern && !zipPattern.test(zipCode)) {
      message.error(
        "Please enter a valid postal code for the selected country"
      );
      return;
    }
    // --- End Validation ---

    const values: ShippingAddressValues = {
      fullName: fullName.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2?.trim() || undefined,
      city: city.trim(),
      stateProvince: stateProvince.trim(),
      zipCode: zipCode.trim(),
      country,
    };

    console.log("Shipping Address Submitted:", values);
    try {
      await onSubmit(values);
      // Optionally clear form on successful submit, depends on parent component logic
      // setFullName(""); setAddressLine1(""); ... etc.
    } catch (error) {
      console.error("Error submitting address:", error);
      // Error handling might be done in the parent component
      // or display a generic message here
      // message.error("Failed to save address.");
    }
  };

  return (
    /* Replace Form with standard form or div */
    <form onSubmit={handleSubmit}>
      {/* Full Name */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          Full Name
        </label>
        <Input
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      {/* Address Line 1 */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          Address Line 1
        </label>
        <Input
          placeholder="Street address, P.O. box, company name, c/o"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
        />
      </div>

      {/* Address Line 2 */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          Address Line 2 <span style={{ color: "#888" }}>(Optional)</span>
        </label>
        <Input
          placeholder="Apartment, suite, unit, building, floor, etc."
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
        />
      </div>

      {/* City / State-Province Row */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              City
            </label>
            <Input
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              State / Province
            </label>
            <Input
              placeholder="Enter state or province"
              value={stateProvince}
              onChange={(e) => setStateProvince(e.target.value)}
            />
          </div>
        </Col>
      </Row>

      {/* Zip / Country Row */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              ZIP / Postal Code
            </label>
            <Input
              placeholder="Enter ZIP or postal code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Country
            </label>
            {/* Use value and onChange for Select */}
            <Select
              placeholder="Select country"
              value={country}
              onChange={(value) => setCountry(value)}
            >
              {/* TODO: Populate with a real list of countries */}
              <Option value="US">United States</Option>
              <Option value="CA">Canada</Option>
              <Option value="GB">United Kingdom</Option>
              <Option value="AU">Australia</Option>
            </Select>
          </div>
        </Col>
      </Row>

      {/* Submit Button */}
      <div style={{ marginTop: "24px" }}>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default ShippingAddressForm;
