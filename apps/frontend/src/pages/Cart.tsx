import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Game } from "@/types/game";
import {
  Button,
  Spin,
  Alert,
  Empty,
  InputNumber,
  Typography,
  Space,
  Image,
  Card,
  List,
  message,
  Row,
  Divider,
} from "antd";
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * Cart component displaying the user's shopping cart.
 * Uses Ant Design components and fetches state from CartContext using useCart hook.
 * REFRACTORED to use useCart hook with selectors.
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
  // Select actions
  const removeItem = useCart((state) => state.removeItem);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const clearCart = useCart((state) => state.clearCart);

  // If cartItems is undefined (initial state before cart is loaded), treat as empty
  const items = cartItems ?? [];

  // Recalculate totalPrice - Remove dependency on item.game
  // NOTE: This might become inaccurate if cart object doesn't include total directly
  // We might need to fetch product details separately or adjust context value
  const totalPrice = useCart((state) => state.cart?.total_price ?? 0); // Assuming total_price exists on cart

  // --- Action Handlers ---
  // Pass game_id directly
  const handleQuantityChange = async (gameId: string, quantity: number) => {
    if (!quantity || quantity < 1) return;
    try {
      await updateQuantity(gameId, quantity);
      message.success("Quantity updated");
    } catch (err) {
      message.error("Failed to update quantity");
      console.error("Update quantity error:", err);
    }
  };

  // Pass game_id directly
  const handleRemoveItem = async (gameId: string) => {
    try {
      await removeItem(gameId);
      // Removed title from success message as it's not available
      message.success(`Item removed from cart`);
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
        renderItem={(item) => {
          // Use game_id as key and for display purposes
          const gameId = String(item.game_id);
          const itemSubtotal = (item.price_at_purchase ?? 0) * item.quantity; // Assuming price_at_purchase exists

          return (
            <List.Item
              key={gameId}
              className="bg-white p-4 rounded-lg shadow mb-4"
              actions={[
                <InputNumber
                  key="quantity"
                  min={1}
                  max={10}
                  value={item.quantity}
                  onChange={(value) => handleQuantityChange(gameId, value ?? 1)}
                  style={{ width: 60 }}
                  disabled={isMutating}
                  aria-label={`Quantity for item ${gameId}`}
                />,
                <Text
                  strong
                  key="subtotal"
                  style={{ minWidth: 80, textAlign: "right" }}
                >
                  {/* Display calculated item subtotal if available */}$
                  {itemSubtotal.toFixed(2)}
                </Text>,
                <Button
                  key="remove"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveItem(gameId)} // Pass gameId directly
                  disabled={isMutating}
                  aria-label={`Remove item ${gameId}`}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Image
                    width={80}
                    height={80}
                    // Generic placeholder image
                    src={`https://cataas.com/cat/says/item-${gameId}?width=80&height=80`}
                    alt={`Item ${gameId}`}
                    preview={false}
                    style={{ objectFit: "cover", borderRadius: "4px" }}
                    fallback="https://via.placeholder.com/80?text=Item"
                  />
                }
                // Display game_id instead of title
                title={`Item ID: ${gameId}`}
                // Display price_at_purchase if available
                description={`Price: $${(item.price_at_purchase ?? 0).toFixed(2)} each`}
              />
            </List.Item>
          );
        }}
      />

      <Card className="mt-8 shadow">
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Row justify="space-between">
            <Text>Subtotal ({totalItems} items)</Text>
            {/* Assuming totalPrice from context is accurate */}
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
            onClick={() => navigate("/checkout")} // Navigate to checkout
            disabled={items.length === 0 || isMutating} // Disable if empty or mutating
            style={{ marginTop: 16 }}
          >
            Proceed to Checkout
          </Button>
          <Button
            type="default"
            danger
            block
            onClick={handleClearCart}
            disabled={isMutating || items.length === 0} // Disable if empty or mutating
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
