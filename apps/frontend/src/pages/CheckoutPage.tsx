import React, { useState } from "react";
import {
  Layout,
  Steps,
  Button,
  message,
  Typography,
  Row,
  Col,
  Card,
  Divider,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useCartItems } from "@/contexts/CartContext"; // To check if cart is empty

// Import the actual form component
import ShippingAddressForm, {
  ShippingAddressValues,
} from "@/components/checkout/ShippingAddressForm";

// Import the new component
import PaymentMethodSelection from "@/components/checkout/PaymentMethodSelection";

// Import the actual OrderSummary component
import OrderSummary from "@/components/checkout/OrderSummary";

// Placeholder components - these will be replaced by Tasks 24, 25, 26
// const OrderSummary = () => <div>Placeholder: Order Summary (Task 26)</div>;

const { Content } = Layout;
const { Title } = Typography;
const { Step } = Steps;

const steps = [
  {
    title: "Shipping Address",
    icon: <ShoppingCartOutlined />,
  },
  {
    title: "Payment Method",
    icon: <CreditCardOutlined />,
  },
  {
    title: "Review & Place Order",
    icon: <CheckCircleOutlined />,
  },
];

/**
 * @description Checkout page component guiding user through order process.
 * @returns {React.FC} The CheckoutPage component.
 */
const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const cartItems = useCartItems();
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddressValues | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null); // State for payment method

  // Redirect if cart is empty
  React.useEffect(() => {
    if (cartItems.length === 0 && currentStep === 0) {
      message.warning("Your cart is empty. Add items before checking out.");
      navigate("/cart");
    }
  }, [cartItems, navigate, currentStep]);

  /**
   * @description Callback when ShippingAddressForm is submitted successfully.
   * @param {ShippingAddressValues} values The submitted address values.
   */
  const handleShippingSubmit = (values: ShippingAddressValues) => {
    setShippingAddress(values);
    console.log("Shipping Address saved in CheckoutPage:", values);
    next(); // Move to the next step
  };

  /**
   * @description Callback when payment method selection changes.
   * @param {string} value The selected payment method value.
   */
  const handlePaymentChange = (value: string) => {
    setPaymentMethod(value);
    console.log("Payment method selected:", value);
  };

  // --- Navigation Handlers ---
  const next = () => {
    if (currentStep === 0 && !shippingAddress) {
      message.error("Please submit your shipping address.");
      return;
    }
    if (currentStep === 1 && !paymentMethod) {
      message.error("Please select a payment method.");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !paymentMethod) {
      message.error("Please complete all previous steps.");
      if (!shippingAddress) setCurrentStep(0);
      else if (!paymentMethod) setCurrentStep(1);
      return;
    }
    // Gather all data: shippingAddress, paymentMethod, cartItems
    const orderData = {
      shippingAddress,
      paymentMethod: paymentMethod,
      items: cartItems,
      // Add total, etc.
    };
    console.log("Placing Order with data:", orderData);

    let hideLoadingMessage: (() => void) | null = null;
    try {
      hideLoadingMessage = message.loading("Placing order...", 0); // Show indefinitely until manually closed
      // --- Simulate API Call ---
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
      // const response = await placeOrderAPI(orderData); // Replace with actual API call
      // --- End Simulation ---

      if (hideLoadingMessage) hideLoadingMessage(); // Close loading message
      message.success("Order Placed Successfully! Redirecting...");
      // TODO: Clear cart? Maybe do this in confirmation page or after API success
      // clearCart();
      // Pass order details/ID to confirmation page
      navigate("/order-confirmation", { state: { orderId: "mock-12345" } }); // Example redirect
    } catch (err: any) {
      // Add type annotation for err
      console.error("Order placement error:", err);
      if (hideLoadingMessage) hideLoadingMessage(); // Ensure loading message is closed on error
      message.error(err.message || "Failed to place order. Please try again.");
    }
  };

  // Render content based on the current step
  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <ShippingAddressForm
            onSubmit={handleShippingSubmit}
            initialValues={shippingAddress || {}}
          />
        );
      case 1:
        return (
          <PaymentMethodSelection
            onChange={handlePaymentChange}
            selectedValue={paymentMethod || undefined}
          />
        );
      case 2:
        return (
          <div>
            <Title level={4} style={{ marginBottom: 16 }}>
              Review Your Order
            </Title>
            {shippingAddress && (
              <Card
                size="small"
                title="Shipping To"
                style={{ marginBottom: 16 }}
              >
                <p>{shippingAddress.fullName}</p>
                <p>{shippingAddress.addressLine1}</p>
                {shippingAddress.addressLine2 && (
                  <p>{shippingAddress.addressLine2}</p>
                )}
                <p>
                  {shippingAddress.city}, {shippingAddress.stateProvince}{" "}
                  {shippingAddress.zipCode}
                </p>
                <p>{shippingAddress.country}</p>
              </Card>
            )}
            {paymentMethod && (
              <Card
                size="small"
                title="Payment Method"
                style={{ marginBottom: 16 }}
              >
                <p>{paymentMethod.replace("_", " ").toUpperCase()}</p>
              </Card>
            )}
            {/* Use the real component here for final review */}
            <Divider>Items</Divider>
            <OrderSummary />
          </div>
        );
      default:
        return "Unknown step";
    }
  };

  // Prevent checkout if cart is empty (redundant check, but safe)
  if (cartItems.length === 0 && currentStep === 0) {
    return null; // Or a loading/redirect indicator
  }

  return (
    <Layout>
      <Content
        style={{ padding: "20px 24px", maxWidth: 1200, margin: "0 auto" }}
      >
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/cart")}
          style={{ marginBottom: 16, paddingLeft: 0 }}
        >
          Back to Cart
        </Button>
        <Title level={2} style={{ marginBottom: 24 }}>
          Checkout
        </Title>

        <Row gutter={[24, 24]}>
          {/* Main Checkout Steps Area */}
          <Col xs={24} md={16}>
            <Card>
              <Steps current={currentStep} style={{ marginBottom: 32 }}>
                {steps.map((item) => (
                  <Step key={item.title} title={item.title} icon={item.icon} />
                ))}
              </Steps>

              {/* Render the content for the current step */}
              <div
                className="steps-content"
                style={{ minHeight: "200px", marginBottom: 24 }}
              >
                {renderStepContent(currentStep)}
              </div>

              {/* Navigation Buttons */}
              <div className="steps-action" style={{ textAlign: "right" }}>
                {currentStep > 0 && (
                  <Button style={{ marginRight: 8 }} onClick={() => prev()}>
                    Previous
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button type="primary" onClick={handlePlaceOrder}>
                    Place Order
                  </Button>
                )}
                {currentStep === 1 && (
                  <Button type="primary" onClick={() => next()}>
                    Next: Review Order
                  </Button>
                )}
              </div>
            </Card>
          </Col>

          {/* Sidebar Order Summary */}
          <Col xs={24} md={8}>
            <Card title="Order Summary">
              <OrderSummary />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default CheckoutPage;
