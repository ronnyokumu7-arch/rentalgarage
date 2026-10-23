// src/components/layout/topbar/TopBarBrand.tsx
"use client";

import Link from "next/link";

export default function TopBarBrand() {
  return (
    <Link href="/dashboard" className="flex flex-col justify-center flex-shrink-0 min-w-0">
      <span className="text-sm font-medium text-ink tracking-tight leading-tight">
        Rental
        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)]">
          Garage
        </span>
      </span>
      <span className="text-[10px] text-ink-muted leading-tight mt-0.5 truncate">
        Manage your rental business
      </span>
    </Link>
  );
}
