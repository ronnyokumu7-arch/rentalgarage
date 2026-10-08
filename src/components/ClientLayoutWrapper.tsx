// src/components/ClientLayoutWrapper.tsx
"use client";

import { ReactNode } from "react";
import Providers from "./Providers";
import { AuthProvider } from "@/context/auth-context";

/**
 * @component ClientLayoutWrapper
 * @description 
 * Consolidates all Client-side providers into a single boundary.
 * This prevents the "Unsupported Server Component type: Module" error 
 * during Next.js 14 static generation by creating one clear Server/Client split.
 * 
 * ✅ Toasts are provided by the root <Toaster /> in src/app/layout.tsx —
 *    do NOT mount another Toaster here (that would double-render every toast).
 */
export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Providers>
  );
}
