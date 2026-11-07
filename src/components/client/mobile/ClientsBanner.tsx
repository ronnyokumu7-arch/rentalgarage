// src/components/clients/mobile/ClientsBanner.tsx
"use client";

import { ShieldWarning as ShieldAlert, ArrowRight } from "@phosphor-icons/react/ssr";

interface ClientsBannerProps {
  loading: boolean;
  pendingClients: number;
  filteredCount: number;
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  hidden: boolean;
}

export default function ClientsBanner({
  loading,
  pendingClients,
  filteredCount,
  statusFilter,
  setStatusFilter,
  hidden,
}: ClientsBannerProps) {
  return (
    <div className={`px-3 ${hidden ? "hidden" : ""}`}>
      {!loading && pendingClients > 0 && statusFilter !== "pending" && (
        <button
          type="button"
          onClick={() => setStatusFilter("pending")}
          className="w-full flex items-center justify-start gap-2 py-3 px-1 text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity text-xs font-semibold"
        >
          <ShieldAlert size={14} aria-hidden="true" />
          {pendingClients} {pendingClients === 1 ? "client" : "clients"} awaiting your review
          <ArrowRight size={12} className="opacity-70" aria-hidden="true" />
        </button>
      )}

      {!loading && statusFilter === "pending" && (
        <div className="w-full flex items-center justify-between py-3 px-1 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <span className="flex items-center gap-2">
            <ShieldAlert size={14} aria-hidden="true" />
            Viewing {filteredCount} pending {filteredCount === 1 ? "client" : "clients"}
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter(null)}
            className="text-[11px] font-bold px-2 py-1 rounded-md bg-blue-500/15 hover:bg-blue-500/25 transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
}
