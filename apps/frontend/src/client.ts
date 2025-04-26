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
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders; // Initialize headers if undefined
    }

    // Get the current session from Supabase
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting Supabase session in interceptor:", error);
      // Optionally handle error
    } else if (session?.access_token) {
      // Set the Authorization header directly on the headers object
      config.headers.Authorization = `Bearer ${session.access_token}`;
    } else {
      // Handle case where there is no session (user not logged in)
      // Optional: delete config.headers.Authorization;
    }

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
