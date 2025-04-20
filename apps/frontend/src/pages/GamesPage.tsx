import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gamesAPI } from "@/services/api";
import {
  Spin,
  Alert,
  Pagination,
  Card,
  List,
  Typography,
  Button,
  Space,
  Image,
  Empty,
} from "antd";

// FIXME: Replace with actual Game type definition, ideally imported
interface Game {
  id: string | number;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  stock?: number; // Optional stock
  [key: string]: any;
}

// Assuming API response structure
interface GamesApiResponse {
  data: {
    games: Game[];
    pages: number; // Total number of pages
    // Potentially other fields like totalGames
  };
  // Include other potential top-level response fields if necessary
}

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const PAGE_SIZE = 12; // Items per page

/**
 * GamesPage component displaying a paginated list of games.
 * Uses Ant Design components for layout, loading, error, and pagination.
 * @returns {JSX.Element} The rendered games page.
 */
const GamesPage = (): JSX.Element => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  // const [totalGames, setTotalGames] = useState<number>(0); // Optional total count

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      setError(null);
      setLoading(true);
      try {
        // Explicitly type the expected response
        const response: GamesApiResponse = await gamesAPI.getAllGames(
          currentPage,
          PAGE_SIZE
        );
        setGames(response.data.games || []);
        setTotalPages(response.data.pages || 1);
        // setTotalGames(response.data.totalGames || 0); // If API provides total count
      } catch (err: any) {
        console.error("Error fetching games:", err);
        setError(
          err.message || "Failed to load games. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [currentPage]); // Refetch when currentPage changes

  /**
   * Handles page changes from the Pagination component.
   * @param {number} page The new page number.
   * @param {number} [pageSize] The page size (optional).
   */
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  // Render loading state (only show full page spinner on initial load)
  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spin size="large" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert
        message="Error Loading Games"
        description={error}
        type="error"
        showIcon
        className="my-8"
        action={
          <Button onClick={() => setCurrentPage(1)} type="primary">
            Try Again
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Title level={2} className="mb-8">
        All Games
      </Title>

      {/* Use List component with grid prop for responsive layout */}
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }} // Responsive grid
        dataSource={games}
        loading={loading}
        renderItem={(game: Game) => (
          <List.Item>
            <Card
              hoverable
              style={{ width: "100%" }} // Ensure card takes full width of List grid item
              cover={
                <Image
                  alt={game.title}
                  src={
                    game.image_url ||
                    "https://via.placeholder.com/300x200?text=Game+Image"
                  }
                  preview={false} // Disable preview for card images
                  style={{ height: 200, objectFit: "cover" }} // Fixed height
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
              <Meta
                // Use Typography.Title level 5, truncate if too long
                title={
                  <Title
                    level={5}
                    className="!mb-1"
                    ellipsis={{ tooltip: game.title }}
                  >
                    {game.title}
                  </Title>
                }
                // Use Typography.Paragraph with ellipsis
                description={
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2, expandable: false }}
                  >
                    {game.description}
                  </Paragraph>
                }
              />
              {/* Use Typography.Text for price */}
              <div className="mt-4">
                <Text strong className="text-lg">
                  ${game.price.toFixed(2)}
                </Text>
              </div>
            </Card>
          </List.Item>
        )}
        locale={{ emptyText: <Empty description="No games found." /> }}
      />

      {/* Pagination: Use currentPage state variable */}
      {games.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            current={currentPage} // Use currentPage
            total={totalPages * PAGE_SIZE}
            pageSize={PAGE_SIZE}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};

export default GamesPage;
