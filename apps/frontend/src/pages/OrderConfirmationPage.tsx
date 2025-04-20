import React from "react";
import { Layout, Result, Button, Typography, Card, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SmileOutlined,
  HomeOutlined,
  ProfileOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

/**
 * @description Interface for the location state passed from CheckoutPage.
 */
interface ConfirmationLocationState {
  orderId?: string;
}

/**
 * @description Page displayed after successfully placing an order.
 * Shows confirmation details and links.
 * @returns {React.FC} The OrderConfirmationPage component.
 */
const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ConfirmationLocationState | null;
  const orderId = state?.orderId;

  // TODO: Optionally fetch full order details using orderId
  // const { orderDetails, isLoading, error } = useOrderDetails(orderId);

  // Placeholder for loading state if fetching details
  // if (isLoading) {
  //   return <Layout style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" tip="Loading Order Details..." /></Layout>;
  // }

  // Placeholder for error state
  // if (error || !orderDetails) {
  //   return <Result status="error" title="Failed to load order details" subTitle="Please check your order history or contact support."/>
  // }

  return (
    <Layout>
      <Content
        style={{
          padding: "50px 24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Result
          icon={<SmileOutlined />}
          status="success"
          title="Your Order Has Been Placed Successfully!"
          subTitle={
            orderId
              ? `Order Number: ${orderId}. You will receive an email confirmation shortly.`
              : "Thank you for your purchase! You will receive an email confirmation shortly."
          }
          extra={[
            <Button
              type="primary"
              key="continue"
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </Button>,
            <Button
              key="orders"
              icon={<ProfileOutlined />}
              onClick={() => navigate("/account/orders")}
              disabled
            >
              {" "}
              {/* TODO: Enable when order history exists */}
              View Orders
            </Button>,
          ]}
        />
        {/* Optionally display a summary of the placed order below */}
        {/* 
             <Card title="Order Summary" style={{ marginTop: 30, maxWidth: 600, width: '100%' }}>
                 <p>Order ID: {orderId}</p>
                 <p>Estimated Delivery: [Date Placeholder]</p>
                 <p>Items: [Placeholder for item list]</p>
                 <p>Total: [Placeholder for total]</p>
             </Card>
             */}
      </Content>
    </Layout>
  );
};

export default OrderConfirmationPage;
