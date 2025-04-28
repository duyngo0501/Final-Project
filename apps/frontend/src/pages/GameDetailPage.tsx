import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { gamesAPI } from "@/services/api";
import { useCart } from "@/contexts/CartContext";
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
  Divider,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Game } from "@/types/game";

const { Title, Paragraph, Text } = Typography;

/**
 * GameDetailPage component displaying details for a specific game.
 * Allows users to adjust quantity and add the game to the cart.
 * @returns {JSX.Element} The rendered game detail page.
 */
const GameDetailPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();
  const cartContextValue = useCart((state) => state);
  const addItem = cartContextValue?.addItem;
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);

  useEffect(() => {
    const fetchGame = async () => {
      if (!id) {
        setError("Game ID not found in URL.");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await gamesAPI.getGameById(id);
        const fetchedGameData = response.data;
        const mappedGame: Game = {
          id: fetchedGameData.id,
          title: fetchedGameData.title,
          thumbnail: fetchedGameData.thumbnail ?? "/placeholder-image.jpg",
          price:
            typeof fetchedGameData.price === "number"
              ? fetchedGameData.price
              : 0,
          category: fetchedGameData.category?.[0] ?? "Unknown",
          description: fetchedGameData.description ?? undefined,
          rating:
            typeof fetchedGameData.rating === "number"
              ? fetchedGameData.rating
              : undefined,
          releaseDate: fetchedGameData.releaseDate
            ? new Date(fetchedGameData.releaseDate).toISOString()
            : undefined,
        };
        setGame(mappedGame);
        setError(null);
      } catch (err: any) {
        console.error("Fetch game error:", err);
        setError(err.message || "Failed to fetch game details");
        setGame(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/games?id=${id}` } });
      return;
    }
    if (!game || !addItem) {
      message.error(
        !game ? "Game data not loaded." : "Cart functionality not available."
      );
      return;
    }

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
    if (value !== null) {
      setQuantity(value);
    }
  };

  if (loading) {
    return <Spin tip="Loading game details..." fullscreen />;
  }

  if (error) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <Title level={3} style={{ color: "red" }}>
          Error Loading Game
        </Title>
        <Paragraph>{error}</Paragraph>
        <Button type="primary" onClick={() => navigate("/games")}>
          Back to Games List
        </Button>
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <Title level={3}>Game Not Found</Title>
        <Paragraph>The game you are looking for could not be found.</Paragraph>
        <Button type="primary" onClick={() => navigate("/games")}>
          Back to Games List
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <Image
            width="100%"
            src={game.thumbnail || "/placeholder-image.png"}
            alt={game.title}
            preview={false}
          />
        </Col>
        <Col xs={24} md={14}>
          <Title level={2}>{game.title}</Title>
          <Paragraph>{game.description}</Paragraph>
          <Divider />
          <Text strong>Price:</Text> ${game.price?.toFixed(2)}
          <br />
          <Text strong>Category:</Text> {game.category}
          <br />
          <Text strong>Release Date:</Text>{" "}
          {game.releaseDate
            ? new Date(game.releaseDate).toLocaleDateString()
            : "N/A"}
          <br />
          <Divider />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <InputNumber
              min={1}
              max={10}
              defaultValue={1}
              value={quantity}
              onChange={handleQuantityChange}
            />
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={handleAddToCart}
              loading={addingToCart}
              disabled={!addItem}
            >
              Add to Cart
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default GameDetailPage;
