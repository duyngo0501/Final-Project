import React, { useState } from "react";
import {
  Layout,
  Row,
  Col,
  Spin,
  Alert,
  Typography,
  Pagination,
  Card,
  Select,
  Input,
  Empty,
  Space,
} from "antd";
import { Game } from "@/types/game";
import { useGames } from "@/hooks/useGames"; // Using the mock hook
// We can reuse the GameGrid component from the homepage
import GameGrid from "@/components/home/GameGrid"; // Adjust path if needed
import { useCart } from "@/contexts/CartContext"; // To pass addItem to GameGrid
import GameFilters from "@/components/games/GameFilters"; // Import the new component

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

/**
 * @description Page for browsing, filtering, sorting, and paginating all games.
 * @returns {React.FC} The GamesPage component.
 */
const GamesPage: React.FC = () => {
  // State for filters, sorting, pagination, search
  const [category, setCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("title_asc"); // e.g., price_asc, price_desc, title_asc
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12); // Number of games per page

  // Fetch games using the updated SWR hook with all parameters
  const {
    games,
    totalGames, // Use the total count returned by the hook
    isLoading,
    isError,
  } = useGames({
    category,
    searchTerm,
    sortBy,
    currentPage,
    pageSize,
  });

  // Get cart function using selector
  const addToCart = useCart((state) => state.addItem);

  // Placeholder handlers - will be connected later
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1); // Reset page when category changes
    // console.log('Category selected:', value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // console.log('Sort by:', value);
    // No need to reset page for sorting
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value.trim());
    setCurrentPage(1); // Reset page on new search
    // console.log('Search term:', value.trim());
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
    // console.log('Page changed to:', page, 'Size:', size);
  };

  // Data is now directly from the hook, including totalGames
  // const displayedGames = games || [];
  // const totalGames = games?.length || 0; // Removed: using totalGames from hook

  return (
    <Layout>
      <Content
        style={{ padding: "20px 24px", maxWidth: 1200, margin: "0 auto" }}
      >
        <Title level={2} style={{ marginBottom: 24 }}>
          Browse Games
        </Title>

        {/* Render the GameFilters component */}
        <GameFilters
          category={category}
          sortBy={sortBy}
          searchTerm={searchTerm}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onSearch={handleSearch}
          // Pass isLoading if you want to disable controls:
          // isLoading={isLoading}
        />

        {isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
            }}
          >
            <Spin size="large" tip="Loading Games..." />
          </div>
        )}

        {isError && (
          <Alert
            message="Error Loading Games"
            description={isError.message || "Could not load games."}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {!isLoading && !isError && (
          <>
            {games && games.length > 0 ? (
              <GameGrid games={games} onQuickBuy={addToCart} />
            ) : searchTerm || category !== "all" ? (
              <Empty
                description="No games found matching your criteria."
                style={{ padding: "50px 0" }}
              />
            ) : (
              <div style={{ minHeight: "300px" }}></div>
            )}

            {totalGames && totalGames > pageSize && (
              <Row justify="center" style={{ marginTop: 32 }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalGames}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={["12", "24", "36"]}
                />
              </Row>
            )}
          </>
        )}
      </Content>
    </Layout>
  );
};

export default GamesPage;
