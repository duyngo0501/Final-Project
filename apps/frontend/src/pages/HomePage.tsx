import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gamesAPI } from "../services/api";
import { Spin, Alert, Typography, Button, Card, Row, Col, Image } from "antd";

const { Title, Paragraph, Text } = Typography;

// FIXME: Replace with actual Game type definition, ideally imported
interface Game {
  id: string | number;
  title: string;
  description: string;
  price: number;
  image_url?: string; // Optional image URL
  // Add other game properties as needed
  [key: string]: any; // Allow other properties for now
}

/**
 * HomePage component displaying a welcome message and featured games.
 * Fetches a limited number of games on mount.
 * @returns {JSX.Element} The rendered homepage component.
 */
const HomePage = (): JSX.Element => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await gamesAPI.getAllGames(1, 6); // Get first 6 games
        setGames(response.data.games || []);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching games:", err);
        setError(
          err.message || "Failed to load games. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Games"
        description={error}
        type="error"
        showIcon
        action={
          <Button type="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        }
        className="my-8"
      />
    );
  }

  return (
    <div>
      <section className="mb-12 text-center py-12 bg-gray-100 rounded-lg">
        <Title level={1} className="!text-4xl !font-bold !mb-6">
          Welcome to GameStore
        </Title>
        <Paragraph className="text-xl text-gray-600 mb-8">
          Discover the latest and greatest games for all platforms.
        </Paragraph>
        <Button type="primary" size="large" onClick={() => navigate("/games")}>
          Browse All Games
        </Button>
      </section>

      <section>
        <Title level={2} className="!text-2xl !font-bold !mb-6">
          Featured Games
        </Title>
        {games.length > 0 ? (
          <Row gutter={[16, 16]}>
            {games.map((game: Game) => (
              <Col xs={24} sm={12} lg={8} key={game.id}>
                <Card
                  hoverable
                  cover={
                    <Image
                      alt={game.title}
                      src={
                        game.image_url ||
                        "https://via.placeholder.com/300x200?text=Game+Image"
                      }
                      preview={false}
                      style={{ height: 200, objectFit: "cover" }}
                    />
                  }
                  actions={[
                    <Button
                      type="primary"
                      onClick={() => navigate(`/games/${game.id}`)}
                      key="view"
                    >
                      View Details
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <Title level={5} className="!mb-1 truncate">
                        {game.title}
                      </Title>
                    }
                    description={
                      <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                        {game.description}
                      </Paragraph>
                    }
                  />
                  <div className="mt-4">
                    <Text strong className="text-lg">
                      ${game.price.toFixed(2)}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Paragraph className="text-center text-gray-500">
            No games available at the moment.
          </Paragraph>
        )}
      </section>
    </div>
  );
};

export default HomePage;
