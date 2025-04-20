import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Card,
  Typography,
  Button,
  Spin,
  Alert,
  Image,
  Tag,
  Breadcrumb,
} from "antd";
import { ShoppingCartOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useGameDetails } from "../hooks/useGameDetails";
import { useCart } from "@/contexts/CartContext";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

/**
 * @description Page component to display details of a specific game.
 * Fetches game data based on ID from URL parameters.
 * @returns {React.FC} The GameDetailsPage component.
 */
const GameDetailsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const gameIdNum = gameId ? parseInt(gameId, 10) : undefined;

  const { game, isLoading, isError, isNotFound } = useGameDetails(gameIdNum);
  const addToCart = useCart((state) => state.addItem);

  /**
   * @description Handles adding the current game to the cart.
   */
  const handleAddToCart = () => {
    if (game) {
      addToCart(game); // Pass the whole game object or relevant parts
      // Optionally: Show notification, navigate to cart, etc.
      console.log("Added to cart:", game.title);
    }
  };

  if (isLoading) {
    return (
      <Layout
        style={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout style={{ padding: "20px 48px" }}>
        <Alert
          message="Error Loading Game Details"
          description={isError.message || "Could not load game details."}
          type="error"
          showIcon
        />
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginTop: 16 }}
        >
          Go Back
        </Button>
      </Layout>
    );
  }

  if (isNotFound || !game) {
    return (
      <Layout style={{ padding: "20px 48px" }}>
        <Alert
          message="Game Not Found"
          description="The requested game could not be found."
          type="warning"
          showIcon
        />
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginTop: 16 }}
        >
          Go Back
        </Button>
      </Layout>
    );
  }

  // If game data is available
  return (
    <Layout>
      <Content style={{ padding: "20px 48px" }}>
        <Breadcrumb style={{ marginBottom: "16px" }}>
          <Breadcrumb.Item>
            <a onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              Home
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a onClick={() => navigate("/games")} style={{ cursor: "pointer" }}>
              Games
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{game.title}</Breadcrumb.Item>
        </Breadcrumb>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          Back to Games
        </Button>

        <Card>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={10} lg={8}>
              {/* Use Ant Design Image for preview capabilities */}
              <Image
                width="100%"
                src={game.thumbnail || "/images/placeholder.png"} // Provide a placeholder
                alt={game.title}
                preview={{
                  mask: <ShoppingCartOutlined />, // Just an example icon
                }}
              />
            </Col>
            <Col xs={24} md={14} lg={16}>
              <Title level={2}>{game.title}</Title>
              <Tag color="blue" style={{ marginBottom: 16 }}>
                {game.category?.toUpperCase()}
              </Tag>
              <Paragraph>
                {game.description || "No description available."}
              </Paragraph>
              <div style={{ marginBottom: 24 }}>
                <Text strong style={{ fontSize: "1.5em", marginRight: "10px" }}>
                  ${game.price.toFixed(2)}
                </Text>
                {game.discountedPrice && game.discountedPrice < game.price && (
                  <Text delete type="secondary" style={{ fontSize: "1.2em" }}>
                    ${game.discountedPrice.toFixed(2)}
                  </Text>
                )}
                {game.price === 0 && <Tag color="green">FREE</Tag>}
              </div>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                size="large"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              {/* Add more details like platform, genre, ratings, screenshots etc. later */}
            </Col>
          </Row>
        </Card>
      </Content>
    </Layout>
  );
};

export default GameDetailsPage;
