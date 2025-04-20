import React from "react";
import { Radio, Space, Typography } from "antd";
import CreditCardForm from "./CreditCardForm";

const { Text } = Typography;

/**
 * @description Interface for payment method selection props.
 */
interface PaymentMethodSelectionProps {
  selectedValue?: string;
  onChange: (value: string) => void;
  // isLoading?: boolean; // Add later if needed
}

/**
 * @description Component for selecting a payment method (Placeholder).
 * @param {PaymentMethodSelectionProps} props Component props.
 * @returns {React.FC<PaymentMethodSelectionProps>} The PaymentMethodSelection component.
 */
const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  selectedValue,
  onChange,
}) => {
  const handleRadioChange = (e: any) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <Text strong style={{ marginBottom: 16, display: "block" }}>
        Select Payment Method
      </Text>
      <Radio.Group onChange={handleRadioChange} value={selectedValue}>
        <Space direction="vertical">
          <Radio value="credit_card">Credit Card</Radio>
          <Radio value="paypal">PayPal (Placeholder)</Radio>
          {/* Add more payment options later */}
          <Radio value="stripe" disabled>
            Stripe (Coming Soon)
          </Radio>
        </Space>
      </Radio.Group>
      {/* Render Credit Card Form if selected */}
      {selectedValue === "credit_card" && <CreditCardForm />}
      {/* Placeholder for PayPal integration */}
      {selectedValue === "paypal" && (
        <div style={{ marginTop: 20, padding: 15, border: "1px dashed #ccc" }}>
          Placeholder for PayPal Button/Integration
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelection;
