import React, { useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "@/contexts/CartContext";
import { Game } from "@/types/game";
import { CartItem } from "@/services/api";
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
 * Uses Ant Design components and fetches state from CartContext.
 * REFRACTORED to use direct context access and correct types.
 * @returns {JSX.Element} The rendered cart component.
 */
const Cart = (): JSX.Element => {
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    return <Spin tip="Loading Cart Context..." fullscreen />;
  }

  const {
    cart,
    isLoading,
    error,
    totalItems,
    isMutating,
    removeItem,
    updateQuantity,
    clearCart,
  } = cartContext;

  const totalPrice = React.useMemo(() => {
    return (
      cart?.items?.reduce((sum, item) => {
        const price = item.game.discountedPrice ?? item.game.price;
        return sum + price * item.quantity;
      }, 0) ?? 0
    );
  }, [cart]);

  const handleQuantityChange = async (item: CartItem, quantity: number) => {
    if (!quantity || quantity < 1) return;
    try {
      await updateQuantity(item.game.id, quantity);
      message.success("Quantity updated");
    } catch (err) {
      message.error("Failed to update quantity");
      console.error("Update quantity error:", err);
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    try {
      await removeItem(item.game.id);
      message.success(`${item.game.title} removed from cart`);
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

  if (isLoading) {
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

  if (!cart || !cart.items || cart.items.length === 0) {
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
        dataSource={cart.items}
        renderItem={(item: CartItem) => {
          const price = item.game.discountedPrice ?? item.game.price;
          return (
            <List.Item
              key={item.game.id}
              className="bg-white p-4 rounded-lg shadow mb-4"
              actions={[
                <InputNumber
                  key="quantity"
                  min={1}
                  max={10}
                  value={item.quantity}
                  onChange={(value) => handleQuantityChange(item, value ?? 1)}
                  style={{ width: 60 }}
                  disabled={isMutating}
                />,
                <Text
                  strong
                  key="subtotal"
                  style={{ minWidth: 80, textAlign: "right" }}
                >
                  ${(price * item.quantity).toFixed(2)}
                </Text>,
                <Button
                  key="remove"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveItem(item)}
                  disabled={isMutating}
                  aria-label={`Remove ${item.game.title}`}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Image
                    width={80}
                    height={80}
                    src={`https://cataas.com/cat/says/cart-item-${item.game.id}?width=80&height=80`}
                    alt={item.game.title}
                    preview={false}
                    style={{ objectFit: "cover", borderRadius: "4px" }}
                    fallback="https://via.placeholder.com/80?text=CAT:)"
                  />
                }
                title={
                  <Link to={`/games/${item.game.id}`}>{item.game.title}</Link>
                }
                description={`$${price.toFixed(2)} each`}
              />
            </List.Item>
          );
        }}
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
            disabled
            style={{ marginTop: 16 }}
          >
            Proceed to Checkout
          </Button>
          <Button
            type="default"
            danger
            block
            onClick={handleClearCart}
            disabled={isMutating}
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
