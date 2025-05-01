import React, { useState } from "react";
import {
  Layout,
  Steps,
  Button,
  Card,
  Typography,
  Row,
  Col,
  message,
  Alert,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import ShippingAddressForm, {
  ShippingAddressValues,
} from "@/components/checkout/ShippingAddressForm";
import PaymentMethodSelection from "@/components/checkout/PaymentMethodSelection";
import OrderSummary from "@/components/checkout/OrderSummary";
import { CartContext } from "@/contexts/CartContext";
import { useContextSelector } from "use-context-selector";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderControllerCreateOrder } from "@/gen/query/OrdersHooks";
import type { OrderCreate, OrderResponse } from "@/gen/types";

const { Content } = Layout;
const { Title } = Typography;
const { Step } = Steps;

const steps = [
  {
    title: "Shipping Address",
    content: "Shipping-Address-Content", // Placeholder
  },
  {
    title: "Payment Method",
    content: "Payment-Method-Content", // Placeholder
  },
  {
    title: "Review Order",
    content: "Order-Review-Content", // Placeholder
  },
];

/**
 * @description Multi-step checkout page.
 * @returns {React.FC} The CheckoutPage component.
 */
const CheckoutPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddressValues | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const navigate = useNavigate();
  const cartItems = useContextSelector(
    CartContext,
    (v) => v?.cart?.items ?? []
  );
  const clearCartAction = useContextSelector(CartContext, (v) => v?.clearCart);
  const user = useAuth((state) => state.user);

  const { trigger: createOrder, isMutating: isPlacingOrder } =
    useOrderControllerCreateOrder();

  // Redirect if cart is empty on initial load or if user navigates back
  React.useEffect(() => {
    if (cartItems.length === 0) {
      message.warning("Your cart is empty. Add items before checking out.", 3);
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const next = () => {
    // Add validation before proceeding
    // Remove check for step 0, as form submission handles it
    // if (currentStep === 0 && !shippingAddress) {
    //   message.error("Please submit your shipping address.");
    //   return;
    // }
    if (currentStep === 1 && !paymentMethod) {
      message.error("Please select a payment method.");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleShippingSubmit = (values: ShippingAddressValues) => {
    setShippingAddress(values);
    console.log("Shipping Address saved:", values);
    next(); // Proceed to next step
  };

  const handlePaymentChange = (value: string) => {
    setPaymentMethod(value);
    console.log("Payment method selected:", value);
    // In a real app, you might fetch payment details or validate here
  };

  const handlePlaceOrder = async () => {
    if (!user || !user.email) {
      message.error("User not found or email missing. Cannot place order.", 5);
      return;
    }

    if (!shippingAddress || !paymentMethod) {
      message.error("Missing shipping or payment details.");
      return;
    }

    const orderApiData: OrderCreate = {
      customer_email: user.email,
    };

    let hideLoading: (() => void) | null = message.loading(
      "Placing order...",
      0
    );

    try {
      const response = await createOrder(orderApiData);

      console.log("Order Placed Successfully:", response.data);

      if (hideLoading) hideLoading();
      message.success("Order Placed Successfully! Redirecting...", 2);

      if (typeof clearCartAction === "function") {
        try {
          await clearCartAction();
        } catch (clearError) {
          console.error("Failed to clear cart:", clearError);
          message.warning(
            "Order placed, but failed to clear cart automatically."
          );
        }
      } else {
        console.warn("clearCart action not found or not a function in context");
      }

      // Redirect to landing page after successful order
      navigate("/", {
        // Remove state, no need to pass orderId to landing page
        // state: { orderId: response.data.id },
      });
    } catch (error: any) {
      console.error("Place order error:", error);
      if (hideLoading) hideLoading();
      const detail = (error as any)?.response?.data?.detail;
      const msg =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : undefined;
      message.error(
        detail || msg || "Failed to place order. Please try again."
      );
    }
  };

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <ShippingAddressForm
            onSubmit={handleShippingSubmit}
            initialValues={shippingAddress || undefined} // Pass existing address if available
            submitButtonText="Continue to Payment"
          />
        );
      case 1:
        return (
          <PaymentMethodSelection
            onChange={handlePaymentChange}
            selectedValue={paymentMethod || undefined}
          />
          // We might move the "Next" button inside this component or handle it differently
        );
      case 2:
        // Display Order Summary and collected details for review
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Title level={4}>Shipping Address</Title>
              {shippingAddress ? (
                <Card size="small">
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
              ) : (
                <Alert message="Shipping address not set" type="warning" />
              )}
              <Title level={4} style={{ marginTop: 16 }}>
                Payment Method
              </Title>
              {paymentMethod ? (
                <Card size="small">
                  <p>{paymentMethod.replace("_", " ").toUpperCase()}</p>
                  {/* Add more details if collected */}
                </Card>
              ) : (
                <Alert message="Payment method not selected" type="warning" />
              )}
            </Col>
            <Col xs={24} md={12}>
              <OrderSummary />
            </Col>
          </Row>
        );
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <Content style={{ padding: "20px 50px", maxWidth: 1000, margin: "auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
        Checkout
      </Title>
      <Steps current={currentStep} style={{ marginBottom: 40 }}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <Card style={{ minHeight: 300 }}>
        {/* Render content based on current step */}
        {renderStepContent(currentStep)}
      </Card>

      <div style={{ marginTop: 24, textAlign: "right" }}>
        {currentStep > 0 && !isPlacingOrder && (
          <Button
            style={{ marginRight: 8 }}
            onClick={prev}
            disabled={isPlacingOrder}
          >
            Previous
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={next} disabled={isPlacingOrder}>
            Next
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button
            type="primary"
            onClick={handlePlaceOrder}
            loading={isPlacingOrder}
          >
            Place Order
          </Button>
        )}
      </div>
    </Content>
  );
};

export default CheckoutPage;
