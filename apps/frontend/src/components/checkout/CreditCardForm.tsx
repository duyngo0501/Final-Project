import React from "react";
import { Form, Input, Row, Col, DatePicker } from "antd";

/**
 * @description Interface for credit card form values.
 */
export interface CreditCardValues {
  cardNumber: string;
  expiryDate: string; // Store as MM/YY string or handle Moment object
  cvc: string;
  nameOnCard: string;
}

/**
 * @description Props for the CreditCardForm component.
 */
interface CreditCardFormProps {
  // We don't need initialValues or onSubmit for this placeholder version
  // Add props later if it needs to interact (e.g., for validation state)
}

/**
 * @description A placeholder form component for entering credit card details.
 * Contains basic fields but no validation or submission logic.
 * @param {CreditCardFormProps} props Component props.
 * @returns {React.FC<CreditCardFormProps>} The CreditCardForm component.
 */
const CreditCardForm: React.FC<CreditCardFormProps> = (props) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      name="credit_card_details"
      requiredMark="optional"
      style={{
        marginTop: 20,
        padding: "20px 15px",
        border: "1px solid #f0f0f0",
        borderRadius: "4px",
      }}
    >
      <Form.Item
        name="nameOnCard"
        label="Name on Card"
        rules={[
          { required: true, message: "Please enter the name on the card" },
        ]}
      >
        <Input placeholder="Enter name as it appears on card" />
      </Form.Item>

      <Form.Item
        name="cardNumber"
        label="Card Number"
        rules={[{ required: true, message: "Please enter your card number" }]}
      >
        <Input placeholder="Enter 16-digit card number" />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={12} sm={12}>
          <Form.Item
            name="expiryDate"
            label="Expiry Date"
            rules={[
              { required: true, message: "Please enter the expiry date" },
            ]}
          >
            {/* Using DatePicker for simplicity, format might need adjustment */}
            <DatePicker
              picker="month"
              format="MM/YY"
              style={{ width: "100%" }}
              placeholder="MM/YY"
            />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12}>
          <Form.Item
            name="cvc"
            label="CVC"
            rules={[{ required: true, message: "Please enter the CVC code" }]}
          >
            <Input placeholder="Enter 3 or 4 digit CVC" />
          </Form.Item>
        </Col>
      </Row>
      {/* This form doesn't submit on its own; data is collected by parent */}
    </Form>
  );
};

export default CreditCardForm;
