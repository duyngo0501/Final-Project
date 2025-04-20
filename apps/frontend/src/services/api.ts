import axios from "axios";
import { Game } from "@/types/game";
import { User } from "@/types/user"; // Import the centralized User type

// Define placeholder types for API responses/requests if not already defined elsewhere
interface AuthResponse {
  token: string;
  user: User; // Use imported User type
}

interface Credentials {
  email: string;
  password: string;
}

interface UserData {
  username: string;
  email: string;
  password: string;
}

export interface CartItem {
  game: Game; // Use the imported Game type
  quantity: number;
}

export interface Cart {
  id: string; // Example cart ID
  items: CartItem[];
  totalPrice?: number; // Calculated backend or frontend
  userId: string;
}

// Base Axios instance (optional, configure as needed)
const apiClient = axios.create({
  baseURL: "/api", // Replace with your actual API base URL
  // headers: { 'Content-Type': 'application/json' },
});

// --- Mock Data --- (Define at module scope)
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
];

// --- Auth API --- (Placeholders based on AuthContext usage)
// Temporarily comment out named export
// export const authAPI = {
export const authAPI = {
  register: async (userData: UserData): Promise<{ data: AuthResponse }> => {
    console.log("[Mock API] Registering:", userData);
    await new Promise((res) => setTimeout(res, 500));
    // Ensure mockUser conforms to the imported User type
    const mockUser: User = { id: "user-123", ...userData, role: "user" };
    return Promise.resolve({
      data: { token: "mock-jwt-token-register", user: mockUser },
    });
    // Simulate error:
    // return Promise.reject({ response: { data: { error: 'Mock Registration Error' } } });
  },

  login: async (credentials: Credentials): Promise<{ data: AuthResponse }> => {
    console.log("[Mock API] Logging in:", credentials);
    await new Promise((res) => setTimeout(res, 500));
    if (
      credentials.email === "user@example.com" &&
      credentials.password === "password"
    ) {
      // Ensure mockUser conforms to the imported User type
      const mockUser: User = {
        id: "user-123",
        username: "MockUser",
        email: credentials.email,
        role: "user",
      };
      return Promise.resolve({
        data: { token: "mock-jwt-token-login", user: mockUser },
      });
    }
    return Promise.reject({
      response: { data: { error: "Invalid Credentials" } },
    });
  },

  getCurrentUser: async (): Promise<{ data: User | null }> => {
    console.log("[Mock API] Getting current user...");
    await new Promise((res) => setTimeout(res, 300));
    const token = localStorage.getItem("token");
    if (token && token.startsWith("mock-jwt-token")) {
      // Ensure mockUser conforms to the imported User type
      const mockUser: User = {
        id: "user-123",
        username: "MockUser",
        email: "user@example.com",
        role: "user",
      };
      return Promise.resolve({ data: mockUser });
    }
    return Promise.resolve({ data: null });
    // Simulate error:
    // return Promise.reject(new Error('Mock Get User Error'));
  },
};

// --- Games API --- (Placeholder based on HomePage usage)
interface GamesApiResponse {
  games: Game[];
  // Add pagination fields if API supports them
  totalPages?: number;
  currentPage?: number;
  totalGames?: number;
}
// Temporarily comment out named export
// export const gamesAPI = {
export const gamesAPI = {
  getAllGames: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: GamesApiResponse }> => {
    console.log(`[Mock API] Getting games - Page: ${page}, Limit: ${limit}`);
    await new Promise((res) => setTimeout(res, 600));
    // Use dummyGames defined above
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedGames = dummyGames.slice(start, end);
    return Promise.resolve({
      data: {
        games: paginatedGames,
        totalGames: dummyGames.length,
        currentPage: page,
        totalPages: Math.ceil(dummyGames.length / limit),
      },
    });
  },

  // Add getGameById if needed
  // getGameById: async (id: number): Promise<{ data: Game }> => { ... }
  getGameById: async (id: string): Promise<{ data: Game }> => {
    console.log(`[Mock API] Getting game by ID: ${id}`);
    await new Promise((res) => setTimeout(res, 300));
    // Ensure id is treated as a number for comparison if game IDs are numbers
    const gameId = parseInt(id, 10);
    const game = dummyGames.find((g) => g.id === gameId);
    if (game) {
      return Promise.resolve({ data: game });
    }
    // Simulate 404 Not Found
    return Promise.reject({
      response: { status: 404, data: { error: "Game not found" } },
    });
  },
};

// --- Cart API --- (Mocks)
let mockServerCart: Cart = { id: "cart-456", userId: "user-123", items: [] }; // In-memory mock cart

// Temporarily comment out named export
// export const cartAPI = {
export const cartAPI = {
  getCart: async (): Promise<{ data: Cart | null }> => {
    console.log("[Mock API] Getting cart...");
    await new Promise((res) => setTimeout(res, 400));
    // Only return cart if user is considered logged in (simple token check)
    if (localStorage.getItem("token")?.startsWith("mock-jwt-token")) {
      // Return a deep copy to prevent direct mutation
      return Promise.resolve({
        data: JSON.parse(JSON.stringify(mockServerCart)),
      });
    }
    return Promise.resolve({ data: null }); // No cart if not logged in
  },

  addItem: async (
    gameId: number,
    quantity: number = 1
  ): Promise<{ data: Cart }> => {
    console.log(`[Mock API] Adding item: ${gameId}, Quantity: ${quantity}`);
    await new Promise((res) => setTimeout(res, 500));
    const gameToAdd = dummyGames.find((g: Game) => g.id === gameId); // Use dummyGames from module scope
    if (!gameToAdd)
      return Promise.reject({
        response: { data: { error: "Game not found" } },
      });

    const existingItemIndex = mockServerCart.items.findIndex(
      (item) => item.game.id === gameId
    );
    if (existingItemIndex > -1) {
      mockServerCart.items[existingItemIndex].quantity += quantity;
    } else {
      mockServerCart.items.push({ game: gameToAdd, quantity });
    }
    // Recalculate total (example)
    mockServerCart.totalPrice = mockServerCart.items.reduce((sum, item) => {
      const price = item.game.discountedPrice ?? item.game.price;
      return sum + price * item.quantity;
    }, 0);
    return Promise.resolve({
      data: JSON.parse(JSON.stringify(mockServerCart)),
    });
  },

  removeItem: async (gameId: number): Promise<{ data: Cart }> => {
    console.log(`[Mock API] Removing item: ${gameId}`);
    await new Promise((res) => setTimeout(res, 500));
    const itemIndexToRemove = mockServerCart.items.findIndex(
      (item) => item.game.id === gameId
    );
    if (itemIndexToRemove > -1) {
      mockServerCart.items.splice(itemIndexToRemove, 1);
    }
    // Recalculate total
    mockServerCart.totalPrice = mockServerCart.items.reduce((sum, item) => {
      const price = item.game.discountedPrice ?? item.game.price;
      return sum + price * item.quantity;
    }, 0);
    return Promise.resolve({
      data: JSON.parse(JSON.stringify(mockServerCart)),
    });
  },

  updateItemQuantity: async (
    gameId: number,
    quantity: number
  ): Promise<{ data: Cart }> => {
    console.log(`[Mock API] Updating quantity: ${gameId} to ${quantity}`);
    await new Promise((res) => setTimeout(res, 500));
    const itemIndexToUpdate = mockServerCart.items.findIndex(
      (item) => item.game.id === gameId
    );

    if (itemIndexToUpdate > -1) {
      if (quantity > 0) {
        mockServerCart.items[itemIndexToUpdate].quantity = quantity;
      } else {
        // Remove item if quantity is 0 or less
        mockServerCart.items.splice(itemIndexToUpdate, 1);
      }
    } else if (quantity > 0) {
      // If item doesn't exist but quantity > 0, maybe add it?
      // Or throw error? Current mock adds it if game found.
      const gameToAdd = dummyGames.find((g: Game) => g.id === gameId);
      if (gameToAdd) {
        mockServerCart.items.push({ game: gameToAdd, quantity });
      } else {
        return Promise.reject({
          response: { data: { error: "Game not found for update/add" } },
        });
      }
    }
    // Recalculate total
    mockServerCart.totalPrice = mockServerCart.items.reduce((sum, item) => {
      const price = item.game.discountedPrice ?? item.game.price;
      return sum + price * item.quantity;
    }, 0);
    return Promise.resolve({
      data: JSON.parse(JSON.stringify(mockServerCart)),
    });
  },

  clearCart: async (): Promise<{ data: Cart }> => {
    console.log(`[Mock API] Clearing cart`);
    await new Promise((res) => setTimeout(res, 400));
    mockServerCart = {
      id: "cart-456",
      userId: "user-123",
      items: [],
      totalPrice: 0,
    };
    return Promise.resolve({
      data: JSON.parse(JSON.stringify(mockServerCart)),
    });
  },
};

// Export other APIs if needed for other parts of the app to function during test
// export { authAPI, gamesAPI };

// Keep this export at the end of the file
// export default {
//   authAPI,
//   gamesAPI,
//   cartAPI,
// };
