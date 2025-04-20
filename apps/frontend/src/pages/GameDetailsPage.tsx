import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Image,
  Typography,
  Spin,
  Alert,
  Button,
  InputNumber,
  Tag,
  Rate,
  Divider,
  message,
  Space,
  Descriptions,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useGameDetails } from "@/hooks/useGameDetails"; // Import the mock hook
import { useCart } from "@/contexts/CartContext"; // Import cart context

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

/**
 * @description Displays the detailed information for a single game.
 * Fetches game data based on the ID from the URL.
 * Allows adding the game to the cart.
 * @returns {React.ReactElement} The rendered Game Details page.
 */
const GameDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const gameId = id ? parseInt(id, 10) : undefined;

  // Ensure gameId is valid before fetching
  const isValidId = gameId !== undefined && !isNaN(gameId);
  const { game, isLoading, isError, isNotFound } = useGameDetails(
    isValidId ? gameId : undefined
  );
  const { addItem, isMutating: isCartMutating } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!game) return;
    try {
      await addItem(game, quantity);
      message.success(`${quantity} x ${game.title} added to cart!`);
    } catch (err) {
      console.error("Failed to add item:", err);
      message.error("Failed to add item to cart. Please try again.");
    }
  };

  // --- Render Logic ---
  if (!isValidId) {
    return (
      <Alert
        message="Invalid Game ID"
        description="The game ID in the URL is missing or invalid."
        type="error"
        showIcon
        style={{ margin: "50px" }}
      />
    );
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        message="Error Loading Game"
        description={
          typeof isError === "string"
            ? isError
            : "Could not load game details. Please try again."
        }
        type="error"
        showIcon
        style={{ margin: "50px" }}
      />
    );
  }

  if (isNotFound || !game) {
    return (
      <Alert
        message="Game Not Found"
        description={`Game with ID ${gameId} could not be found.`}
        type="warning"
        showIcon
        style={{ margin: "50px" }}
      />
    );
  }

  const hasDiscount =
    typeof game.discountedPrice === "number" &&
    game.discountedPrice < game.price;

  return (
    <Layout style={{ padding: "24px 0", background: "#fff" }}>
      <Content style={{ padding: "0 50px" }}>
        <Row gutter={[32, 32]}>
          {/* Left Column: Image */}
          <Col xs={24} md={10} lg={8}>
            <Image
              width="100%"
              // Use cat API if thumbnail is the placeholder, otherwise use thumbnail
              src={
                game.thumbnail === "/placeholder-image.jpg"
                  ? `https://cataas.com/cat/says/game-${game.id}?width=400&height=300` // Adjust size hint
                  : game.thumbnail
              }
              alt={game.title}
              fallback="/placeholder-image.jpg"
            />
            {/* TODO: Add thumbnail gallery if multiple images exist */}
          </Col>

          {/* Right Column: Details & Actions */}
          <Col xs={24} md={14} lg={16}>
            <Title level={2}>{game.title}</Title>
            <Space wrap style={{ marginBottom: "16px" }}>
              <Tag color="blue">{game.category}</Tag>
              {game.rating && (
                <Rate disabled allowHalf defaultValue={game.rating} />
              )}
              {/* Add platform tags if available? */}
            </Space>

            {game.description && (
              <Paragraph type="secondary" style={{ marginBottom: "24px" }}>
                {game.description}
              </Paragraph>
            )}

            <Divider />

            {/* Price Display */}
            <div style={{ marginBottom: "24px" }}>
              {hasDiscount ? (
                <Space align="baseline">
                  <Text strong style={{ fontSize: "1.8em", color: "#f5222d" }}>
                    ${game.discountedPrice?.toFixed(2)}
                  </Text>
                  <Text delete type="secondary" style={{ fontSize: "1.2em" }}>
                    ${game.price.toFixed(2)}
                  </Text>
                </Space>
              ) : (
                <Text strong style={{ fontSize: "1.8em" }}>
                  ${game.price.toFixed(2)}
                </Text>
              )}
            </div>

            {/* Actions: Quantity & Add to Cart */}
            <Space align="center">
              <InputNumber
                min={1}
                max={10} // Or based on stock if available
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
                size="large"
                style={{ width: "80px" }}
              />
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                size="large"
                onClick={handleAddToCart}
                loading={isCartMutating}
                disabled={isCartMutating}
              >
                Add to Cart
              </Button>
            </Space>

            <Divider />

            {/* Other Details (Optional) */}
            <Descriptions column={1} size="small">
              {game.releaseDate && (
                <Descriptions.Item label="Release Date">
                  {new Date(game.releaseDate).toLocaleDateString()}
                </Descriptions.Item>
              )}
              {/* Add Developer, Publisher, etc. if available */}
            </Descriptions>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default GameDetailsPage;
