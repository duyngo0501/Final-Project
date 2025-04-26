import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout, Row, Col, Typography, Spin, Alert, message } from "antd";
import GameGrid from "@/components/home/GameGrid";
import dayjs, { Dayjs } from "dayjs";
import FilterSidebar from "@/components/games/FilterSidebar";
import ControlsHeader from "@/components/games/ControlsHeader";
import GamePagination from "@/components/games/GamePagination";
import { useCart } from "@/contexts/CartContext";
import { useGames } from "@/hooks/useGames";
import { Game } from "@/types/game";

const { Content } = Layout;
const { Title } = Typography;

const MIN_PRICE = 0;
const MAX_PRICE = 100;

const safeParseInt = (param: string | null, defaultValue: number): number => {
  const parsed = parseInt(param || "", 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * @description Page for browsing, filtering, sorting, and paginating games.
 * Fetches data from the API using useGames hook.
 * @returns {React.FC} The GamesPage component.
 */
const GamesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    () => searchParams.get("category") || "All"
  );
  const [sortOption, setSortOption] = useState<string>(
    () => searchParams.get("sort") || "name_asc"
  );
  const [currentPage, setCurrentPage] = useState<number>(() =>
    safeParseInt(searchParams.get("page"), 1)
  );
  const [pageSize, setPageSize] = useState<number>(() =>
    safeParseInt(searchParams.get("limit"), 12)
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    () => (searchParams.get("view") as "grid" | "list") || "grid"
  );
  const [searchInput, setSearchInput] = useState<string>(
    () => searchParams.get("q") || ""
  );
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState<string>(searchInput);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    () => searchParams.getAll("platform") || []
  );

  const { addItem, isMutating: isCartMutating } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    games,
    totalGames,
    isLoading: loading,
    isError: error,
    mutate: mutateGames,
  } = useGames({
    category: selectedCategory === "All" ? undefined : selectedCategory,
    searchTerm: debouncedSearchTerm,
    sortBy: sortOption,
    currentPage,
    pageSize,
  });

  const currentGames = games;
  const totalResults = totalGames;

  useEffect(() => {
    const params: Record<string, string | string[]> = {};
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (debouncedSearchTerm) params.q = debouncedSearchTerm;
    if (sortOption !== "name_asc") params.sort = sortOption;
    if (currentPage !== 1) params.page = currentPage.toString();
    if (pageSize !== 12) params.limit = pageSize.toString();
    if (viewMode !== "grid") params.view = viewMode;
    if (selectedPlatforms.length > 0) params.platform = selectedPlatforms;

    setSearchParams(params, { replace: true });
  }, [
    selectedCategory,
    debouncedSearchTerm,
    sortOption,
    currentPage,
    pageSize,
    viewMode,
    selectedPlatforms,
    setSearchParams,
  ]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1);
    }
  };

  const handleQuickBuy = useCallback(
    async (game: Game) => {
      console.log(`Quick Buy clicked for game: ${game.title} (ID: ${game.id})`);
      try {
        await addItem(game, 1);
        message.success(`${game.title} added to cart!`);
      } catch (error) {
        console.error("Failed to add item via Quick Buy:", error);
        message.error("Failed to add item to cart. Please try again.");
      }
    },
    [addItem]
  );

  const availableCategories = useMemo(() => ["All", ...[]], [games]);
  const availablePlatforms = useMemo(() => [], [games]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory("All");
    setSearchInput("");
    setSelectedPlatforms([]);
    setSortOption("name_asc");
    setCurrentPage(1);
    setViewMode("grid");
  }, [
    setSelectedCategory,
    setSearchInput,
    setSelectedPlatforms,
    setSortOption,
    setCurrentPage,
    setViewMode,
  ]);

  const handleClearCategory = () => {
    setSelectedCategory("All");
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setCurrentPage(1);
  };

  const handleViewModeChange = (e: any) => {
    const newMode = e.target.value;
    setViewMode(newMode);
  };

  const handlePlatformChange = (checkedValues: string[]) => {
    setSelectedPlatforms(checkedValues);
    setCurrentPage(1);
  };

  const handleClearPlatforms = () => {
    setSelectedPlatforms([]);
    setCurrentPage(1);
  };

  const handleClearPlatform = (platformToRemove: string) => {
    setSelectedPlatforms((prev) => prev.filter((p) => p !== platformToRemove));
    setCurrentPage(1);
  };

  return (
    <Layout>
      <Content style={{ padding: "0 50px", marginTop: 20 }}>
        <Title level={2}>Browse Games</Title>
        <Row gutter={24}>
          <Col xs={24} md={6}>
            <FilterSidebar
              categories={["All", "Action", "RPG"]}
              platforms={["PC", "PlayStation", "Xbox"]}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              priceRange={undefined}
              onPriceChange={() => {}}
              selectedRating={null}
              onRatingChange={() => {}}
              selectedPlatforms={selectedPlatforms}
              onPlatformChange={handlePlatformChange}
              releaseDateRange={undefined}
              onReleaseDateChange={() => {}}
              onClearFilters={handleClearFilters}
              onClearCategory={handleClearCategory}
              onClearPrice={undefined}
              onClearRating={undefined}
              onClearPlatforms={handleClearPlatforms}
              onClearPlatform={handleClearPlatform}
              onClearReleaseDate={undefined}
            />
          </Col>
          <Col xs={24} md={18}>
            <ControlsHeader
              sortOption={sortOption}
              onSortChange={handleSortChange}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              searchTerm={searchInput}
              onSearchChange={handleSearchInputChange}
              totalResults={totalResults}
              onClearSearch={handleClearSearch}
            />
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="large" />
              </div>
            ) : error ? (
              <Alert
                message="Error loading games"
                description={
                  error.message ||
                  "Could not load games. Please try again later."
                }
                type="error"
                showIcon
              />
            ) : (
              <>
                <GameGrid
                  games={currentGames}
                  onQuickBuy={handleQuickBuy}
                  isCartMutating={isCartMutating}
                />
                <GamePagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalResults={totalResults}
                  onPageChange={handlePageChange}
                />
                {totalResults === 0 && !loading && (
                  <Alert
                    message="No games found matching your criteria."
                    type="info"
                    showIcon
                    style={{ marginTop: 20 }}
                  />
                )}
              </>
            )}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default GamesPage;
