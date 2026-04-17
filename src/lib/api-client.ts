import axios, { AxiosInstance, AxiosError } from "axios";
import type { ApiResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (apiClient) {
    return apiClient;
  }

  apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add token to requests
  apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Handle response errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          window.location.href = "/auth/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
}

export async function apiRequest<T>(
  method: string,
  url: string,
  data?: any,
  config?: any
): Promise<ApiResponse<T>> {
  try {
    const client = getApiClient();
    const response = await client.request<ApiResponse<T>>({
      method,
      url,
      data,
      ...config,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        success: false,
        error: error.response?.data?.error || error.message,
        message: error.response?.data?.message,
      };
    }
    throw {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

// Simple fetch wrapper that adds auth token automatically
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}
