import React, { useState } from "react";
import { List, Card, Typography, Spin, Alert, Empty, Tag, Modal } from "antd";
import { OrderSummary } from "@/gen/types"; // Import the OrderSummary type
import type { HTTPValidationError } from "@/gen/types"; // Try importing this type from types
// Import the placeholder for the detail view component
import OrderDetailView from "./OrderDetailView"; // Adjust path if needed

const { Text, Paragraph } = Typography;

interface OrderHistoryProps {
  orders: OrderSummary[] | undefined;
  isLoading: boolean;
  // Accept the raw error type from the hook
  error: HTTPValidationError | Error | null | undefined; // Use imported type + standard Error
}

/**
 * @description Displays a list of past orders, allowing users to view details.
 * @param {OrderHistoryProps} props Component props.
 * @returns {React.ReactElement} The rendered order history list and detail modal.
 */
const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  isLoading,
  error,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedOrderId(null);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    // Try to extract a meaningful message from the error object
    let errorMessage = "Failed to load order history. Please try again later.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === "object" && "detail" in error) {
      // Attempt to handle HTTPValidationError structure if possible
      if (Array.isArray(error.detail)) {
        errorMessage = error.detail
          .map((d: any) => `${d.loc?.join(".") || "field"}: ${d.msg}`)
          .join(", ");
      } else if (typeof error.detail === "string") {
        errorMessage = error.detail;
      }
    }

    return (
      <Alert
        message="Error Loading Orders"
        description={errorMessage}
        type="error"
        showIcon
      />
    );
  }

  if (!orders || orders.length === 0) {
    return <Empty description="You have no past orders." />;
  }

  return (
    <>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
        dataSource={orders}
        renderItem={(order) => (
          <List.Item key={order.id}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => handleViewDetails(order.id)} 
              style={{ cursor: 'pointer' }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <Text strong>Order #{order.id.substring(0, 8)}</Text>
                <Tag
                  color={
                    order.status === "delivered"
                      ? "green"
                      : order.status === "cancelled"
                        ? "red"
                        : "blue"
                  }
                  style={{ textTransform: "capitalize" }}
                >
                  {order.status}
                </Tag>
              </div>
              <Paragraph type="secondary">
                Placed on: {new Date(order.order_date).toLocaleDateString()}
              </Paragraph>
              <Paragraph>
                Total: <Text strong>${order.total_amount.toFixed(2)}</Text> (
                {order.item_count} items)
              </Paragraph>
            </Card>
          </List.Item>
        )}
      />

      {/* Order Detail Modal */}
      <Modal
        title={`Order Details (#${selectedOrderId?.substring(0, 8) || ''})`}
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedOrderId && (
          <OrderDetailView orderId={selectedOrderId} />
        )}
      </Modal>
    </>
  );
};

export default OrderHistory;
