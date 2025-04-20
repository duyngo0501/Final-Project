import { useState, useEffect } from "react";
import { Game } from "@/types/game";
import useSWR from "swr";
import { dummyGames } from "@/mocks/games"; // Import centralized mock data

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

  // Use imported dummyGames array
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

/**
 * Simulates fetching a single game by ID (mocked, no API call).
 * @param {number} id - The ID of the game to fetch.
 * @returns {Promise<Game | null>} The mock game data or null if not found.
 */
const mockFetchGameById = async (id: number): Promise<Game | null> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const mockGame: Game = {
    id: id,
    title: `Awesome Game ${id}`,
    thumbnail: `https://cataas.com/cat/says/mock-detail-${id}?width=600&height=400`,
    price: Math.floor(Math.random() * 50) + 10,
    discountedPrice:
      id % 3 === 0 ? Math.floor(Math.random() * 10) + 5 : undefined,
    category: ["Action", "Adventure", "RPG", "Strategy", "Simulation"][id % 5],
    description: `This is the detailed description for Awesome Game ${id}. It features engaging gameplay, stunning visuals...`,
  };
  if (id > 50) return null;
  return mockGame;
};

/**
 * React hook to fetch game details by ID (mocked).
 * @param {number | undefined} id - The ID of the game to fetch.
 * @returns {{ game: Game | null, loading: boolean, error: string | null }}
 */
export function useGameDetailsMock(id: number | undefined) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === undefined) {
      setError("Game ID is missing.");
      setLoading(false);
      setGame(null);
      return;
    }
    setLoading(true);
    setError(null);
    setGame(null);
    mockFetchGameById(id)
      .then((data) => {
        if (data) {
          setGame(data);
        } else {
          setError("Game not found.");
        }
      })
      .catch((err) => {
        setError(err?.message || "Failed to load game details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return { game, loading, error };
}
