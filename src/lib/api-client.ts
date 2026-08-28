// src/lib/api-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";

/**
 * @module apiClient
 * @description
 * Centralized Axios instance for communicating with the FastAPI backend.
 * 
 * Key Features:
 * - Uses Zod-validated environment variables for the base URL.
 * - Sends HttpOnly refresh cookies automatically via `withCredentials: true`.
 * - Attaches short-lived access tokens from cookies to outgoing requests.
 * - ✅ NEW: Automatically refreshes expired tokens before logging out.
 * - Logs network timeouts and 5xx server errors for easier debugging.
 */

/**
 * ✅ CRITICAL: Concurrency Guard
 * When a token expires, multiple React Query hooks might fail with a 401 simultaneously.
 * Without this flag, the app would attempt to refresh multiple times concurrently.
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── COOKIE HELPERS ──────────────────────────────────────────────────────────
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; secure; samesite=lax`;
};

const clearCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Initialize Axios instance with strict typing and validated env vars
const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // ✅ CRITICAL: Ensures HttpOnly refresh cookies are sent to backend
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
/**
 * Attaches the short-lived JWT access token to outgoing requests.
 * The refresh token is sent automatically by the browser via HttpOnly cookie.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = getCookie("rm_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
/**
 * Handles global API errors, automatic token refresh, and session expiration.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";

    // 1. Handle 401 Unauthorized (Try to refresh before logging out)
    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !pathname.includes("/login") &&
      !pathname.includes("/forgot-password") &&
      !pathname.includes("/reset-password") &&
      !originalRequest._retry // ✅ Prevent infinite refresh loops
    ) {
      // Don't retry refresh or login endpoints
      if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/login")) {
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.warn("[API Client] 401 Unauthorized: Attempting token refresh...");

        // Call refresh endpoint (refresh token is sent via HttpOnly cookie)
        const response = await axios.post(
          `${env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { access_token } = response.data;

        // Save new access token to cookie
        setCookie("rm_token", access_token, 1); // 1 day (access token itself expires in 15min via JWT)

        console.log("[API Client] Token refreshed successfully. Retrying original request.");

        // Process queued requests
        processQueue(null, access_token);

        // Retry the original failed request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("[API Client] Token refresh failed. Logging out.");

        // Refresh failed - log user out
        processQueue(refreshError as AxiosError, null);

        clearCookie("rm_token");
        localStorage.removeItem("rm_token");
        localStorage.removeItem("rm_refresh_token");

        setTimeout(() => {
          window.location.href = "/login?reason=session_expired";
        }, 100);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Handle Network Timeouts
    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      console.error("[API Client] Request timed out. The server took too long to respond.");
    }

    // 3. Handle 5xx Server Errors
    if (status && status >= 500) {
      console.error(`[API Client] Server Error (${status}):`, error.response?.data);
    }

    // Always reject the promise so TanStack Query or local catch blocks can handle the UI error state
    return Promise.reject(error);
  }
);

export default apiClient;
