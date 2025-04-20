import React, { useState } from "react";
import { Input, Row, Col, DatePicker, message } from "antd";
import type { Dayjs } from "dayjs";

/**
 * @description Interface for credit card form values.
 */
export interface CreditCardValues {
  cardNumber: string;
  expiryDate: string; // Store as MM/YY string
  cvc: string;
  nameOnCard: string;
}

/**
 * @description Props for the CreditCardForm component.
 */
interface CreditCardFormProps {
  // Keep props minimal for now, add if needed for parent interaction
  // e.g., onValuesChange?: (values: Partial<CreditCardValues>) => void;
}

/**
 * @description A placeholder form component for entering credit card details using useState.
 * Contains basic fields but no validation or submission logic.
 * State is managed internally; parent interaction might require additional props.
 * @param {CreditCardFormProps} props Component props.
 * @returns {React.FC<CreditCardFormProps>} The CreditCardForm component.
 */
const CreditCardForm: React.FC<CreditCardFormProps> = (props) => {
  // Removed Form.useForm();

  // State for form fields
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState<Dayjs | null>(null); // Use Dayjs for DatePicker state
  const [cvc, setCvc] = useState("");

  // --- Optional: Handler to notify parent of changes ---
  // useEffect(() => {
  //   if (props.onValuesChange) {
  //     props.onValuesChange({
  //        nameOnCard,
  //        cardNumber,
  //        expiryDate: expiryDate ? expiryDate.format("MM/YY") : "",
  //        cvc
  //     });
  //   }
  // }, [nameOnCard, cardNumber, expiryDate, cvc, props.onValuesChange]);
  // -----------------------------------------------------

  // This component doesn't have its own submit, parent handles it.
  // We can add internal validation display if needed.

  return (
    /* Use a simple div wrapper instead of Form */
    <div
      style={{
        marginTop: 20,
        padding: "20px 15px",
        border: "1px solid #f0f0f0",
        borderRadius: "4px",
      }}
    >
      {/* Name on Card */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          Name on Card
        </label>
        <Input
          placeholder="Enter name as it appears on card"
          value={nameOnCard}
          onChange={(e) => setNameOnCard(e.target.value)}
        />
      </div>

      {/* Card Number */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          Card Number
        </label>
        <Input
          placeholder="Enter 16-digit card number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))} // Allow only digits
          maxLength={16} // Basic length check
        />
      </div>

      <Row gutter={16}>
        <Col xs={12} sm={12}>
          {/* Expiry Date */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Expiry Date
            </label>
            <DatePicker
              picker="month"
              format="MM/YY"
              style={{ width: "100%" }}
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(date) => setExpiryDate(date)} // date is Dayjs | null
            />
          </div>
        </Col>
        <Col xs={12} sm={12}>
          {/* CVC */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>CVC</label>
            <Input
              placeholder="Enter 3 or 4 digit CVC"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))} // Allow only digits
              maxLength={4}
            />
          </div>
        </Col>
      </Row>
      {/* No submit button, as parent likely handles submission */}
    </div>
  );
};

export default CreditCardForm;
