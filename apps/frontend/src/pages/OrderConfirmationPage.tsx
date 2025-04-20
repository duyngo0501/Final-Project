import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Layout, Result, Button, Card, Typography, Divider } from "antd";

const { Content } = Layout;
const { Title, Text } = Typography;

/**
 * @description Page displayed after a successful order placement.
 * Shows a confirmation message, order ID, and navigation options.
 * @returns {React.FC} The OrderConfirmationPage component.
 */
const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const orderId = location.state?.orderId as string | undefined;

  // In a real app, you might fetch full order details using the orderId here

  return (
    <Content style={{ padding: "50px", maxWidth: 800, margin: "auto" }}>
      <Result
        status="success"
        title="Order Placed Successfully!"
        subTitle={
          orderId
            ? `Your Order ID: ${orderId}. Thank you for your purchase.`
            : "Thank you for your purchase."
        }
        extra={[
          <Link to="/games" key="continue">
            <Button type="primary">Continue Shopping</Button>
          </Link>,
          <Link to="/profile/orders" key="view_orders">
            <Button>View My Orders</Button>
          </Link>,
          // Optional: Add Track Order button if applicable
        ]}
      />

      {/* Optional: Display a brief summary if needed */}
      {/* 
      <Card title="Order Summary Snapshot" style={{ marginTop: 32 }}>
        <Text>Order ID: {orderId || 'N/A'}</Text>
        <Divider />
        <Text>Estimated Delivery: [Placeholder Date]</Text>
        <Divider />
        <Link to={`/profile/orders/${orderId}`}>View Full Order Details</Link>
      </Card>
      */}
    </Content>
  );
};

export default OrderConfirmationPage;
