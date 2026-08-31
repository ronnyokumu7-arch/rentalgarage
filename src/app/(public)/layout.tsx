// src/app/(public)/layout.tsx
import { ReactNode } from 'react';
import "@/app/public.css";

export default function PublicDocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-root min-h-screen bg-white text-black">
      {children}
    </div>
  );
}
