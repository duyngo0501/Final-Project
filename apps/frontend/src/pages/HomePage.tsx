import React, { useState, useCallback, useMemo } from "react";
import { Layout, Row, Col, Spin, Alert, message } from "antd";
import Navbar from "@/components/layout/Navbar"; // Assuming Navbar is in layout
// import PromotionBanner from "@/components/home/PromotionBanner"; // Removed import
import GameCategories from "@/components/home/GameCategories";
import GameGrid from "@/components/home/GameGrid";
import { useCart } from "@/contexts/CartContext"; // Import the cart hook
// Remove old hook import
// import { useGames } from "@/hooks/useGames"; // Import the mock SWR hook
// Import generated hook
import { useGameControllerListGames } from "@/gen/query/GamesHooks";
// Try importing the specific response model name used in the backend router
// import { GameListingResponse } from "@/gen/types"; // TODO: Verify type name
// TODO: Verify correct import path and type name for generated types
import { GameWithRelations } from "@/gen/types"; // Assuming this type exists for items
// Import the actual item schema identified by the linter - FAILED
// import { ProductItemSchema } from "@/gen/types"; // Use the correct item type
// import { Game } from "@/types/game"; // REMOVE unused local type import

const { Content } = Layout;

/**
 * @description The main Home Page component orchestrating layout and sections.
 * Fetches games using the generated useProductControllerListProducts hook based on selected category
 * and provides cart functionality.
 * @returns {React.FC} The HomePage component.
 */
const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("pc"); // Default category
  // Get addItem function directly, context manages the state
  const { addItem, isMutating: isCartMutating } = useCart();

  // --- Prepare API Params --- //
  const apiParams = useMemo(() => {
    return {
      limit: 12, // Default limit for homepage display
      skip: 0, // Default skip for first page
      // Handle 'All' category case for the API
      category: selectedCategory === "All" ? undefined : [selectedCategory], // Pass as array if backend expects list
      // Add other default params if needed (e.g., default sort)
      sort_by: "name",
      is_asc: true,
    };
  }, [selectedCategory]);

  // --- Use the generated SWR hook --- //
  const {
    data: response, // Raw SWR response (AxiosResponse)
    isLoading, // SWR provides isLoading
    error, // Actual error object
    mutate, // SWR's mutate function
    // isError is not directly provided by SWR, check 'error' object instead
  } = useGameControllerListGames(
    // Pass params directly (spread)
    { ...apiParams }, // Adjust based on actual hook signature
    {}
  );

  // --- Process API Response --- //
  // DATA EXTRACTION: Access data from response.data
  const apiResponse = response?.data;
  const gamesList = apiResponse?.items; // Directly use items list

  // --- REMOVE Map API data to local Game type --- //
  /*
  const mappedGames = useMemo(() => {
    // Use the correct type for items from the generated GameListingResponse
    return (
      apiResponse?.items?.map(
        (product: GameWithRelations): Game => ({ // Use correct generated item type
          id: product.id,
          title: product.name,
          thumbnail: product.background_image ?? "/placeholder-image.jpg",
          price: typeof product.price === "number" ? product.price : 0,
          category: product.categories && product.categories.length > 0 ? product.categories[0].name // Access name property
                    : "Unknown",
          description: product.description ?? undefined,
          rating: typeof product.rating === "number" ? product.rating : undefined,
          releaseDate: product.released_date ? new Date(product.released_date).toISOString() : undefined,
          // Remove fields not present in local Game type
          // is_custom: (product as any).is_custom ?? false,
          // created_at: product.created_at ? new Date(product.created_at).toISOString() : new Date().toISOString(),
          // updated_at: product.updated_at ? new Date(product.updated_at).toISOString() : new Date().toISOString(),
        })
      ) ?? []
    );
  }, [apiResponse?.items]);
  */

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // No need to manually refetch, SWR/TanStack Query handles it when apiParams change
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "0 48px", marginTop: "20px" }}>
        {" "}
        {/* Added top margin */}
        {/* <PromotionBanner /> */} {/* Removed usage */}
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
          {error && (
            <Alert
              message="Error Loading Games"
              description={
                // FIX: Extract error message safely
                error instanceof Error
                  ? error.message
                  : typeof error === "object" &&
                      error !== null &&
                      "message" in error
                    ? String(error.message)
                    : "Failed to load games. Please try again later."
              }
              type="error"
              showIcon
              style={{ marginBottom: "20px" }}
            />
          )}
          {!isLoading && !error && (
            <GameGrid
              games={gamesList || []} // Pass direct list
            />
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;
