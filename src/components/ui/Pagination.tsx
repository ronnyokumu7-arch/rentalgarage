// src/components/ui/Pagination.tsx
"use client";

import { CaretLeft as ChevronLeft, CaretRight as ChevronRight } from "@phosphor-icons/react/ssr";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  viewMode?: "desktop" | "mobile"; // ✅ NEW: Controls layout hints
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  viewMode = "desktop", // ✅ Default to desktop
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  // Responsive hints for UX clarity
  const pageSizeHint = viewMode === "desktop" 
    ? "7-10 items/page" 
    : "2-3 cards/page";

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${
      viewMode === "mobile" 
        ? "p-4" 
        : "p-4 border-t border-[var(--color-surface-border)]"
    }`}>
      {/* Info text with responsive hint */}
      <p className="text-xs text-[var(--color-ink-muted)] text-center sm:text-left">
        Showing <span className="font-medium text-[var(--color-ink)]">{startItem}</span> to{" "}
        <span className="font-medium text-[var(--color-ink)]">{endItem}</span> of{" "}
        <span className="font-medium text-[var(--color-ink)]">{totalItems}</span> results
        <span className="hidden sm:inline ml-2 text-[10px] opacity-70">
          ({pageSizeHint})
        </span>
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
        >
          <ChevronLeft size={14} aria-hidden="true" />
        </button>

        {getPageNumbers().map((page, i) => {
          if (page === "...") {
            return (
              <span key={i} className="px-2 text-[var(--color-ink-subtle)] text-xs">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = currentPage === pageNum;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
        >
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
