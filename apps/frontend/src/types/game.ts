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
  // Add other relevant fields from your API response
}
