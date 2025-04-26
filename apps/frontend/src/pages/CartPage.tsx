import React from "react";
import { Link } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Typography,
  Button,
  List,
  InputNumber,
  Avatar,
  Spin,
  Alert,
  Card,
  Divider,
  Empty,
  Space,
  Image,
  message,
} from "antd";
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useCart } from "@/contexts/CartContext";
import { CartItemResponseSchema } from "@/gen/types";

const { Content } = Layout;
const { Title, Text } = Typography;

/**
 * @description Displays the user's shopping cart, allows item management,
 * shows price summary, and provides a checkout button.
 * @returns {React.FC} The CartPage component.
 */
const CartPage: React.FC = () => {
  const {
    cart,
    isLoading,
    error,
    totalItems,
    isMutating,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  // Calculate total price locally - Requires fetching game details
  // TODO: Implement fetching/accessing game details to calculate price
  const totalPrice = React.useMemo(() => {
    // Cannot calculate without price info from game details.
    return 0; // Returning 0 for now
  }, [cart]);

  const handleQuantityChange = async (
    item: CartItemResponseSchema,
    quantity: number
  ) => {
    if (!quantity || quantity < 1) return; // Prevent invalid quantities
    try {
      // Context action expects game_id (number)
      await updateQuantity(Number(item.game_id), quantity);
      message.success("Quantity updated");
    } catch (err) {
      message.error("Failed to update quantity");
      console.error("Update quantity error:", err);
    }
  };

  const handleRemoveItem = async (item: CartItemResponseSchema) => {
    try {
      // Context action expects game_id (number)
      await removeItem(Number(item.game_id));
      // Need game title for message - fetch it or show generic message
      message.success(`Item removed from cart`); // Generic message
    } catch (err) {
      message.error("Failed to remove item");
      console.error("Remove item error:", err);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      message.success("Cart cleared");
    } catch (err) {
      message.error("Failed to clear cart");
      console.error("Clear cart error:", err);
    }
  };

  // Calculate totals
  const subtotal = totalPrice;
  // Placeholder calculations
  const estimatedTax = subtotal * 0.08;
  const shippingCost = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + estimatedTax + shippingCost;

  if (isLoading) {
    return (
      <Content style={{ padding: "50px", textAlign: "center" }}>
        <Spin size="large" tip="Loading Cart..." />
      </Content>
    );
  }

  if (error) {
    return (
      <Content style={{ padding: "50px" }}>
        <Alert
          message="Error loading cart"
          description={error.message || "Please try again."}
          type="error"
          showIcon
        />
      </Content>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Content style={{ padding: "50px", textAlign: "center" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text>Your cart is empty.</Text>}
        >
          <Link to="/games">
            <Button type="primary" icon={<ShoppingCartOutlined />}>
              Start Shopping
            </Button>
          </Link>
        </Empty>
      </Content>
    );
  }

  return (
    <Layout style={{ padding: "24px 0", background: "#fff" }}>
      <Content style={{ padding: "0 50px" }}>
        <Title level={2} style={{ marginBottom: "24px" }}>
          Your Shopping Cart
        </Title>
        <Row gutter={[24, 24]}>
          {/* Cart Items Column */}
          <Col xs={24} lg={16}>
            <List
              itemLayout="horizontal"
              dataSource={cart?.items ?? []}
              renderItem={(item: CartItemResponseSchema) => {
                // Cannot display price/details without fetching game info
                const price = 0; // Placeholder
                const thumbnailUrl = `/placeholder-image.jpg`; // Placeholder

                return (
                  <List.Item
                    actions={[
                      <InputNumber
                        min={1}
                        max={10} // Or stock limit
                        value={item.quantity}
                        onChange={(value) =>
                          handleQuantityChange(item, value || 1)
                        }
                        disabled={isMutating}
                        style={{ width: 60, marginRight: 16 }}
                      />,
                      <Text
                        strong
                        style={{ minWidth: "80px", textAlign: "right" }}
                      >
                        ${(price * item.quantity).toFixed(2)}
                      </Text>,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item)}
                        disabled={isMutating}
                        aria-label={`Remove item ${item.game_id}`}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Image
                          src={thumbnailUrl}
                          alt={`Game ${item.game_id}`}
                          width={80}
                          height={80}
                          style={{ objectFit: "cover" }}
                          preview={false}
                          fallback="/placeholder-image.jpg"
                        />
                      }
                      title={
                        <Link to={`/games/${item.game_id}`}>
                          {/* TODO: Display Game Title (needs fetching) */}
                          Game ID: {item.game_id}
                        </Link>
                      }
                      description={`$${price.toFixed(2)} each`}
                    />
                  </List.Item>
                );
              }}
            />
          </Col>

          {/* Summary Column */}
          <Col xs={24} lg={8}>
            <Card title="Order Summary">
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <Row justify="space-between">
                  <Text>Subtotal ({totalItems} items)</Text>
                  <Text strong>${totalPrice.toFixed(2)}</Text>
                </Row>
                <Row justify="space-between">
                  <Text>Estimated Tax:</Text>
                  <Text>${estimatedTax.toFixed(2)}</Text>
                </Row>
                <Row justify="space-between" style={{ marginBottom: 16 }}>
                  <Text>Shipping:</Text>
                  <Text>
                    {shippingCost === 0
                      ? "Free"
                      : `$${shippingCost.toFixed(2)}`}
                  </Text>
                </Row>
                <Divider style={{ margin: "12px 0" }} />
                <Row justify="space-between">
                  <Text strong style={{ fontSize: "1.2em" }}>
                    Total
                  </Text>
                  <Text strong style={{ fontSize: "1.2em" }}>
                    ${total.toFixed(2)}
                  </Text>
                </Row>
                <Button
                  type="primary"
                  block
                  size="large"
                  disabled // Checkout not implemented
                  style={{ marginTop: "16px" }}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  type="default"
                  block
                  danger
                  onClick={handleClearCart}
                  disabled={isMutating}
                  loading={isMutating}
                >
                  Clear Cart
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default CartPage;
