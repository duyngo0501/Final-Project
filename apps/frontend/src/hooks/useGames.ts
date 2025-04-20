import useSWR from "swr";
import { Game } from "@/types/game";

// Dummy game data (can be expanded or replaced with API call)
const dummyGames: Game[] = [
  {
    id: 101,
    title: "Cyberpunk 2077",
    thumbnail: "/images/game1.jpg",
    price: 59.99,
    category: "pc",
    discountedPrice: 29.99,
    description: "An open-world, action-adventure story set in Night City.",
  },
  {
    id: 102,
    title: "Elden Ring",
    thumbnail: "/images/game2.jpg",
    price: 69.99,
    category: "console",
    description:
      "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.",
  },
  {
    id: 103,
    title: "Stardew Valley",
    thumbnail: "/images/game3.jpg",
    price: 14.99,
    category: "pc",
    description: "You've inherited your grandfather's old farm plot...",
  },
  {
    id: 104,
    title: "Genshin Impact",
    thumbnail: "/images/game4.jpg",
    price: 0,
    category: "mobile",
    description: "Step into a vast magical world for adventure.",
  },
  {
    id: 105,
    title: "Red Dead Redemption 2",
    thumbnail: "/images/game5.jpg",
    price: 49.99,
    category: "console",
    description: "America, 1899. The end of the wild west era has begun.",
  },
  {
    id: 106,
    title: "Among Us",
    thumbnail: "/images/game6.jpg",
    price: 4.99,
    category: "mobile",
    description: "An online multiplayer game of teamwork and betrayal.",
  },
  {
    id: 107,
    title: "Doom Eternal",
    thumbnail: "/images/game7.jpg",
    price: 39.99,
    category: "pc",
    description: "Hell's armies have invaded Earth. Become the Slayer...",
  },
  {
    id: 108,
    title: "Zelda: Tears of the Kingdom",
    thumbnail: "/images/game8.jpg",
    price: 69.99,
    category: "console",
    description:
      "An epic adventure across the land and skies of Hyrule awaits.",
  },
  // Add 10 more games for better pagination/filtering demo
  {
    id: 109,
    title: "Hades",
    thumbnail: "/images/game9.jpg",
    price: 24.99,
    category: "pc",
    description:
      "Defy the god of the dead as you hack and slash out of the Underworld.",
  },
  {
    id: 110,
    title: "Hollow Knight",
    thumbnail: "/images/game10.jpg",
    price: 14.99,
    category: "console",
    description: "Explore twisting caverns, ancient cities and deadly wastes.",
  },
  {
    id: 111,
    title: "Factorio",
    thumbnail: "/images/game11.jpg",
    price: 30.0,
    category: "pc",
    description: "Build and maintain factories. Automate everything!",
  },
  {
    id: 112,
    title: "Pokemon GO",
    thumbnail: "/images/game12.jpg",
    price: 0,
    category: "mobile",
    description: "Discover Pokémon in the real world!",
  },
  {
    id: 113,
    title: "Grand Theft Auto V",
    thumbnail: "/images/game13.jpg",
    price: 29.99,
    category: "console",
    description: "Explore the stunning world of Los Santos and Blaine County.",
  },
  {
    id: 114,
    title: "Terraria",
    thumbnail: "/images/game14.jpg",
    price: 9.99,
    category: "pc",
    description:
      "Dig, fight, explore, build! The very world is at your fingertips.",
  },
  {
    id: 115,
    title: "Call of Duty: Mobile",
    thumbnail: "/images/game15.jpg",
    price: 0,
    category: "mobile",
    description:
      "Experience the iconic first-person shooter franchise on mobile.",
  },
  {
    id: 116,
    title: "The Witcher 3: Wild Hunt",
    thumbnail: "/images/game16.jpg",
    price: 39.99,
    category: "pc",
    description: "Become a professional monster slayer, Geralt of Rivia.",
  },
  {
    id: 117,
    title: "Bloodborne",
    thumbnail: "/images/game17.jpg",
    price: 19.99,
    category: "console",
    description: "Hunt your nightmares in the ancient city of Yharnam.",
  },
  {
    id: 118,
    title: "RimWorld",
    thumbnail: "https://cataas.com/cat/says/mock-game-118?width=300&height=180",
    price: 34.99,
    category: "pc",
    description: "A sci-fi colony sim driven by an intelligent AI storyteller.",
  },
];

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
