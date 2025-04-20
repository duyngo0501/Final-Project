import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gamesAPI } from "@/services/api";
import { CartContext } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Spin,
  Alert,
  Button,
  Image,
  Typography,
  InputNumber,
  Space,
  Tag,
  Card,
  message,
  Result,
  Row,
  Col,
} from "antd";
import { Game } from "@/types/game";

const { Title, Paragraph, Text } = Typography;

/**
 * GameDetailPage component displaying details for a specific game.
 * Allows users to adjust quantity and add the game to the cart.
 * @returns {JSX.Element} The rendered game detail page.
 */
const GameDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);

  if (!cartContext) {
    return <Spin tip="Loading Context..." fullscreen />;
  }
  const { addItem } = cartContext;

  useEffect(() => {
    const fetchGame = async () => {
      if (!id) {
        setError("Game ID is missing.");
        setLoading(false);
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const response = await gamesAPI.getGameById(id);
        setGame(response.data);
      } catch (err: any) {
        console.error("Error fetching game:", err);
        if (err.response?.status === 404) {
          setError("Game not found.");
        } else {
          setError(
            err.message ||
              "Failed to load game details. Please try again later."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/games/${id}` } });
      return;
    }
    if (!game) return;

    setAddingToCart(true);
    try {
      await addItem(game, quantity);
      message.success(`${quantity} x ${game.title} added to cart!`);
      navigate("/cart");
    } catch (err: any) {
      console.error("Add to cart error:", err);
      message.error(err.message || "Failed to add game to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (value: number | null) => {
    if (value === null || !game || !game.stock) return;
    const newQuantity = Math.max(1, Math.min(game.stock, value));
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spin size="large" />
      </div>
    );
  }

  if (error && !game) {
    return (
      <Result
        status={error === "Game not found." ? "404" : "error"}
        title={
          error === "Game not found." ? "Game Not Found" : "Error Loading Game"
        }
        subTitle={error}
        extra={
          <Button type="primary" onClick={() => navigate("/games")}>
            Back to Games
          </Button>
        }
        className="py-12"
      />
    );
  }

  if (!game) {
    return (
      <Result
        status="404"
        title="Game Not Found"
        subTitle="Sorry, the game you visited does not exist."
        extra={
          <Button type="primary" onClick={() => navigate("/games")}>
            Back To Games
          </Button>
        }
        className="py-12"
      />
    );
  }

  const canAddToCart = typeof game.stock === "number" && game.stock > 0;
  const stockAvailable = typeof game.stock === "number" ? game.stock : "N/A";

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={10}>
            <Image
              width="100%"
              src={`https://cataas.com/cat/says/game-${game.id}?width=400&height=300`}
              alt={game.title}
              className="rounded-lg object-contain max-h-[500px]"
              fallback="https://via.placeholder.com/400x300?text=CAT"
              preview
            />
          </Col>
          <Col xs={24} md={14}>
            <Title level={2}>{game.title}</Title>
            <Paragraph type="secondary" className="mb-4">
              {game.category || "Category not specified"}
            </Paragraph>

            <Paragraph className="mb-6 text-base">
              {game.description || "No description available."}
            </Paragraph>

            <div className="mb-6">
              <Text strong className="text-3xl mr-4">
                {game.discountedPrice !== undefined &&
                game.discountedPrice < game.price ? (
                  <Space>
                    <Text delete type="secondary">
                      ${game.price.toFixed(2)}
                    </Text>
                    <Text style={{ color: "red" }}>
                      ${game.discountedPrice.toFixed(2)}
                    </Text>
                  </Space>
                ) : (
                  `$${game.price.toFixed(2)}`
                )}
              </Text>
              {canAddToCart ? (
                <Tag color="green">In Stock ({stockAvailable} available)</Tag>
              ) : (
                <Tag color="red">Out of Stock</Tag>
              )}
            </div>

            {canAddToCart && (
              <div className="mb-6">
                <Text strong className="block mb-2">
                  Quantity
                </Text>
                <InputNumber
                  min={1}
                  max={game.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  size="large"
                  style={{ width: "100px" }}
                />
              </div>
            )}

            <Button
              type="primary"
              size="large"
              onClick={handleAddToCart}
              disabled={!canAddToCart || addingToCart || !addItem}
              loading={addingToCart}
              block
            >
              {canAddToCart ? "Add to Cart" : "Out of Stock"}
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default GameDetailPage;
