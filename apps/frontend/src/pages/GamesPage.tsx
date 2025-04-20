import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams
import {
  Layout,
  Row,
  Col,
  Typography,
  Select,
  Input,
  Pagination,
  Spin,
  Alert,
  Space,
  Divider,
  Slider,
  Rate,
  Button,
  Tag,
  Radio,
  Checkbox,
  DatePicker,
  message, // Import message for feedback
} from "antd";
import GameGrid from "@/components/home/GameGrid"; // Assuming GameGrid takes games and onQuickBuy
import { Game } from "@/types/game"; // Use the imported Game type
import dayjs, { Dayjs } from "dayjs"; // Import dayjs for date handling
import FilterSidebar from "@/components/games/FilterSidebar";
import ControlsHeader from "@/components/games/ControlsHeader";
import GamePagination from "@/components/games/GamePagination";
import { useCart } from "@/contexts/CartContext"; // Import useCart

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

// Mock Game Data - Use imported Game type and number ID
const mockGames: Game[] = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1, // Generate numeric ID
  title: `Awesome Game ${i + 1}`,
  // Always use cat image URL
  thumbnail: `https://cataas.com/cat/says/game-${i + 1}?width=300&height=180`,
  price: Math.floor(Math.random() * 50) + 10,
  discountedPrice: i % 3 === 0 ? Math.floor(Math.random() * 10) + 5 : undefined,
  category: ["Action", "Adventure", "RPG", "Strategy", "Simulation"][i % 5],
  rating: Math.round((Math.random() * 4 + 1) * 10) / 10,
  releaseDate: `202${Math.floor(i / 10)}-${String((i % 12) + 1).padStart(2, "0")}-01T00:00:00Z`,
  description: `This is the description for Awesome Game ${i + 1}. It's really awesome.`,
  // Add platform property to match FilterSidebar usage
  platform: ["PC", "PlayStation", "Xbox", "Switch"][i % 4],
}));

const MOCK_CATEGORIES = [
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Simulation",
];

// Mock platforms
const MOCK_PLATFORMS = [
  "PC",
  "PlayStation",
  "Xbox",
  "Nintendo Switch",
  "Mobile",
];

// Constants for filters
const MIN_PRICE = 0;
const MAX_PRICE = 100; // Adjust based on expected max price
const RATING_OPTIONS = [
  { value: 4, label: "4 Stars & Up" },
  { value: 3, label: "3 Stars & Up" },
  { value: 2, label: "2 Stars & Up" },
  { value: 1, label: "1 Star & Up" },
];

/**
 * @description Helper to safely parse integer from URL param.
 * @param {string | null} param The URL parameter value.
 * @param {number} defaultValue The default value if parsing fails.
 * @returns {number} The parsed integer or the default value.
 */
const safeParseInt = (param: string | null, defaultValue: number): number => {
  const parsed = parseInt(param || "", 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * @description Helper to safely parse float from URL param (for potential rating filter later).
 * @param {string | null} param The URL parameter value.
 * @param {number | null} defaultValue The default value if parsing fails.
 * @returns {number | null} The parsed float or the default value.
 */
const safeParseFloat = (
  param: string | null,
  defaultValue: number | null
): number | null => {
  const parsed = parseFloat(param || "");
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * @description Page for browsing, filtering, sorting, and paginating games.
 * @returns {React.FC} The GamesPage component.
 */
const GamesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams(); // Use the hook
  const [allGames] = useState<Game[]>(mockGames); // Holds all games
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize state from URL parameters or defaults
  const [selectedCategory, setSelectedCategory] = useState<string>(
    () => searchParams.get("category") || "All"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const min = safeParseInt(searchParams.get("minPrice"), MIN_PRICE);
    const max = safeParseInt(searchParams.get("maxPrice"), MAX_PRICE);
    return [min, max];
  });
  const [selectedRating, setSelectedRating] = useState<number | null>(null); // Keep state for potential re-add
  const [sortOption, setSortOption] = useState<string>(
    () => searchParams.get("sort") || "default"
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

  // --- Debounced Search State ---
  const [searchInput, setSearchInput] = useState<string>(
    () => searchParams.get("q") || ""
  ); // Immediate input value
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState<string>(searchInput); // Debounced value

  // State for new filters
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    () => searchParams.getAll("platform") || []
  );
  const [releaseDateRange, setReleaseDateRange] = useState<
    [Dayjs | null, Dayjs | null]
  >(() => {
    const start = searchParams.get("releaseStart");
    const end = searchParams.get("releaseEnd");
    return [
      start ? (dayjs(start).isValid() ? dayjs(start) : null) : null,
      end ? (dayjs(end).isValid() ? dayjs(end) : null) : null,
    ];
  });

  const { addItem, isMutating: isCartMutating } = useCart(); // Get cart functions

  // Effect to debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setCurrentPage(1); // Reset page when debounced search term changes
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  // --- Memoized Filtering and Sorting ---
  const processedGames = useMemo(() => {
    setLoading(true); // Indicate processing start
    let results = [...allGames];

    // 1. Filter by category
    if (selectedCategory !== "All") {
      results = results.filter((game) => game.category === selectedCategory);
    }

    // 2. Filter by Price Range
    results = results.filter((game) => {
      const effectivePrice = game.discountedPrice ?? game.price;
      return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
    });

    // 3. Filter by Rating (remains commented out)
    /*
    if (selectedRating !== null) {
        results = results.filter(game => game.rating && game.rating >= selectedRating);
    }
    */

    // 4. Filter by DEBOUNCED search term
    if (debouncedSearchTerm) {
      results = results.filter((game) =>
        game.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // 5. Filter by Platform
    if (selectedPlatforms.length > 0) {
      // Assuming game.platform is a string like "PC" or an array like ["PC", "PlayStation"]
      results = results.filter((game) =>
        selectedPlatforms.some((platform) =>
          Array.isArray(game.platform)
            ? game.platform.includes(platform)
            : game.platform === platform
        )
      );
    }

    // 6. Filter by Release Date
    if (releaseDateRange[0] && releaseDateRange[1]) {
      results = results.filter((game) => {
        const releaseDate = dayjs(game.releaseDate);
        return (
          releaseDate.isAfter(releaseDateRange[0], "day") &&
          releaseDate.isBefore(releaseDateRange[1], "day")
        );
      });
    }

    // 5. Sort results
    switch (sortOption) {
      case "price_asc":
        results.sort(
          (a, b) =>
            (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price)
        );
        break;
      case "price_desc":
        results.sort(
          (a, b) =>
            (b.discountedPrice ?? b.price) - (a.discountedPrice ?? a.price)
        );
        break;
      case "name_asc":
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name_desc":
        results.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "default":
      default:
        results.sort((a, b) => a.id - b.id);
        break;
    }

    setLoading(false); // Indicate processing end
    return results;
    // Depend on the actual filter/sort state variables + debounced search term
  }, [
    selectedCategory,
    priceRange,
    selectedRating,
    debouncedSearchTerm,
    sortOption,
    allGames,
    selectedPlatforms,
    releaseDateRange,
  ]);

  // --- Effect to Update URL Params ---
  // Now depends on debouncedSearchTerm instead of searchTerm
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (priceRange[0] !== MIN_PRICE) params.minPrice = priceRange[0].toString();
    if (priceRange[1] !== MAX_PRICE) params.maxPrice = priceRange[1].toString();
    if (debouncedSearchTerm) params.q = debouncedSearchTerm; // Use debounced value
    if (sortOption !== "default") params.sort = sortOption;
    if (currentPage !== 1) params.page = currentPage.toString();
    if (pageSize !== 12) params.limit = pageSize.toString();
    if (viewMode !== "grid") params.view = viewMode;
    selectedPlatforms.forEach((platform) => (params.platform = platform)); // Note: might need better handling for multi-select
    if (releaseDateRange[0])
      params.releaseStart = releaseDateRange[0].format("YYYY-MM-DD");
    if (releaseDateRange[1])
      params.releaseEnd = releaseDateRange[1].format("YYYY-MM-DD");
    setSearchParams(params, { replace: true });
  }, [
    selectedCategory,
    priceRange,
    selectedRating,
    debouncedSearchTerm,
    sortOption,
    currentPage,
    pageSize,
    viewMode,
    selectedPlatforms,
    releaseDateRange,
    setSearchParams,
  ]);

  // --- Pagination Calculation (uses processedGames) ---
  const totalResults = processedGames.length;
  const startIndex = (currentPage - 1) * pageSize;
  const currentGames = processedGames.slice(startIndex, startIndex + pageSize);

  // State update handlers - Now they just update state, useEffect updates URL
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1); // Reset page when filter changes
  };

  const handlePriceChange = (value: number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange(value as [number, number]);
      setCurrentPage(1); // Reset page when filter changes
    }
  };

  const handleRatingChange = (value: number | null) => {
    setSelectedRating(value);
    setCurrentPage(1); // Reset page when filter changes
  };

  // Search handler now updates the immediate input state
  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setCurrentPage(1); // Reset page when filter changes
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      // Page will be reset to 1 by the pageSize change triggering the URL effect
      // setCurrentPage(1); // No longer needed here if pageSize change resets URL/state
    }
  };

  // Updated quick buy handler to accept the full Game object and add to cart
  const handleQuickBuy = useCallback(
    async (game: Game) => {
      console.log(`Quick Buy clicked for game: ${game.title} (ID: ${game.id})`);
      try {
        await addItem(game, 1); // Add 1 item to the cart
        message.success(`${game.title} added to cart!`);
      } catch (error) {
        console.error("Failed to add item via Quick Buy:", error);
        message.error("Failed to add item to cart. Please try again.");
      }
    },
    [addItem]
  ); // Depend on addItem from useCart

  // Handler to clear all filters
  const handleClearFilters = useCallback(() => {
    setSelectedCategory("All");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSelectedRating(null); // Keep this even if UI commented out
    setSearchInput(""); // Clear immediate search input
    // Debounced term will clear via useEffect
    setSelectedPlatforms([]);
    setReleaseDateRange([null, null]);
    setSortOption("default");
    setCurrentPage(1);
    setViewMode("grid");
  }, [
    setSelectedCategory,
    setPriceRange,
    setSelectedRating,
    setSearchInput,
    setSelectedPlatforms,
    setReleaseDateRange,
    setSortOption,
    setCurrentPage,
    setViewMode,
  ]);

  /**
   * Clears the selected category filter only.
   */
  const handleClearCategory = () => {
    setSelectedCategory("All");
    setCurrentPage(1);
  };

  /**
   * Clears the price range filter only.
   */
  const handleClearPrice = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setCurrentPage(1);
  };

  /**
   * Clears the rating filter only.
   */
  const handleClearRating = () => {
    setSelectedRating(null);
    setCurrentPage(1);
  };

  /**
   * Clears the search filter only.
   */
  const handleClearSearch = () => {
    setSearchInput("");
    setCurrentPage(1);
  };

  /**
   * Handles changing the view mode between grid and list.
   * @param {RadioChangeEvent} e The event object from Ant Design Radio.
   */
  const handleViewModeChange = (e: any) => {
    // TODO: Add proper type RadioChangeEvent if possible
    const newMode = e.target.value;
    setViewMode(newMode);
    // Optionally reset page? Typically not needed for view change.
  };

  /**
   * Handles changes to the selected platform filters.
   * @param {string[]} checkedValues The array of selected platform values.
   */
  const handlePlatformChange = (checkedValues: string[]) => {
    setSelectedPlatforms(checkedValues);
    setCurrentPage(1); // Reset page when filter changes
  };

  /**
   * Handles changes to the release date range filter.
   * @param {RangeValue<Dayjs>} dates The selected date range or null.
   */
  const handleReleaseDateChange = (dates: any) => {
    // TODO: Add proper RangeValue<Dayjs> type
    if (dates && dates.length === 2) {
      setReleaseDateRange([dates[0], dates[1]]);
    } else {
      setReleaseDateRange([null, null]);
    }
    setCurrentPage(1); // Reset page when filter changes
  };

  /**
   * Clears the platform filter only.
   */
  const handleClearPlatforms = () => {
    setSelectedPlatforms([]);
    setCurrentPage(1);
  };

  /**
   * Clears a single selected platform filter.
   * @param {string} platformToRemove The platform to remove from the filter.
   */
  const handleClearPlatform = (platformToRemove: string) => {
    setSelectedPlatforms((prev) => prev.filter((p) => p !== platformToRemove));
    setCurrentPage(1);
  };

  /**
   * Clears the release date filter only.
   */
  const handleClearReleaseDate = () => {
    setReleaseDateRange([null, null]);
    setCurrentPage(1);
  };

  return (
    <Layout style={{ padding: "20px 0", background: "#fff" }}>
      <FilterSidebar
        minPrice={MIN_PRICE}
        maxPrice={MAX_PRICE}
        categories={MOCK_CATEGORIES}
        platforms={MOCK_PLATFORMS}
        selectedCategory={selectedCategory}
        priceRange={priceRange}
        selectedRating={selectedRating}
        selectedPlatforms={selectedPlatforms}
        releaseDateRange={releaseDateRange}
        onClearFilters={handleClearFilters}
        onCategoryChange={handleCategoryChange}
        onPriceChange={handlePriceChange}
        onRatingChange={handleRatingChange}
        onPlatformChange={handlePlatformChange}
        onReleaseDateChange={handleReleaseDateChange}
        ratingOptions={RATING_OPTIONS}
      />
      <Content style={{ padding: "0 24px", minHeight: 280 }}>
        <Title level={2}>Games</Title>
        <ControlsHeader
          searchInput={searchInput}
          sortOption={sortOption}
          viewMode={viewMode}
          onSearchChange={handleSearchInputChange}
          onSortChange={handleSortChange}
          onViewModeChange={handleViewModeChange}
        />
        {/* Applied Filters UI */}
        {(selectedCategory !== "All" ||
          priceRange[0] !== MIN_PRICE ||
          priceRange[1] !== MAX_PRICE ||
          selectedRating !== null ||
          debouncedSearchTerm ||
          selectedPlatforms.length > 0 ||
          releaseDateRange[0] ||
          releaseDateRange[1]) && (
          <Space style={{ marginBottom: 16 }}>
            {selectedCategory !== "All" && (
              <Tag closable onClose={() => handleClearCategory()} color="blue">
                Category: {selectedCategory}
              </Tag>
            )}
            {(priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE) && (
              <Tag closable onClose={() => handleClearPrice()} color="volcano">
                Price: ${priceRange[0]} - ${priceRange[1]}
              </Tag>
            )}
            {selectedRating !== null && (
              <Tag closable onClose={() => handleClearRating()} color="gold">
                Rating: {selectedRating}★ & up
              </Tag>
            )}
            {debouncedSearchTerm && (
              <Tag closable onClose={() => handleClearSearch()} color="purple">
                Search: {debouncedSearchTerm}
              </Tag>
            )}
            {selectedPlatforms.length > 0 && (
              <Tag
                closable
                onClose={() => handleClearPlatforms()}
                color="success"
              >
                Platforms: {selectedPlatforms.join(", ")}
              </Tag>
            )}
            {releaseDateRange[0] && releaseDateRange[1] && (
              <Tag
                closable
                onClose={() => handleClearReleaseDate()}
                color="geekblue"
              >
                Release Date: {releaseDateRange[0].format("MMM D, YYYY")} -{" "}
                {releaseDateRange[1].format("MMM D, YYYY")}
              </Tag>
            )}
          </Space>
        )}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert
            message="Error loading games"
            description={error}
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
              totalResults={processedGames.length}
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
      </Content>
    </Layout>
  );
};

export default GamesPage;
