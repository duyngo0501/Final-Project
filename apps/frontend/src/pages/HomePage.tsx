import React, { useState, useCallback } from "react";
import { Layout, Row, Col, Spin, Alert, message } from "antd";
import Navbar from "@/components/layout/Navbar"; // Assuming Navbar is in layout
import Footer from "@/components/layout/Footer"; // Assuming Footer is in layout
import BannerHeader from "@/components/home/BannerHeader";
import PromotionBanner from "@/components/home/PromotionBanner";
import GameCategories from "@/components/home/GameCategories";
import GameGrid from "@/components/home/GameGrid";
import { useCart } from "@/contexts/CartContext"; // Import the cart hook
import { useGames } from "@/hooks/useGames"; // Import the mock SWR hook
import { Game } from "@/types/game"; // Import shared Game type using alias

const { Content } = Layout;

/**
 * @description The main Home Page component orchestrating layout and sections.
 * Fetches games using the useGames SWR hook based on selected category
 * and provides cart functionality.
 * @returns {React.FC} The HomePage component.
 */
const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("pc"); // Default category
  const { addItem: addToCart } = useCart(); // Get addItem function from context

  // Use the SWR hook to fetch games based on the selected category
  const { games, isLoading, isError } = useGames({
    category: selectedCategory,
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle adding game to cart - now uses context action
  const handleQuickBuy = useCallback(
    (game: Game) => {
      console.log(`Quick buying game ID: ${game.id}`);
      addToCart(game); // Pass the full game object to context
      message.success(`${game.title} added to cart!`); // Add user feedback
    },
    [addToCart]
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar /> {/* Assuming Navbar handles its own state */}
      <Content style={{ padding: "0 48px", marginTop: "20px" }}>
        {" "}
        {/* Added top margin */}
        <BannerHeader /> {/* Displays best-selling games */}
        <PromotionBanner /> {/* Displays promotions */}
        <Row justify="center" style={{ marginBottom: "20px" }}>
          <Col xs={24} sm={20} md={16} lg={14}>
            <GameCategories onCategoryChange={handleCategoryChange} />
          </Col>
        </Row>
        <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
          {isLoading && (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          )}
          {isError && (
            <Alert
              message="Error Loading Games"
              description={
                typeof isError === "object" &&
                isError !== null &&
                "message" in isError
                  ? isError.message
                  : "Failed to load games. Please try again later."
              }
              type="error"
              showIcon
              style={{ marginBottom: "20px" }}
            />
          )}
          {!isLoading && !isError && (
            <GameGrid games={games || []} onQuickBuy={handleQuickBuy} />
          )}
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default HomePage;
