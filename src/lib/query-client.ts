import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        
        // ✅ THE FIX: Prevent retry storms on auth/config errors AND rate limits
        retry: (failureCount, error) => {
          // Never retry 401 (Unauthorized) — the axios interceptor handles refresh/logout
          if (error instanceof AxiosError && error.response?.status === 401) {
            return false;
          }
          // Never retry 403 (Forbidden) or 404 (Not Found)
          if (error instanceof AxiosError && (error.response?.status === 403 || error.response?.status === 404)) {
            return false;
          }
          // ✅ NEW: Never retry 429 (Too Many Requests) — backing off prevents cascading storms
          if (error instanceof AxiosError && error.response?.status === 429) {
            return false;
          }
          // Otherwise use default retry (3 attempts max)
          return failureCount < 3;
        },
      },
      mutations: {
        retry: (failureCount, error) => {
          // Never retry auth errors or rate limits on mutations either
          if (error instanceof AxiosError && [401, 403, 404, 429].includes(error.response?.status ?? 0)) {
            return false;
          }
          return failureCount < 3;
        },
      },
    },
  });
};

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client (prevents RSC data leaks)
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
