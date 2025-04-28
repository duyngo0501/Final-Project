import axios from "axios";
import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosRequestHeaders, // Import specific header type
} from "axios";
import { supabase } from "@/lib/supabaseClient"; // Import the Supabase client

/**
 * Subset of AxiosRequestConfig
 */
export type RequestConfig<TData = unknown> = {
  url?: string;
  method: "GET" | "PUT" | "PATCH" | "POST" | "DELETE";
  params?: unknown;
  data?: TData;
  responseType?:
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text"
    | "stream";
  signal?: AbortSignal;
  headers?: AxiosRequestConfig["headers"]; // Keep this general for input
};
/**
 * Subset of AxiosResponse
 */
export type ResponseConfig<TData = unknown> = {
  data: TData;
  status: number;
  statusText: string;
  headers?: AxiosResponse["headers"];
};

export type ResponseErrorConfig<TError = unknown> = {
  error: TError;
  status: number;
  statusText: string;
  headers?: AxiosResponse["headers"];
};

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL,
});

// --- Axios Request Interceptor ---
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log("Axios Interceptor: Running for URL", config.url); // Log URL

    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders; // Initialize headers if undefined
    }

    // Get the current session from Supabase
    console.log("Axios Interceptor: Getting Supabase session...");
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    console.log("Axios Interceptor: Supabase getSession result", {
      session,
      error,
    }); // Log session/error

    if (error) {
      console.error(
        "Axios Interceptor: Error getting Supabase session:",
        error
      );
      // Optionally handle error
    } else if (session?.access_token) {
      console.log("Axios Interceptor: Found access token, attaching header..."); // Log token found
      // Set the Authorization header directly on the headers object
      config.headers.Authorization = `Bearer ${session.access_token}`;
    } else {
      console.log("Axios Interceptor: No session or access token found."); // Log no token
      // Handle case where there is no session (user not logged in)
      // Optional: delete config.headers.Authorization;
    }

    console.log(
      "Axios Interceptor: Final headers before request:",
      config.headers
    ); // Log final headers
    return config;
  },
  (error) => {
    // Handle request error
    console.error("Axios request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Will be used by kubb.config.ts
export const client = async <TData, TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>
): Promise<ResponseConfig<TData>> => {
  const promise = axiosInstance
    .request<TVariables, ResponseConfig<TData>>({ ...config })
    .catch((e: AxiosError<TError>) => {
      throw e;
    });

  return promise;
};

export default client;
