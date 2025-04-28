"use client";

import React, { useMemo, ReactNode, useCallback } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import useSWR from "swr";
import { produce } from "immer";
// import type { AxiosError } from "axios"; // Commented out to test parsing error

// --- Correct Client Imports (Cleaned) ---
import {
  blogControllerReadBlogPosts,
  blogControllerReadBlogPost,
} from "@/gen/client";
import type { BlogResponse } from "@/gen/types";

// Placeholder types if client is not ready:
// type BlogPublic = {
//   id: string; // Assuming UUID is string
//   title: string;
//   author: string;
//   date?: string; // Assuming ISO string date
//   excerpt?: string;
//   content: string;
// };

// Placeholder API functions - replace with actual Kubb client calls
// const placeholderFetchPosts = async (url: string): Promise<BlogPublic[]> => {
//   console.warn("Using placeholder fetchPosts");
//   // Replace with actual API call, e.g., blogControllerReadBlogPosts()
//   // Fake data for now:
//   return [
//     { id: '1', title: 'Placeholder Post 1', author: 'Admin', content: 'Content 1' },
//     { id: '2', title: 'Placeholder Post 2', author: 'Admin', content: 'Content 2' },
//   ];
// };
// const placeholderFetchPost = async (
//   url: string,
//   id: string
// ): Promise<BlogPublic> => {
//   console.warn("Using placeholder fetchPost");
//   // Replace with actual API call, e.g., blogControllerReadBlogPost({ params: { postId: id } })
//   // Fake data for now:
//   return {
//     id: id,
//     title: `Placeholder Post ${id}`,
//     author: 'Admin',
//     content: `Content ${id}`,
//   };
// };

// --- Context Definition ---

/**
 * @interface BlogState
 * @description Represents the state for blog post data fetching.
 * @property {BlogPublic[] | undefined} posts - The list of blog posts, or undefined if loading or error.
 * @property {Error | undefined} error - Any error that occurred during fetching.
 * @property {boolean} isLoading - Whether the blog posts are currently being loaded.
 * @property {(id: string) => { data: BlogPublic | undefined; error: Error | undefined; isLoading: boolean }} useBlogPost - Hook to fetch a single blog post by ID.
 * @property {() => void} revalidatePosts - Function to manually trigger revalidation of the posts list.
 */
interface BlogState {
  posts: BlogResponse[] | undefined;
  // error: Error | AxiosError | undefined; // Temporarily use Error
  error: Error | undefined;
  isLoading: boolean;
  // Function to get SWR hook for a single post
  useBlogPost: (id: string | null) => {
    post: BlogResponse | undefined;
    // error: Error | AxiosError | undefined; // Temporarily use Error
    error: Error | undefined;
    isLoading: boolean;
    revalidatePost: () => void;
  };
  revalidatePosts: () => void; // Function to revalidate the list
}

/**
 * @context BlogContext
 * @description Context for managing blog data and actions.
 */
// Provide a default state that matches BlogState but with initial/empty values
const defaultBlogState: BlogState = {
  posts: undefined,
  error: undefined,
  isLoading: true, // Start in loading state
  useBlogPost: () => ({
    // Provide a default no-op function
    post: undefined,
    error: undefined,
    isLoading: false,
    revalidatePost: () => {},
  }),
  revalidatePosts: () => {},
};
const BlogContext = createContext<BlogState>(defaultBlogState);

// --- Provider Component ---

/**
 * @interface BlogProviderProps
 * @description Props for the BlogProvider component.
 * @property {ReactNode} children - The child components to be wrapped by the provider.
 */
interface BlogProviderProps {
  children: ReactNode;
}

// Use a stable key for SWR fetching the list
const BLOG_POSTS_SWR_KEY = "/api/blogs";

// Fetcher function using the generated client for the list
const fetchPosts = async (_key: string): Promise<BlogResponse[]> => {
  // Call the CORRECT imported function
  const response = await blogControllerReadBlogPosts();
  return response.data; // Assuming response has .data
};

// Fetcher function using the generated client for a single post
const fetchPost = async (
  _key: string,
  postId: string
): Promise<BlogResponse> => {
  // Call the CORRECT imported function, assuming it takes postId directly
  const response = await blogControllerReadBlogPost(postId);
  return response.data; // Assuming response has .data
};

/**
 * @provider BlogProvider
 * @description Provides blog state and actions to its children.
 * Fetches blog posts using SWR.
 */
export const BlogProvider: React.FC<BlogProviderProps> = ({ children }) => {
  // Temporarily use Error instead of AxiosError
  const {
    data: posts,
    error,
    isLoading,
    mutate: revalidatePosts,
  } = useSWR<BlogResponse[], Error>(
    BLOG_POSTS_SWR_KEY,
    fetchPosts, // Use the actual fetcher
    {
      revalidateOnFocus: false, // Optional: adjust SWR config as needed
      // Add error handling, retries etc. if desired
    }
  );

  /**
   * @function useBlogPost
   * @description SWR hook factory for fetching a single blog post.
   * @param {string | null} id - The UUID of the blog post to fetch, or null/undefined to skip fetching.
   * @returns SWR hook result for the single post.
   */
  const useBlogPost = useCallback((id: string | null) => {
    const SWR_KEY = id ? [`/api/blogs/${id}`, id] : null; // Use array key for arguments
    // Temporarily use Error instead of AxiosError
    const {
      data: post,
      error: postError,
      isLoading: postIsLoading,
      mutate: revalidatePost,
    } = useSWR<BlogResponse | undefined, Error>(
      SWR_KEY,
      // Fetcher only runs if key is not null
      // SWR passes the key array as arguments to the fetcher
      ([_keyPath, postId]) => fetchPost(_keyPath, postId),
      {
        revalidateOnFocus: false,
        // Add error handling, etc.
      }
    );
    return { post, error: postError, isLoading: postIsLoading, revalidatePost };
  }, []);

  /**
   * @description Memoized context value.
   */
  const value = useMemo<BlogState>(
    () => ({
      posts,
      error,
      isLoading,
      useBlogPost,
      revalidatePosts,
    }),
    [posts, error, isLoading, useBlogPost, revalidatePosts]
  );

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

// --- Custom Hook ---

/**
 * @hook useBlog
 * @description Hook to access the BlogContext.
 * Provides specific parts of the context using useContextSelector.
 * @param {function} selector - A function to select specific state from the context.
 * @returns The selected state.
 * @throws Error if used outside of BlogProvider.
 */
export const useBlog = <Selected,>(
  selector: (state: BlogState) => Selected
): Selected => {
  // Use useContextSelector directly, the check for undefined is no longer needed
  // as the context now always provides a BlogState
  const context = useContextSelector(BlogContext, selector);
  // if (context === undefined) { // Removed check
  //   throw new Error("useBlog must be used within a BlogProvider");
  // }
  return context;
};

/**
 * @hook useBlogState
 * @description Convenience hook to get the entire blog state. Prefer specific selectors with useBlog.
 * @returns The entire BlogState object.
 * @throws Error if used outside of BlogProvider.
 */
export const useBlogState = (): BlogState => {
  // Use useContextSelector instead of React.useContext to fix type mismatch
  const context = useContextSelector(BlogContext, (state) => state);
  // if (context === undefined) { // Removed check
  //   throw new Error("useBlogState must be used within a BlogProvider");
  // }
  return context;
};
