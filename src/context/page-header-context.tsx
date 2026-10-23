// src/context/page-header-context.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface PageHeaderState {
  title?: string;
  description?: string;
  onInfoClick?: () => void;
}

interface PageHeaderContextValue {
  header: PageHeaderState;
  setHeader: (next: PageHeaderState) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

export function PageHeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeader] = useState<PageHeaderState>({});
  return (
    <PageHeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) throw new Error("usePageHeader must be used within PageHeaderProvider");
  return ctx;
}

/** Pages call this to declare what the top bar should show on mobile. */
export function useSetPageHeader(
  title: string,
  description: string,
  onInfoClick?: () => void
) {
  const { setHeader } = usePageHeader();
  useEffect(() => {
    setHeader({ title, description, onInfoClick });
    return () => setHeader({});
  }, [title, description, onInfoClick, setHeader]);
}
