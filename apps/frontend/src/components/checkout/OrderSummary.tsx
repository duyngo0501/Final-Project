import React from "react";
import { List, Typography, Divider, Space, Row, Col } from "antd";
import { useCartItems } from "@/contexts/CartContext";
import { formatCurrency } from "@/utils/helpers";
import { CartItem } from "@/services/api";

const { Text, Title } = Typography;

/**
 * @description Interface for OrderSummary props (if any needed later).
 */
interface OrderSummaryProps {
  // Props like showImages, etc. could be added later if needed
}

/**
 * @description Component displaying a summary of items in the cart and the total cost.
 * Typically used in checkout or review steps.
 * @param {OrderSummaryProps} props Component props.
 * @returns {React.FC<OrderSummaryProps>} The OrderSummary component.
 */
const OrderSummary: React.FC<OrderSummaryProps> = (props) => {
  const items = useCartItems();

  // Calculate total price directly from items
  const cartTotal = React.useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.game.discountedPrice ?? item.game.price;
      return total + price * item.quantity;
    }, 0);
  }, [items]);

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Title level={5} style={{ marginBottom: 0 }}>
        Items in Cart:
      </Title>
      <List
        itemLayout="horizontal"
        dataSource={items}
        size="small"
        renderItem={(item: CartItem) => {
          const price = item.game.discountedPrice ?? item.game.price;
          const subtotal = price * item.quantity;
          return (
            <List.Item key={item.game.id}>
              <List.Item.Meta
                // Optional: Add small thumbnail?
                // avatar={<Avatar src={item.game.thumbnail} />}
                title={item.game.title}
                description={`${item.quantity} x ${formatCurrency(price)}`}
              />
              <Text strong>{formatCurrency(subtotal)}</Text>
            </List.Item>
          );
        }}
      />
      <Divider style={{ margin: "12px 0" }} />
      {/* Add rows for Subtotal, Shipping, Tax if needed */}
      <Row justify="space-between">
        <Text>Subtotal</Text>
        <Text>{formatCurrency(cartTotal)}</Text>
      </Row>
      <Row justify="space-between">
        <Text>Shipping</Text>
        <Text>FREE</Text> {/* Placeholder */}
      </Row>
      <Row justify="space-between">
        <Text>Tax</Text>
        <Text>Calculated at next step</Text> {/* Placeholder */}
      </Row>
      <Divider style={{ margin: "12px 0" }} />
      <Row justify="space-between">
        <Title level={4} style={{ margin: 0 }}>
          Order Total
        </Title>
        <Title level={4} style={{ margin: 0 }}>
          {formatCurrency(cartTotal)}
        </Title>{" "}
        {/* Final total */}
      </Row>
    </Space>
  );
};

export default OrderSummary;
