/**
 * @description Represents the structure of a game object used throughout the application.
 */
export interface Game {
  id: number;
  title: string;
  thumbnail: string; // URL to the game's thumbnail image
  price: number; // Original price
  discountedPrice?: number; // Optional discounted price
  category: string; // e.g., 'pc', 'console', 'mobile'
  description?: string; // Optional short description
  platform?: string | string[]; // Platform(s) the game is available on
  releaseDate?: string; // Release date in ISO string format (e.g., "YYYY-MM-DDTHH:mm:ssZ")
  rating?: number; // Optional game rating
  stock?: number; // Optional: Number of items in stock
  // Add other relevant fields from your API response
}
