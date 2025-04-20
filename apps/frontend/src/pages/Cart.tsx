import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart, CartItem } from "@/contexts/CartContext";
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
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * Cart component displaying the user's shopping cart.
 * Uses Ant Design components and fetches state from CartContext.
 * @returns {JSX.Element} The rendered cart component.
 */
const Cart = (): JSX.Element => {
  const navigate = useNavigate();
  const loading = useCart((state) => state.loading);
  const error = useCart((state) => state.error);
  const items = useCart((state) => state.cart?.items ?? []);
  const totalItems = useCart((state) => state.totalItems);
  const totalPrice = useCart((state) => state.cart?.total_price ?? 0);
  const { removeFromCart, updateQuantity, refreshCart, clearCartError } =
    useCart((state) => ({
      removeFromCart: state.removeFromCart,
      updateQuantity: state.updateQuantity,
      refreshCart: state.refreshCart,
      clearCartError: state.clearCartError,
    }));

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
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
        description={error}
        type="error"
        showIcon
        closable
        onClose={clearCartError}
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
        Shopping Cart
      </Title>

      <List
        itemLayout="horizontal"
        dataSource={items}
        renderItem={(item: CartItem) => (
          <List.Item
            key={item.id}
            className="bg-white p-4 rounded-lg shadow mb-4"
            actions={[
              <Button
                key="remove"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeFromCart(String(item.id))}
              />,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Image
                  width={80}
                  height={80}
                  src={
                    item.image_url ||
                    "https://via.placeholder.com/100x100?text=Game"
                  }
                  alt={item.title}
                  preview={false}
                  style={{ objectFit: "cover", borderRadius: "4px" }}
                />
              }
              title={<Text strong>{item.title}</Text>}
              description={`Price: $${item.price.toFixed(2)}`}
            />
            <Space align="center">
              <Text>Quantity:</Text>
              <InputNumber
                min={1}
                max={10}
                value={item.quantity}
                onChange={(value) =>
                  value !== null && updateQuantity(String(item.id), value)
                }
                style={{ width: 60 }}
              />
            </Space>
          </List.Item>
        )}
      />

      <Card className="mt-8 shadow">
        <div className="flex justify-between items-center mb-4">
          <Text>Total Items:</Text>
          <Text strong>{totalItems}</Text>
        </div>
        <div className="flex justify-between items-center mb-6">
          <Text strong className="text-xl">
            Total Price:
          </Text>
          <Text strong className="text-xl">
            ${totalPrice.toFixed(2)}
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          block
          onClick={() => navigate("/checkout")}
        >
          Proceed to Checkout
        </Button>
      </Card>
    </div>
  );
};

export default Cart;
