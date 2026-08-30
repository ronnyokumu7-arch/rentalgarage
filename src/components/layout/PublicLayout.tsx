// src/components/layouts/PublicLayout.tsx

import { ReactNode } from 'react';

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
