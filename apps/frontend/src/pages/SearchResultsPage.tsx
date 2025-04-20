import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout, Row, Col, Typography, Spin, Alert, Select, Space } from "antd";
import GameCard from "@/components/game/GameCard";
import FilterSidebar from "@/components/games/FilterSidebar";
import { Game } from "@/types/game";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc"; // Import UTC plugin

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

// Extended Mock Game Type for filtering/sorting demo
interface MockGame extends Game {
  rating: number;
  releaseDate: string; // Keep as ISO string from mock data
  platforms: string[];
}

// Mock search function - Fetches ALL games, filtering happens client-side now
// In a real app, the API would handle filtering/sorting based on params
const mockFetchAllGames = async (): Promise<MockGame[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // More detailed mock data
  const allGames: MockGame[] = [
    {
      id: 1,
      title: "Galactic Conquest",
      price: 59.99,
      category: "Strategy",
      thumbnail: "/placeholder-image.jpg",
      description: "Conquer the galaxy!",
      rating: 4.5,
      releaseDate: "2023-05-15T00:00:00Z",
      platforms: ["PC", "PlayStation"],
    },
    {
      id: 2,
      title: "Cyberpunk Runner",
      price: 49.99,
      category: "Action",
      thumbnail: "/placeholder-image.jpg",
      description: "Run through neon streets.",
      rating: 4.0,
      releaseDate: "2022-11-20T00:00:00Z",
      platforms: ["PC", "Xbox"],
    },
    {
      id: 3,
      title: "Fantasy Quest RPG",
      price: 69.99,
      category: "RPG",
      thumbnail: "/placeholder-image.jpg",
      description: "Embark on an epic quest.",
      rating: 4.8,
      releaseDate: "2023-08-01T00:00:00Z",
      platforms: ["PC", "PlayStation", "Xbox"],
    },
    {
      id: 4,
      title: "Indie Puzzle Game",
      price: 19.99,
      category: "Puzzle",
      thumbnail: "/placeholder-image.jpg",
      description: "Solve challenging puzzles.",
      rating: 3.5,
      releaseDate: "2021-03-10T00:00:00Z",
      platforms: ["PC", "Nintendo Switch"],
    },
    {
      id: 5,
      title: "Space Sim X",
      price: 79.99,
      category: "Simulation",
      thumbnail: "/placeholder-image.jpg",
      description: "Explore the vastness of space.",
      rating: 4.2,
      releaseDate: "2023-01-25T00:00:00Z",
      platforms: ["PC"],
    },
    {
      id: 6,
      title: "Strategy Arena",
      price: 29.99,
      category: "Strategy",
      thumbnail: "/placeholder-image.jpg",
      description: "Compete in strategic battles.",
      rating: 3.9,
      releaseDate: "2022-09-05T00:00:00Z",
      platforms: ["PC", "Mobile"],
    },
  ];
  return allGames;
};

// Mock data for filters
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
 * Fetches all games and performs filtering/sorting client-side (mock).
 * Integrates FilterSidebar for user controls.
 * Filter/Sort state is managed in URL query parameters.
 *
 * @returns {React.ReactElement} The rendered search results page.
 */
const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams(); // Get setSearchParams
  const query = getParam(searchParams, "q") || "";

  // State for fetched data
  const [allGames, setAllGames] = useState<MockGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filter/sort state from URL Search Params
  // Note: We still keep local state, but it's derived from the URL initially
  // and subsequent updates modify the URL, which triggers re-renders and useMemo recalculation.
  const initialCategory = getParam(searchParams, "category");
  const initialMinPrice =
    getParamAsNumber(searchParams, "minPrice") ?? MIN_PRICE;
  const initialMaxPrice =
    getParamAsNumber(searchParams, "maxPrice") ?? MAX_PRICE;
  const initialRating = getParamAsNumber(searchParams, "rating");
  const initialPlatforms = getParamAsArray(searchParams, "platforms");
  const initialStartDate = getParamAsDate(searchParams, "startDate");
  const initialEndDate = getParamAsDate(searchParams, "endDate");
  const initialSort =
    (getParam(searchParams, "sort") as SortOption) ?? DEFAULT_SORT_OPTION;

  // Filter state (derived from URL, UI components interact via handlers)
  const selectedCategory = initialCategory;
  const priceRange: [number, number] = [initialMinPrice, initialMaxPrice];
  const minRating = initialRating;
  const selectedPlatforms = initialPlatforms;
  const releaseDateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [
    initialStartDate,
    initialEndDate,
  ];
  const sortOption = initialSort;

  // Fetch all games once on mount
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      try {
        const games = await mockFetchAllGames();
        setAllGames(games);
      } catch (err) {
        console.error("Fetch failed:", err);
        setError("Failed to fetch game data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // Filter and sort games based on state derived from URL params
  const filteredAndSortedGames = useMemo(() => {
    let filtered = [...allGames];

    // Apply search query filter (if any)
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      filtered = filtered.filter(
        (game) =>
          game.title.toLowerCase().includes(lowerCaseQuery) ||
          game.category.toLowerCase().includes(lowerCaseQuery) ||
          game.description?.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((game) => game.category === selectedCategory);
    }

    // Apply price filter
    filtered = filtered.filter(
      (game) => game.price >= priceRange[0] && game.price <= priceRange[1]
    );

    // Apply rating filter
    if (minRating !== undefined) {
      filtered = filtered.filter((game) => game.rating >= minRating);
    }

    // Apply platform filter
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter((game) =>
        selectedPlatforms.some((platform) => game.platforms.includes(platform))
      );
    }

    // Apply release date filter
    const [startDate, endDate] = releaseDateRange;
    if (startDate && endDate) {
      filtered = filtered.filter((game) => {
        // Parse game release date as UTC
        const releaseDay = dayjs.utc(game.releaseDate);
        // Ensure comparison dates are also treated as UTC start/end of day
        const start = startDate.utc().startOf("day");
        const end = endDate.utc().endOf("day"); // Use end of day for inclusivity
        // Use isBetween or direct comparison
        return (
          releaseDay.isAfter(start.subtract(1, "millisecond")) &&
          releaseDay.isBefore(end.add(1, "millisecond"))
        );
      });
    }

    // Apply sorting
    switch (sortOption) {
      case "title-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "releaseDate-desc":
        filtered.sort(
          (a, b) =>
            // Compare UTC timestamps
            dayjs.utc(b.releaseDate).valueOf() -
            dayjs.utc(a.releaseDate).valueOf()
        );
        break;
      default:
        break; // Should not happen
    }

    return filtered;
  }, [
    allGames,
    query,
    selectedCategory,
    priceRange,
    minRating,
    selectedPlatforms,
    releaseDateRange,
    sortOption,
  ]);

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
      ); // Use replace to avoid excessive history entries
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

  return (
    <Layout style={{ background: "#fff", minHeight: "85vh" }}>
      <Sider
        width={280}
        style={{
          background: "#f0f2f5",
          padding: "20px",
          overflow: "auto",
          height: "calc(100vh - 64px)", // Adjust based on header height
          position: "sticky",
          top: "64px", // Adjust based on header height
        }}
      >
        <FilterSidebar
          // Pass state derived from URL to the sidebar
          minPrice={MIN_PRICE}
          maxPrice={MAX_PRICE}
          categories={MOCK_CATEGORIES}
          platforms={MOCK_PLATFORMS}
          ratingOptions={RATING_OPTIONS}
          selectedCategory={selectedCategory ?? ""}
          priceRange={priceRange}
          selectedRating={minRating ?? null}
          selectedPlatforms={selectedPlatforms}
          releaseDateRange={releaseDateRange}
          // Pass handlers that update the URL
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
          <Title level={2} style={{ marginBottom: "24px" }}>
            Search Results {query ? `for "${query}"` : ""}
          </Title>

          <Row justify="end" style={{ marginBottom: "24px" }}>
            <Space>
              <Text>Sort by:</Text>
              <Select
                value={sortOption} // Use state derived from URL
                style={{ width: 200 }}
                onChange={handleSortChange} // Handler updates URL
              >
                <Option value="title-asc">Name (A-Z)</Option>
                <Option value="title-desc">Name (Z-A)</Option>
                <Option value="price-asc">Price (Low to High)</Option>
                <Option value="price-desc">Price (High to Low)</Option>
                <Option value="rating-desc">Rating (High to Low)</Option>
                <Option value="releaseDate-desc">Release Date (Newest)</Option>
              </Select>
            </Space>
          </Row>

          {loading && (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <Spin size="large" />
            </div>
          )}

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: "20px" }}
            />
          )}

          {!loading && !error && (
            <>
              <Text style={{ display: "block", marginBottom: "16px" }}>
                Found {filteredAndSortedGames.length} game
                {filteredAndSortedGames.length !== 1 ? "s" : ""}.
              </Text>
              {filteredAndSortedGames.length === 0 ? (
                <Typography.Text>
                  No games found matching your current search and filters. Try
                  adjusting your criteria.
                </Typography.Text>
              ) : (
                <Row gutter={[16, 16]}>
                  {filteredAndSortedGames.map((game) => (
                    <Col key={game.id} xs={24} sm={12} md={8} lg={8} xl={6}>
                      <GameCard game={game} />
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SearchResultsPage;
