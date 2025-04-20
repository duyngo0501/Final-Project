/**
 * @description Represents the structure of a user object.
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin"; // Enforce specific roles
  created_at?: string | number | Date; // Optional timestamp
  // Add other user properties as needed
  // avatarUrl?: string;
  // isActive?: boolean;
}
