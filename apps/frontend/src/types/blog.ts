/**
 * @description Represents the structure of a blog post object.
 */
export interface BlogPost {
  id: string; // Use string if IDs might not be purely numeric
  title: string;
  author: string;
  date: string; // Keep as string (ISO format or simple YYYY-MM-DD)
  excerpt: string;
  content: string; // Full content of the blog post
  // Optional fields you might add later:
  // slug?: string;
  // tags?: string[];
  // imageUrl?: string;
}
