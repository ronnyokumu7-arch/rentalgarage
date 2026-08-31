// src/components/layouts/PublicLayout.tsx

import { ReactNode } from 'react';
import "@/app/public-docs.css"; // ✅ CRITICAL: Import the public styles!

interface PublicLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function PublicLayout({ children, className = '' }: PublicLayoutProps) {
  return (
    <div className={`public-root ${className}`}>
      {children}
    </div>
  );
}
