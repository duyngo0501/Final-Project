import React from "react";
import { Radio, Space, Typography, Card } from "antd";
import { CreditCardOutlined, AlipayCircleOutlined } from "@ant-design/icons";
import type { RadioChangeEvent } from "antd";

const { Text } = Typography;
const { Paragraph } = Typography;

/**
 * @description Interface for payment method selection props.
 */
interface PaymentMethodSelectionProps {
  /**
   * Callback function executed when the payment method selection changes.
   * @param {string} value The value of the selected payment method.
   */
  onChange: (value: string) => void;
  /**
   * The currently selected payment method value.
   */
  selectedValue?: string;
}

/**
 * @description Component for selecting a payment method during checkout.
 * @param {PaymentMethodSelectionProps} props Component props.
 * @returns {React.FC<PaymentMethodSelectionProps>} The PaymentMethodSelection component.
 */
const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  onChange,
  selectedValue,
}) => {
  const handleRadioChange = (e: RadioChangeEvent) => {
    onChange(e.target.value);
  };

  return (
    <Radio.Group
      onChange={handleRadioChange}
      value={selectedValue}
      style={{ width: "100%" }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Card
          hoverable
          style={
            selectedValue === "credit_card" ? { borderColor: "#1890ff" } : {}
          }
        >
          <Radio value="credit_card">
            <Space>
              <CreditCardOutlined style={{ fontSize: "1.5em" }} />
              <Text strong>Credit Card</Text>
            </Space>
            <Paragraph
              type="secondary"
              style={{ marginLeft: 32, marginBottom: 0 }}
            >
              Pay with Visa, Mastercard, Amex, etc.
            </Paragraph>
          </Radio>
        </Card>

        <Card
          hoverable
          style={selectedValue === "paypal" ? { borderColor: "#1890ff" } : {}}
        >
          <Radio value="paypal">
            <Space>
              <AlipayCircleOutlined style={{ fontSize: "1.5em" }} />
              <Text strong>PayPal</Text>
            </Space>
            <Paragraph
              type="secondary"
              style={{ marginLeft: 32, marginBottom: 0 }}
            >
              Pay securely using your PayPal account.
            </Paragraph>
          </Radio>
        </Card>
        {/* Add more payment options here */}
      </Space>
    </Radio.Group>
  );
};

export default PaymentMethodSelection;
