// src/components/Providers.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary"; // ✅ Import from dedicated file
import { getQueryClient } from "@/lib/query-client"; // ✅ Retry-guarded QueryClient

/**
 * @component Providers
 * @description 
 * Wraps the app in React Query and the Error Boundary.
 * 
 * ✅ BUILD FIX: The ErrorBoundary (Class Component) has been extracted 
 * into its own file to prevent the Next.js 14.2.x "Unsupported Server 
 * Component type: Module" serialization crash during static generation.
 *
 * ✅ RETRY-STORM FIX: QueryClient now comes from getQueryClient() —
 * 401/403/404 are NEVER retried (the axios interceptor owns auth recovery);
 * all other failures retry up to 3× with default backoff.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  // Initialize QueryClient once per user session (browser singleton)
  const [queryClient] = useState(() => getQueryClient());

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
