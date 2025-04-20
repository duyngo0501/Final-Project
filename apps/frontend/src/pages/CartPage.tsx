import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Table,
  Button,
  InputNumber,
  Image,
  Space,
  Divider,
  Empty,
  Spin,
  Alert,
  Result,
  Row,
  Col,
  Card,
  message,
} from "antd";
import { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  useCartItems,
  useCartIsLoading,
  useCart,
  useCartTotalItems,
  useCartMutationState,
} from "@/contexts/CartContext";
import { CartItem } from "@/services/api";
import { formatCurrency } from "@/utils/helpers";

const { Content } = Layout;
const { Title, Text, Link } = Typography;

/**
 * @description Page component to display and manage the shopping cart.
 * @returns {React.FC} The CartPage component.
 */
const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const items = useCartItems();
  const isLoading = useCartIsLoading();
  const { isMutating, mutationError } = useCartMutationState();
  const { removeItem, updateQuantity, clearCartMutationError } = useCart(
    (state) => ({
      removeItem: state.removeItem,
      updateQuantity: state.updateQuantity,
      clearCartMutationError: state.clearCartMutationError,
    })
  );

  useEffect(() => {
    if (mutationError) {
      message.error(mutationError);
      if (clearCartMutationError) {
        clearCartMutationError();
      }
    }
  }, [mutationError, clearCartMutationError]);

  const handleQuantityChange = async (gameId: number, value: number | null) => {
    if (value !== null && value >= 0) {
      try {
        await updateQuantity(gameId, value);
      } catch (e) {
        console.error("Update quantity failed (caught in handler):", e);
      }
    }
  };

  const handleRemoveItem = async (gameId: number) => {
    try {
      await removeItem(gameId);
      message.success("Item removed from cart");
    } catch (e) {
      console.error("Remove item failed (caught in handler):", e);
    }
  };

  const cartTotal = React.useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.game.discountedPrice ?? item.game.price;
      return total + price * item.quantity;
    }, 0);
  }, [items]);

  const columns: ColumnsType<CartItem> = [
    {
      title: "Product",
      dataIndex: "game",
      key: "game",
      render: (game: CartItem["game"]) => (
        <Space>
          <Image
            width={60}
            src={game.thumbnail || "/images/placeholder.png"}
            alt={game.title}
            preview={false}
            style={{ objectFit: "cover" }}
          />
          <Link onClick={() => navigate(`/games/${game.id}`)}>
            {game.title}
          </Link>
        </Space>
      ),
    },
    {
      title: "Price",
      dataIndex: ["game", "price"],
      key: "price",
      responsive: ["md"],
      render: (price: number, record: CartItem) => {
        const displayPrice = record.game.discountedPrice ?? price;
        return (
          <Space direction="vertical" size="small">
            <Text>{formatCurrency(displayPrice)}</Text>
            {record.game.discountedPrice && (
              <Text delete type="secondary" style={{ fontSize: "0.9em" }}>
                {formatCurrency(price)}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: CartItem) => (
        <InputNumber<number>
          min={0}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.game.id, value)}
          style={{ width: 70 }}
          disabled={isMutating}
        />
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      align: "right",
      render: (_: any, record: CartItem) => {
        const price = record.game.discountedPrice ?? record.game.price;
        return <Text strong>{formatCurrency(price * record.quantity)}</Text>;
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_: any, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.game.id)}
          disabled={isMutating}
        />
      ),
    },
  ];

  if (isLoading && !items.length) {
    return (
      <Layout
        style={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Loading Cart..." />
      </Layout>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <Layout
        style={{ padding: "20px 24px", maxWidth: 1200, margin: "0 auto" }}
      >
        <Content
          style={{
            background: "#fff",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Title level={4} style={{ marginBottom: 24 }}>
                Your shopping cart is empty.
              </Title>
            }
          />
          <Button
            type="primary"
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/games")}
          >
            Continue Shopping
          </Button>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Content
        style={{ padding: "20px 24px", maxWidth: 1200, margin: "0 auto" }}
      >
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/games")}
          style={{ marginBottom: 16, paddingLeft: 0 }}
        >
          Continue Shopping
        </Button>

        <Title level={2} style={{ marginBottom: 24 }}>
          Shopping Cart
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card bordered={false} style={{ background: "#fff" }}>
              <Spin
                spinning={isLoading || isMutating}
                tip={isMutating ? "Updating Cart..." : "Loading Cart..."}
              >
                <Table
                  columns={columns}
                  dataSource={items}
                  rowKey={(item) => item.game.id}
                  pagination={false}
                />
              </Spin>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Cart Summary">
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <Row justify="space-between">
                  <Text>
                    Subtotal ({items.length}{" "}
                    {items.length === 1 ? "item" : "items"}):
                  </Text>
                  <Text strong>{formatCurrency(cartTotal)}</Text>
                </Row>
                <Divider style={{ margin: "12px 0" }} />
                <Row justify="space-between">
                  <Title level={4}>Order Total:</Title>
                  <Title level={4}>{formatCurrency(cartTotal)}</Title>
                </Row>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  block
                  onClick={() => message.info("Checkout not implemented yet!")}
                  disabled={isMutating || isLoading}
                >
                  Proceed to Checkout
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
