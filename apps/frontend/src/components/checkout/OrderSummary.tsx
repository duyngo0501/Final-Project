import React from "react";
import {
  Card,
  List,
  Avatar,
  Typography,
  Divider,
  Row,
  Col,
  Spin,
  Alert,
} from "antd";
import { CartContext } from "@/contexts/CartContext";
import { useContextSelector } from "use-context-selector";

const { Title, Text } = Typography;

/**
 * @description Displays a summary of the order including items and totals.
 * Fetches cart data using CartContext.
 * @returns {React.FC} The OrderSummary component.
 */
const OrderSummary: React.FC = () => {
  // Select necessary state from CartContext
  const items = useContextSelector(CartContext, (v) => v?.cart?.items ?? []);
  const isLoading = useContextSelector(
    CartContext,
    (v) => v?.isLoading ?? false
  );
  const error = useContextSelector(CartContext, (v) => v?.error ?? null);

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) =>
      sum + (item.game.discountedPrice ?? item.game.price) * item.quantity,
    0
  );
  const estimatedTax = subtotal * 0.08; // Placeholder 8% tax
  const shippingCost = subtotal >= 50 ? 0 : 5.99; // Placeholder shipping logic
  const total = subtotal + estimatedTax + shippingCost;

  if (isLoading) {
    return (
      <Card title="Order Summary">
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Order Summary">
        <Alert message="Error loading cart summary" type="error" showIcon />
      </Card>
    );
  }

  return (
    <Card title="Order Summary">
      <List
        dataSource={items}
        itemLayout="horizontal"
        size="small"
        renderItem={(item) => (
          <List.Item key={item.game.id}>
            <List.Item.Meta
              avatar={<Avatar src={item.game.thumbnail} shape="square" />}
              title={item.game.title}
              description={`Qty: ${item.quantity}`}
            />
            <Text>
              $$
              {(
                (item.game.discountedPrice ?? item.game.price) * item.quantity
              ).toFixed(2)}
            </Text>
          </List.Item>
        )}
        style={{ marginBottom: 16, maxHeight: 200, overflowY: "auto" }} // Limit height and scroll
      />
      <Divider style={{ margin: "12px 0" }} />
      <Row justify="space-between">
        <Text>Subtotal:</Text>
        <Text>${subtotal.toFixed(2)}</Text>
      </Row>
      <Row justify="space-between">
        <Text>Estimated Tax:</Text>
        <Text>${estimatedTax.toFixed(2)}</Text>
      </Row>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Text>Shipping:</Text>
        <Text>
          {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
        </Text>
      </Row>
      <Divider style={{ margin: "12px 0" }} />
      <Row justify="space-between">
        <Text strong style={{ fontSize: "1.1em" }}>
          Total:
        </Text>
        <Text strong style={{ fontSize: "1.1em" }}>
          ${total.toFixed(2)}
        </Text>
      </Row>
    </Card>
  );
};

export default OrderSummary;
