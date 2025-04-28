import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Image,
  Typography,
  Spin,
  Alert as AntAlert,
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
import { useGameControllerGetGame } from "@/gen/query/GamesHooks"; // Adjust path if needed
import { useCart } from "@/contexts/CartContext"; // Import cart context
import { Game } from "@/gen/types"; // Assuming this is the correct generated type

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

/**
 * @description Displays the detailed information for a single game.
 * Fetches game data based on the ID from the URL using SWR.
 * Allows adding the game to the cart.
 * @returns {React.ReactElement} The rendered Game Details page.
 */
const GameDetailsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId?: string }>(); // gameId is a string from URL

  // --- Use the generated SWR hook --- //
  // Ensure gameId is not undefined before calling the hook.
  // The hook call itself is conditional later.
  const {
    data: response, // SWR returns raw AxiosResponse
    isLoading, // SWR provides isLoading
    error, // SWR error object
    mutate, // SWR mutate function
  } = useGameControllerGetGame(
    gameId!, // Pass gameId directly
    { args: {}, kwargs: {} } // WORKAROUND: Pass empty args/kwargs for faulty type
  );

  // --- Extract the actual game details --- //
  // Access data from response.data
  const game = response?.data;

  const { addItem, isMutating: isCartMutating } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!game) return;
    try {
      // --- Map fetched game (GameWithRelations) to local Game type --- //
      const gameToAdd: Game = {
        id: game.id,
        name: game.name,
        background_image: game.background_image ?? "/placeholder-image.jpg",
        price: typeof game.price === "number" ? game.price : 0,
        // Only include fields required by the local Game type / addItem function
        description: game.description ?? undefined, // Include if needed by Game type
        rating: typeof game.rating === "number" ? game.rating : undefined, // Include if needed
        released_date: game.released_date
          ? new Date(game.released_date).toISOString()
          : undefined, // Include if needed
      };
      await addItem(gameToAdd, quantity); // Pass the mapped game
      message.success(`${quantity} x ${game.name} added to cart!`);
    } catch (err) {
      console.error("Failed to add item:", err);
      message.error("Failed to add item to cart. Please try again.");
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    // Check SWR error object directly
    return (
      <AntAlert
        message="Error Loading Game"
        description={
          // FIX: Extract error message safely
          error instanceof Error
            ? error.message
            : typeof error === "object" && error !== null && "message" in error
              ? String(error.message)
              : "There was a problem fetching the game details. Please try again later."
        }
        type="error"
        showIcon
        style={{ margin: "50px" }}
      />
    );
  }

  if (!game) {
    return (
      <AntAlert
        message="Game Not Found"
        description="The requested game could not be found. It might have been removed or the ID is incorrect."
        type="warning"
        showIcon
        style={{ margin: "50px" }}
      />
    );
  }

  // Success state - Render game details using Ant Design components
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "50px" }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <Image
              width="100%"
              src={game.background_image || "/placeholder-image.png"} // Use background_image from GameResponse
              alt={game.name} // Use name from GameResponse
              fallback="/placeholder-image.png"
              style={{ borderRadius: "8px" }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Title level={2}>{game.name}</Title>
            {/* Display Categories and Platforms if available */}
            <Space wrap style={{ marginBottom: "16px" }}>
              {game.categories?.map(
                (cat: NonNullable<typeof game.categories>[number]) => (
                  <Tag key={cat.id} color="blue">
                    {cat.name}
                  </Tag>
                )
              )}
              {game.platforms?.map(
                (plat: NonNullable<typeof game.platforms>[number]) => (
                  <Tag key={plat.id} color="green">
                    {plat.name}
                  </Tag>
                )
              )}
            </Space>
            {/* Display Rating if available */}
            {typeof game.rating === "number" && game.rating > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <Rate disabled allowHalf value={game.rating} /> (
                {game.rating.toFixed(1)})
              </div>
            )}

            {game.description && (
              <Paragraph type="secondary" style={{ marginBottom: "24px" }}>
                {game.description}
              </Paragraph>
            )}

            <Divider />

            {/* Price Display */}
            <div style={{ marginBottom: "24px" }}>
              <Text strong style={{ fontSize: "1.8em" }}>
                {typeof game.price === "number"
                  ? `$${game.price.toFixed(2)}`
                  : "Price not available"}
              </Text>
              {/* Removed discounted price logic as it's not in model */}
            </div>

            {/* Actions: Quantity & Add to Cart */}
            <Space align="center" style={{ marginBottom: "24px" }}>
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
                disabled={isCartMutating || !game} // Disable if no game data
              >
                {isCartMutating ? "Adding..." : "Add to Cart"}
              </Button>
            </Space>

            <Divider />

            {/* Other Details (Optional) */}
            <Descriptions column={1} size="small">
              {game.released_date && (
                <Descriptions.Item label="Release Date">
                  {/* Ensure released_date exists before formatting */}
                  {game.released_date
                    ? new Date(game.released_date).toLocaleDateString()
                    : "N/A"}
                </Descriptions.Item>
              )}
              {game.metacritic && (
                <Descriptions.Item label="Metacritic">
                  {game.metacritic}
                </Descriptions.Item>
              )}
              {/* Add Developer, Publisher, Website etc. if available and needed */}
              {(game as any).website && (
                <Descriptions.Item label="Website">
                  <a
                    href={(game as any).website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {(game as any).website}
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default GameDetailsPage;
