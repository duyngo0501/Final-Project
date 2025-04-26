import React from "react";
import { Carousel, Image, Spin, Alert, Typography } from "antd";
import { Link } from "react-router-dom"; // Import Link for navigation
import { useGames } from "@/hooks/useGames"; // Import the hook to fetch real game data
import { Game } from "@/types/game"; // Import the Game type

const { Text } = Typography;

// Remove placeholder data
// const bestSellingGames = [...];

// Define a fixed height for consistency
const BANNER_HEIGHT = "400px";

/**
 * @description Banner header slideshow displaying featured games.
 * Fetches game data using useGames hook.
 * @returns {React.FC} The BannerHeader component.
 */
const BannerHeader: React.FC = () => {
  // Fetch first 3 games (adjust pageSize as needed)
  const { games, isLoading, isError } = useGames({ pageSize: 3 });

  // Style for the container of loading/error/empty states
  const stateContainerStyle: React.CSSProperties = {
    height: BANNER_HEIGHT,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5", // Use a standard Ant Design background color
  };

  if (isLoading) {
    return (
      <div style={stateContainerStyle}>
        <Spin size="large" tip="Loading Games..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={stateContainerStyle}>
        <Alert
          message="Error Loading Banner"
          description="Could not load featured games."
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div style={stateContainerStyle}>
        {/* Use Ant Design Typography for empty state message */}
        <Text type="secondary">No featured games available.</Text>
      </div>
    );
  }

  return (
    <Carousel autoplay dotPosition="bottom" style={{ marginBottom: "20px" }}>
      {/* Map over fetched games data */}
      {games.map((game: Game) => (
        <div key={game.id}>
          {/* Use Link component for internal navigation with query parameter */}
          <Link to={`/games?id=${game.id}`}>
            <Image
              src={game.thumbnail}
              alt={game.title}
              preview={false}
              style={{
                // Apply styles directly to Image
                width: "100%",
                height: BANNER_HEIGHT, // Use defined height
                objectFit: "cover", // Ensure image covers the area well
              }}
              fallback="/placeholder-image.jpg"
            />
          </Link>
        </div>
      ))}
    </Carousel>
  );
};

export default BannerHeader;
