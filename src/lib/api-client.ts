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
 * - ✅ HARDENED: Delegates refresh to auth-context's single-flight queue.
 * - ✅ HARDENED: Retries once on network errors before logging out.
 * - ✅ HARDENED: Only logs out on definitive auth failures (401/403 from refresh).
 * - Logs network timeouts and 5xx server errors for easier debugging.
 */

// ─── REFRESH HANDLER REGISTRY ───────────────────────────────────────────────
// Auth-context registers its refresh queue here on mount. The interceptor
// calls this instead of managing its own queue — single source of truth.
type RefreshHandler = () => Promise<string | null>;
let refreshHandler: RefreshHandler | null = null;

export function registerRefreshHandler(handler: RefreshHandler) {
  refreshHandler = handler;
}

// ─── COOKIE HELPERS ──────────────────────────────────────────────────────────
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name: string, value: string, minutes: number = 15) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + minutes * 60000).toUTCString();
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
 * ✅ HARDENED: Uses auth-context's single-flight refresh queue.
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

      originalRequest._retry = true;

      // ✅ HARDENED: Use auth-context's single-flight queue
      if (!refreshHandler) {
        console.error("[API Client] No refresh handler registered. Logging out.");
        clearCookie("rm_token");
        localStorage.removeItem("rm_token");
        localStorage.removeItem("rm_refresh_token");
        setTimeout(() => {
          window.location.href = "/login?reason=session_expired";
        }, 100);
        return Promise.reject(error);
      }

      try {
        console.warn("[API Client] 401 Unauthorized: Delegating to auth-context refresh queue...");

        // ✅ Call auth-context's refresh queue (single-flight, retry-once built-in)
        const newToken = await refreshHandler();

        if (!newToken) {
          // Refresh definitively failed (401/403 from backend) — logout
          console.error("[API Client] Token refresh failed. Logging out.");
          clearCookie("rm_token");
          localStorage.removeItem("rm_token");
          localStorage.removeItem("rm_refresh_token");
          setTimeout(() => {
            window.location.href = "/login?reason=session_expired";
          }, 100);
          return Promise.reject(error);
        }

        console.log("[API Client] Token refreshed successfully. Retrying original request.");

        // Retry the original failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("[API Client] Token refresh threw error:", refreshError);
        clearCookie("rm_token");
        localStorage.removeItem("rm_token");
        localStorage.removeItem("rm_refresh_token");
        setTimeout(() => {
          window.location.href = "/login?reason=session_expired";
        }, 100);
        return Promise.reject(refreshError);
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
