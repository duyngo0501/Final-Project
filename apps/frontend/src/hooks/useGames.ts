import useSWR from "swr";
import { Game } from "@/types/game";
import { dummyGames } from "@/mocks/games"; // Import centralized mock data

// Define the structure of the response from the mock fetcher
interface MockFetcherResponse {
  paginatedGames: Game[];
  totalGames: number;
}

// Mock fetcher function - now handles filtering, sorting, and pagination
const mockFetcher = async (url: string): Promise<MockFetcherResponse> => {
  console.log(`Mock fetching: ${url}`);
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

  const params = new URLSearchParams(url.split("?")[1]);
  const category = params.get("category") || "all";
  const searchTerm = params.get("searchTerm")?.toLowerCase() || "";
  const sortBy = params.get("sortBy") || "title_asc";
  const currentPage = parseInt(params.get("currentPage") || "1", 10);
  const pageSize = parseInt(params.get("pageSize") || "12", 10);

  // 1. Filter by category
  let filteredGames =
    category === "all"
      ? dummyGames
      : dummyGames.filter((game) => game.category === category);

  // 2. Filter by search term (case-insensitive title match)
  if (searchTerm) {
    filteredGames = filteredGames.filter((game) =>
      game.title.toLowerCase().includes(searchTerm)
    );
  }

  // Calculate total games *after* filtering
  const totalGames = filteredGames.length;

  // 3. Sort
  filteredGames.sort((a, b) => {
    switch (sortBy) {
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "title_desc":
        return b.title.localeCompare(a.title);
      case "price_asc":
        // Handle potential discounts later if needed, sorting by base price for now
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // 4. Paginate
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedGames = filteredGames.slice(startIndex, startIndex + pageSize);

  return { paginatedGames, totalGames };
};

// Define a type for the hook's input parameters
interface UseGamesParams {
  category?: string;
  searchTerm?: string;
  sortBy?: string;
  currentPage?: number;
  pageSize?: number;
}

/**
 * @description Custom SWR hook to fetch games with filtering, sorting, and pagination.
 * Uses a mock fetcher for demonstration.
 * @param {UseGamesParams} params Parameters for fetching games.
 * @returns An object containing paginated games data, total game count, error state, and loading state.
 */
export const useGames = (params: UseGamesParams = {}) => {
  const {
    category = "all",
    searchTerm = "",
    sortBy = "title_asc",
    currentPage = 1,
    pageSize = 12,
  } = params;

  // Construct a unique key for SWR based on all parameters
  const key = `/api/games?category=${category}&searchTerm=${encodeURIComponent(
    searchTerm
  )}&sortBy=${sortBy}&currentPage=${currentPage}&pageSize=${pageSize}`;

  // Destructure mutate from useSWR result
  const { data, error, isLoading, mutate } = useSWR<MockFetcherResponse>(
    key,
    mockFetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true, // Keep previous data visible while loading new page/filters
    }
  );

  return {
    games: data?.paginatedGames, // Return the paginated games
    totalGames: data?.totalGames, // Return the total count for pagination
    isLoading,
    isError: error,
    mutate, // Return the mutate function
  };
};
