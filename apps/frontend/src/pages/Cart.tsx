import React, { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import {
  Button,
  Spin,
  Alert,
  Empty,
  Typography,
  Space,
  Card,
  List,
  message,
  Row,
  Divider,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import CartItemComponent from "@/components/cart/CartItem";

const { Title, Text } = Typography;

/**
 * Cart component displaying the user's shopping cart.
 * Uses Ant Design components and fetches state from CartContext using useCart hook.
 * REFRACTORED to use useCart hook with selectors and CartItem component.
 * @returns {JSX.Element} The rendered cart component.
 */
const Cart = (): JSX.Element => {
  const navigate = useNavigate();

  // Select necessary state pieces using useCart hook with selectors
  const cartItems = useCart((state) => state.cart?.items);
  const isLoading = useCart((state) => state.isLoading);
  const isMutating = useCart((state) => state.isMutating);
  const error = useCart((state) => state.error);
  const totalItems = useCart((state) => state.totalItems);
  const clearCart = useCart((state) => state.clearCart);

  // If cartItems is undefined (initial state before cart is loaded), treat as empty
  const items = cartItems ?? [];

  // Recalculate total price locally
  const totalPrice = useMemo(() => {
    console.log("[Cart.tsx] Recalculating totalPrice. Items:", items);
    return items.reduce((sum, item) => {
      // Access price via nested game object, handle potential null/undefined
      const price = item.game?.price ?? 0;
      console.log(
        `[Cart.tsx] Item ID: ${item.id}, Game Price: ${item.game?.price}, Quantity: ${item.quantity}, Calculated Price: ${price}`
      );
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  const handleClearCart = async () => {
    try {
      await clearCart();
      message.success("Cart cleared");
    } catch (err) {
      message.error("Failed to clear cart");
      console.error("Clear cart error:", err);
    }
  };

  // --- Render Logic ---

  if (isLoading && items.length === 0) {
    // Show loading only on initial load
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Cart"
        description={
          typeof error === "object" && error?.message
            ? error.message
            : "Please try refreshing."
        }
        type="error"
        showIcon
        className="my-8"
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <>
              <Title level={4}>Your Cart is Empty</Title>
              <Text type="secondary">
                Looks like you haven't added any games yet.
              </Text>
            </>
          }
        >
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/games")}
            icon={<ShoppingCartOutlined />}
          >
            Browse Games
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-8">
        Shopping Cart ({totalItems} items)
      </Title>

      <List
        itemLayout="horizontal"
        dataSource={items}
        renderItem={(item) => <CartItemComponent item={item} key={item.id} />}
      />

      <Card className="mt-8 shadow">
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Row justify="space-between">
            <Text>Subtotal ({totalItems} items)</Text>
            <Text strong>${totalPrice.toFixed(2)}</Text>
          </Row>
          <Divider style={{ margin: "12px 0" }} />
          <Row justify="space-between">
            <Text strong className="text-xl">
              Total Price:
            </Text>
            <Text strong className="text-xl">
              ${totalPrice.toFixed(2)}
            </Text>
          </Row>
          <Button
            type="primary"
            size="large"
            block
            onClick={() => navigate("/checkout")}
            disabled={items.length === 0 || isMutating}
            style={{ marginTop: 16 }}
          >
            Proceed to Checkout
          </Button>
          <Button
            type="default"
            danger
            block
            onClick={handleClearCart}
            disabled={isMutating || items.length === 0}
            loading={isMutating}
          >
            Clear Cart
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Cart;
