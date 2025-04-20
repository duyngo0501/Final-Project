import useSWR from "swr";
import { Game } from "@/types/game";

// TODO: Consider centralizing or fetching this dummy data if used in multiple places
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
    thumbnail: "/images/game18.jpg",
    price: 34.99,
    category: "pc",
    description: "A sci-fi colony sim driven by an intelligent AI storyteller.",
  },
];

/**
 * @description Mock fetcher function to find a single game by ID.
 * Simulates an API call.
 * @param {string} url - The URL containing the game ID (e.g., /api/games/101).
 * @returns {Promise<Game | null>} A promise that resolves to the game or null if not found.
 */
const mockGameFetcher = async (url: string): Promise<Game | null> => {
  console.log(`Mock fetching game details: ${url}`);
  const idPart = url.split("/").pop();
  const id = idPart ? parseInt(idPart, 10) : undefined;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (id === undefined || isNaN(id)) {
    // Handle invalid ID case if needed, maybe throw error or return null
    console.error("Invalid game ID requested");
    return null; // Or throw new Error('Invalid ID');
  }

  const foundGame = dummyGames.find((game) => game.id === id);

  return foundGame || null; // Return the found game or null if not found
};

/**
 * @description Custom SWR hook to fetch details for a single game by its ID.
 * Uses a mock fetcher for demonstration.
 * @param {number | undefined} gameId - The ID of the game to fetch.
 * @returns An object containing the game data, loading state, error state, and not found state.
 */
export const useGameDetails = (gameId: number | undefined) => {
  // Construct the SWR key. Only fetch if gameId is valid.
  const key = gameId !== undefined ? `/api/games/${gameId}` : null;

  const { data, error, isLoading } = useSWR<Game | null>(
    key, // SWR won't fetch if key is null
    mockGameFetcher,
    {
      revalidateOnFocus: false,
      // You might want different caching behavior for single items
      // keepPreviousData: false, // Might not be needed here
    }
  );

  // Determine if the game was not found specifically
  const isNotFound = !isLoading && !error && key !== null && data === null;

  return {
    game: data, // This will be the Game object or null
    isLoading,
    isError: error,
    isNotFound, // Explicitly indicate if fetch completed but found nothing
  };
};
