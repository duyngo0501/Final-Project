import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout, Row, Col, Typography, Spin, Alert, Select, Space } from "antd";
import GameCard from "@/components/game/GameCard";
import FilterSidebar from "@/components/games/FilterSidebar";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc"; // Import UTC plugin
import { useCart } from "@/contexts/CartContext"; // Import Cart Context hook
import { useGameControllerListGames } from "@/gen/query/GamesHooks/useGameControllerListGames"; // Import SWR Hook for games
import { Game } from "@/gen/types"; // Import Game type from generated types

dayjs.extend(isBetween);
dayjs.extend(utc); // Use UTC plugin

// --- Helper Functions for URL Params ---
const getParam = (params: URLSearchParams, key: string): string | undefined =>
  params.get(key) ?? undefined;

const getParamAsNumber = (
  params: URLSearchParams,
  key: string
): number | undefined => {
  const value = params.get(key);
  const num = value ? parseInt(value, 10) : NaN;
  return !isNaN(num) ? num : undefined;
};

const getParamAsArray = (params: URLSearchParams, key: string): string[] => {
  const value = params.get(key);
  return value ? value.split(",") : [];
};

const getParamAsDate = (
  params: URLSearchParams,
  key: string
): dayjs.Dayjs | null => {
  const value = params.get(key);
  // Ensure parsing happens in UTC to avoid timezone shifts
  const date = value ? dayjs.utc(value) : null;
  return date && date.isValid() ? date : null;
};

const formatDateParam = (date: dayjs.Dayjs | null): string | undefined => {
  // Format as ISO string (YYYY-MM-DD) in UTC
  return date ? date.utc().format("YYYY-MM-DD") : undefined;
};
// --- End Helper Functions ---

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Remove Mock Game Type and related mock data/functions
// interface MockGame extends Game { ... }
// const mockFetchAllGames = async (): Promise<MockGame[]> => { ... };
// const MOCK_CATEGORIES = ...;
// const MOCK_PLATFORMS = ...;
// const MIN_PRICE = ...;
// const MAX_PRICE = ...;
// const RATING_OPTIONS = ...;

// --- TODO: Replace mocks with data potentially fetched from API ---
// These might come from separate API calls or be hardcoded if static
const MOCK_CATEGORIES = ["Strategy", "Action", "RPG", "Puzzle", "Simulation"];
const MOCK_PLATFORMS = [
  "PC",
  "PlayStation",
  "Xbox",
  "Nintendo Switch",
  "Mobile",
];
const MIN_PRICE = 0;
const MAX_PRICE = 100;
const RATING_OPTIONS = [
  { value: 4, label: "4 Stars & Up" },
  { value: 3, label: "3 Stars & Up" },
  { value: 2, label: "2 Stars & Up" },
  { value: 1, label: "1 Star & Up" },
];
// --- End TODO ---

type SortOption =
  | "title-asc"
  | "title-desc"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "releaseDate-desc";

const DEFAULT_SORT_OPTION: SortOption = "title-asc";

/**
 * SearchResultsPage Component
 * Displays game search results based on query param, filters, and sorting.
 * Fetches games using SWR based on URL parameters.
 * Integrates FilterSidebar for user controls.
 * Integrates CartContext for adding items.
 *
 * @returns {React.ReactElement} The rendered search results page.
 */
const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = getParam(searchParams, "q") || "";

  // --- Get Filters and Sort from URL Search Params ---
  const selectedCategory = getParam(searchParams, "category");
  const minPrice = getParamAsNumber(searchParams, "minPrice");
  const maxPrice = getParamAsNumber(searchParams, "maxPrice");
  const minRating = getParamAsNumber(searchParams, "rating");
  const selectedPlatforms = getParamAsArray(searchParams, "platforms");
  const startDate = getParamAsDate(searchParams, "startDate");
  const endDate = getParamAsDate(searchParams, "endDate");
  const sortOption =
    (getParam(searchParams, "sort") as SortOption) ?? DEFAULT_SORT_OPTION;

  // Derive priceRange for FilterSidebar UI component
  const displayPriceRange: [number, number] = [
    minPrice ?? MIN_PRICE,
    maxPrice ?? MAX_PRICE,
  ];
  const displayReleaseDateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [
    startDate,
    endDate,
  ];

  // --- Map SortOption to API parameters ---
  const { sort_by, sort_order } = useMemo(() => {
    switch (sortOption) {
      case "title-asc":
        return { sort_by: "title", sort_order: "asc" };
      case "title-desc":
        return { sort_by: "title", sort_order: "desc" };
      case "price-asc":
        return { sort_by: "price", sort_order: "asc" };
      case "price-desc":
        return { sort_by: "price", sort_order: "desc" };
      case "rating-desc":
        return { sort_by: "rating", sort_order: "desc" };
      case "releaseDate-desc":
        return { sort_by: "release_date", sort_order: "desc" };
      default:
        return { sort_by: "title", sort_order: "asc" };
    }
  }, [sortOption]);

  // --- Fetch Games using SWR Hook ---
  const {
    data: gamesResponse,
    error: fetchError,
    isLoading: isFetchingGames,
  } = useGameControllerListGames(
    undefined, // No request body for GET
    {
      // Pass filters and sorting from URL params to the API query params
      search: query || undefined,
      sort_by: sort_by,
      is_asc: sort_order === "asc",
      limit: 20,
    },
    {
      query: {
        keepPreviousData: true,
        revalidateOnFocus: false,
      },
    }
  );

  // Extract games list from the response - Assume structure is { data: { items: Game[] } }
  // Use ApiGame alias
  const games: Game[] = gamesResponse?.data?.items ?? [];

  // --- Integrate Cart Context ---
  const { addItem: addToCart, isMutating: isCartMutating } = useCart();

  // --- Handlers to Update URL Search Params ---

  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined | null>) => {
      setSearchParams(
        (prevParams) => {
          const newParams = new URLSearchParams(prevParams);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") {
              newParams.delete(key);
            } else {
              newParams.set(key, value);
            }
          });
          return newParams;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleCategoryChange = useCallback(
    (value: string | undefined) => {
      updateSearchParams({ category: value });
    },
    [updateSearchParams]
  );

  const handlePriceChange = useCallback(
    (value: [number, number]) => {
      updateSearchParams({
        minPrice: value[0] === MIN_PRICE ? undefined : String(value[0]),
        maxPrice: value[1] === MAX_PRICE ? undefined : String(value[1]),
      });
    },
    [updateSearchParams]
  );

  const handleRatingChange = useCallback(
    (value: number | undefined) => {
      updateSearchParams({
        rating: value !== undefined ? String(value) : undefined,
      });
    },
    [updateSearchParams]
  );

  const handlePlatformChange = useCallback(
    (checkedValues: string[]) => {
      updateSearchParams({
        platforms:
          checkedValues.length > 0 ? checkedValues.join(",") : undefined,
      });
    },
    [updateSearchParams]
  );

  const handleReleaseDateChange = useCallback(
    (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
      const [start, end] = dates ?? [null, null];
      updateSearchParams({
        startDate: formatDateParam(start),
        endDate: formatDateParam(end),
      });
    },
    [updateSearchParams]
  );

  const handleClearFilters = useCallback(() => {
    updateSearchParams({
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      rating: undefined,
      platforms: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  }, [updateSearchParams]);

  const handleSortChange = useCallback(
    (value: SortOption) => {
      updateSearchParams({
        sort: value === DEFAULT_SORT_OPTION ? undefined : value,
      });
    },
    [updateSearchParams]
  );

  // --- Render Logic ---
  return (
    <Layout style={{ background: "#fff", minHeight: "85vh" }}>
      <Sider
        width={280}
        style={{
          background: "#f0f2f5",
          padding: "20px",
          overflow: "auto",
          height: "calc(100vh - 64px)",
          position: "sticky",
          top: "64px",
        }}
      >
        <FilterSidebar
          minPrice={MIN_PRICE}
          maxPrice={MAX_PRICE}
          categories={MOCK_CATEGORIES}
          platforms={MOCK_PLATFORMS}
          ratingOptions={RATING_OPTIONS}
          selectedCategory={selectedCategory ?? ""}
          priceRange={displayPriceRange}
          selectedRating={minRating ?? null}
          selectedPlatforms={selectedPlatforms}
          releaseDateRange={displayReleaseDateRange}
          onCategoryChange={handleCategoryChange}
          onPriceChange={(value: number[]) =>
            handlePriceChange(value as [number, number])
          }
          onRatingChange={(value: number | null) =>
            handleRatingChange(value ?? undefined)
          }
          onPlatformChange={handlePlatformChange}
          onReleaseDateChange={handleReleaseDateChange}
          onClearFilters={handleClearFilters}
        />
      </Sider>
      <Layout style={{ padding: "0 24px 24px" }}>
        <Content style={{ padding: "24px", minHeight: 280 }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={4}>
                  {query ? `Search Results for "${query}"` : "Browse Games"}
                </Title>
                <Text type="secondary">{games.length} games found</Text>
              </Col>
              <Col>
                <Select
                  defaultValue={sortOption}
                  style={{ width: 200 }}
                  onChange={handleSortChange}
                >
                  <Option value="title-asc">Title (A-Z)</Option>
                  <Option value="title-desc">Title (Z-A)</Option>
                  <Option value="price-asc">Price (Low-High)</Option>
                  <Option value="price-desc">Price (High-Low)</Option>
                  <Option value="rating-desc">Rating (High-Low)</Option>
                  <Option value="releaseDate-desc">
                    Release Date (Newest)
                  </Option>
                </Select>
              </Col>
            </Row>

            {isFetchingGames ? (
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <Spin size="large" />
              </div>
            ) : fetchError ? (
              <Alert
                message={
                  fetchError instanceof Error
                    ? fetchError.message
                    : String(fetchError ?? "Unknown error")
                }
                type="error"
                showIcon
                style={{ marginBottom: "20px" }}
              />
            ) : (
              <>
                {games.length === 0 ? (
                  <Typography.Text type="secondary">
                    No games found matching your current search and filters. Try
                    adjusting your criteria.
                  </Typography.Text>
                ) : (
                  <Row gutter={[16, 16]}>
                    {games.map((game) => (
                      <Col key={game.id} xs={24} sm={12} md={8} lg={6}>
                        <GameCard
                          game={game}
                          // onAddToCart={() => addToCart(game)}
                          isAddingToCart={isCartMutating}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
                {/* TODO: Add Pagination controls here if API supports it */}
              </>
            )}
          </Space>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SearchResultsPage;
