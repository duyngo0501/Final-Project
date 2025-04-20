import { BlogPost } from "@/types/blog";

// Placeholder data for blog posts
export const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Welcome to the GameStore Blog!",
    author: "Admin",
    date: "2024-07-28",
    excerpt:
      "Learn more about our mission, upcoming features, and how to get the most out of GameStore.",
    content:
      "<h1>Welcome!</h1><p>This is the full content for the first blog post. We are excited to share news and updates with you here.</p>", // Example HTML content
  },
  {
    id: "2",
    title: "Top 10 Indie Games You Might Have Missed",
    author: "Jane Doe",
    date: "2024-07-25",
    excerpt:
      "Discover hidden gems from talented independent developers that deserve your attention.",
    content:
      "<h2>Indie Gems</h2><p>Here is a list of great indie games...</p><ul><li>Game 1</li><li>Game 2</li></ul>",
  },
  {
    id: "3",
    title: "Mastering Competitive Gaming: Tips from the Pros",
    author: "John Smith",
    date: "2024-07-22",
    excerpt:
      "Improve your skills and climb the ranks with advice from professional esports players.",
    content: "<h2>Pro Tips</h2><p>Practice, practice, practice...</p>",
  },
  {
    id: "4",
    title: "The Evolution of Console Gaming Hardware",
    author: "Tech Guru",
    date: "2024-07-19",
    excerpt:
      "A look back at the history of gaming consoles and what the future might hold.",
    content: "<h2>History of Consoles</h2><p>From Atari to PS5...</p>",
  },
];
