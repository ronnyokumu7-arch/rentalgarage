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
 * - Intercepts 401 Unauthorized responses to safely handle session expiration.
 * - Logs network timeouts and 5xx server errors for easier debugging.
 */

/**
 * ✅ CRITICAL: Concurrency Guard
 * When a token expires, multiple React Query hooks might fail with a 401 simultaneously.
 * Without this flag, the app would attempt to redirect multiple times concurrently,
 * leading to state corruption, race conditions, and a jarring user experience.
 */
let isHandling401 = false;

// ─── COOKIE HELPERS ──────────────────────────────────────────────────────────
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
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
 * Handles global API errors, session expiration, and network issues.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";

    // 1. Handle 401 Unauthorized (Session Expired / Invalid Token)
    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !pathname.includes("/login") &&
      !pathname.includes("/forgot-password") &&
      !pathname.includes("/reset-password") &&
      !isHandling401 // ✅ Prevents concurrent 401s from triggering multiple redirects
    ) {
      isHandling401 = true; // Lock the redirect
      
      console.warn("[API Client] 401 Unauthorized: Session expired. Clearing credentials.");
      
      // Clear access token cookie
      document.cookie = "rm_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Clean up any legacy localStorage tokens just in case
      localStorage.removeItem("rm_token");
      localStorage.removeItem("rm_refresh_token");
      
      // Yield to the main thread before hard reload
      setTimeout(() => {
        window.location.href = "/login?reason=session_expired";
      }, 100);
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
