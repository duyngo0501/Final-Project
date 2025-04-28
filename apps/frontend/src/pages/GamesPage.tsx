import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout, Row, Col, Typography, Spin, Alert, message, Flex } from "antd";
import GameGrid from "@/components/home/GameGrid";
import FilterSidebar from "@/components/games/FilterSidebar";
import ControlsHeader from "@/components/games/ControlsHeader";
import GamePagination from "@/components/games/GamePagination";
import { useCart } from "@/contexts/CartContext";
import { useGameControllerListGames } from "@/gen/query/GamesHooks";
import { GameWithRelations } from "@/gen/types";

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
 * Fetches data directly using the generated useProductControllerListProducts hook.
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
  const [priceRange, setPriceRange] = useState<[number, number]>([
    MIN_PRICE,
    MAX_PRICE,
  ]);

  const { addItem, isMutating: isCartMutating } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const apiParams = useMemo(() => {
    const skip = (currentPage - 1) * pageSize;
    const sortParts = sortOption.split("_");
    const sortByField = sortParts[0];
    const isAsc = sortParts[1]?.toLowerCase() !== "desc";

    return {
      limit: pageSize,
      skip: skip,
      category: selectedCategory === "All" ? undefined : [selectedCategory],
      search: debouncedSearchTerm || undefined,
      platform: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
      sort_by: sortByField,
      is_asc: isAsc,
    };
  }, [
    currentPage,
    pageSize,
    selectedCategory,
    debouncedSearchTerm,
    selectedPlatforms,
    sortOption,
  ]);

  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useGameControllerListGames(undefined, { ...apiParams });

  const apiResponse = response?.data;
  const gamesList = apiResponse?.items;

  const currentGames = gamesList;
  const totalResults = apiResponse?.total ?? 0;

  useEffect(() => {
    const params: Record<string, string | string[]> = {};
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
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

  const handlePriceChange = (value: number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange([value[0], value[1]]);
      setCurrentPage(1);
    }
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

  const availableCategories = useMemo(
    () => ["All", "Action", "RPG", "Strategy", "Adventure"],
    []
  );
  const availablePlatforms = useMemo(
    () => ["PC", "PlayStation 5", "Xbox Series X", "Nintendo Switch"],
    []
  );

  const handleClearFilters = useCallback(() => {
    setSelectedCategory("All");
    setSearchInput("");
    setSelectedPlatforms([]);
    setSortOption("name_asc");
    setCurrentPage(1);
    setViewMode("grid");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
  }, []);

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

  if (isLoading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ padding: "50px", textAlign: "center" }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "An unexpected error occurred while fetching games.";
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ padding: "50px" }}>
          <Alert
            message="Error"
            description={errorMessage}
            type="error"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "0 50px", marginTop: "20px" }}>
        <Title level={2}>Browse Games</Title>
        <Flex gap="large" style={{ height: "calc(100vh - 150px)" }}>
          <div
            style={{
              width: "280px",
              flexShrink: 0,
              padding: "10px",
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              overflowY: "auto",
            }}
          >
            <FilterSidebar
              minPrice={MIN_PRICE}
              maxPrice={MAX_PRICE}
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              selectedPlatforms={selectedPlatforms}
              onClearFilters={handleClearFilters}
              onCategoryChange={handleCategoryChange}
              onPriceChange={handlePriceChange}
              onPlatformChange={handlePlatformChange}
              categories={availableCategories}
              platforms={availablePlatforms}
              selectedRating={null}
              releaseDateRange={[null, null]}
              onRatingChange={(value) => {
                console.log("Rating filter not implemented yet:", value);
              }}
              onReleaseDateChange={(dates) => {
                console.log("Date filter not implemented yet:", dates);
              }}
              ratingOptions={[
                { value: 4, label: "4 Stars & Up" },
                { value: 3, label: "3 Stars & Up" },
                { value: 2, label: "2 Stars & Up" },
                { value: 1, label: "1 Star & Up" },
              ]}
            />
          </div>
          <Flex vertical flex={1} style={{ minWidth: 0 }}>
            <ControlsHeader
              sortOption={sortOption}
              onSortChange={handleSortChange}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              searchInput={searchInput}
              onSearchChange={handleSearchInputChange}
            />
            <Flex flex={1} style={{ minHeight: 0, marginTop: "16px" }}>
              <GameGrid games={currentGames || []} />
            </Flex>
            <GamePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalResults={totalResults}
              onPageChange={handlePageChange}
            />
          </Flex>
        </Flex>
      </Content>
    </Layout>
  );
};

export default GamesPage;
