import React from "react";
import useSWR from "swr";
// Import the correct generated types
import { Product, ProductListingResponse } from "@/gen/types";
// Keep local Game type for mapping
import { Game } from "@/types/game";
// Import the actual client function
import { productControllerListProducts } from "@/gen/client";

// No need for ApiGamesResponse interface, we use ProductListingResponse directly

// Real fetcher function using the Kubb client
const realFetcher = async (url: string): Promise<ProductListingResponse> => {
  console.log(`Real fetching: ${url}`);
  const params = new URLSearchParams(url.split("?")[1]);
  const category = params.get("category") || undefined;
  const search = params.get("searchTerm") || undefined;
  const sortBy = params.get("sortBy") || undefined;
  const page = parseInt(params.get("currentPage") || "1", 10);
  const limit = parseInt(params.get("pageSize") || "12", 10);

  const apiParams = {
    category,
    search,
    sort: sortBy,
    page,
    limit,
  };

  try {
    // Assuming productControllerListProducts returns the structure ProductListingResponse
    // or an object containing it (e.g., response.data)
    // We need to know the exact return type of productControllerListProducts
    // For now, let's assume it returns ProductListingResponse directly
    // If it returns { data: ProductListingResponse }, adjust accordingly.
    const response = await productControllerListProducts(apiParams);
    // The linter error suggested it returns ResponseConfig<ProductListingResponse>,
    // let's assume the actual data is in response.data
    // If response.data IS the ProductListingResponse:
    if (response && response.data) {
      return response.data as ProductListingResponse;
    }
    // Handle case where structure is different or response is empty
    console.warn("Unexpected API response structure:", response);
    // Return an empty-like structure to avoid breaking SWR
    return { count: 0, results: [] };
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
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
 * @description Custom SWR hook to fetch games with filtering, sorting, and pagination using the real API.
 * Maps the fetched Product data to the local Game type.
 * @param {UseGamesParams} params Parameters for fetching games.
 * @returns An object containing mapped games data, total game count, error state, and loading state.
 */
export const useGames = (params: UseGamesParams = {}) => {
  const {
    category = undefined,
    searchTerm = "",
    sortBy = "name_asc", // Default sort might be by name now
    currentPage = 1,
    pageSize = 12,
  } = params;

  const key = `/api/products?${category ? `category=${category}&` : ""}searchTerm=${encodeURIComponent(
    searchTerm
  )}&sortBy=${sortBy}&currentPage=${currentPage}&pageSize=${pageSize}`;

  // Use the real fetcher, expecting ProductListingResponse
  const {
    data: apiResponse,
    error,
    isLoading,
    mutate,
  } = useSWR<ProductListingResponse>(key, realFetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  // Map Product[] from API response to Game[] used by UI
  const mappedGames = React.useMemo(() => {
    return (
      apiResponse?.results?.map(
        (product: Product): Game => ({
          id: String(product.id), // Ensure ID is string
          title: product.name,
          thumbnail: product.background_image ?? "/placeholder-image.jpg", // Use background_image
          price: -1, // Assign placeholder price since it's missing
          discountedPrice: undefined,
          category: product.genres?.[0]?.name ?? "Unknown", // Use first genre name as category
          description: undefined, // Missing from Product type
          // Map other fields if needed and available
        })
      ) ?? []
    );
  }, [apiResponse]);

  return {
    games: mappedGames, // Return the mapped games array
    totalGames: apiResponse?.count ?? 0, // Return total count from API response
    isLoading,
    isError: error,
    mutate, // Return the mutate function
  };
};
