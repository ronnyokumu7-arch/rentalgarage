// src/components/ui/DataTable.tsx
"use client";

import { Fragment, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox, MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";
import Pagination from "./Pagination";

export interface RowAction<T> {
  label: string;
  icon?: React.ElementType;
  onClick: (item: T) => void;
  separator?: boolean;
  disabled?: boolean;
  variant?: "default" | "danger" | "primary";
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  enableSorting?: boolean;
  rowActions?: ((item: T) => RowAction<T>[]) | RowAction<T>[];
  getRowId?: (item: T) => string | number;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  viewMode?: "desktop" | "mobile";
}

export default function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data found",
  onRowClick,
  enableSorting = true,
  rowActions,
  getRowId = (item: any) => item.id,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  viewMode = "desktop",
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [openActionId, setOpenActionId] = useState<string | number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!openActionId) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isInsideTrigger = target.closest(`[data-row-actions="${openActionId}"]`);
      const isInsideMenu = target.closest(`[data-dropdown-menu="${openActionId}"]`);
      
      if (!isInsideTrigger && !isInsideMenu) {
        setOpenActionId(null);
        setDropdownPos(null);
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openActionId]);

  useEffect(() => {
    if (openActionId === null) return;
    const close = () => {
      setOpenActionId(null);
      setDropdownPos(null);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [openActionId]);

  const handleToggleActions = (e: React.MouseEvent, item: T) => {
    e.stopPropagation();
    e.preventDefault();
    
    const id = getRowId(item);
    
    if (openActionId === id) {
      setOpenActionId(null);
      setDropdownPos(null);
      return;
    }

    const acts = typeof rowActions === "function" ? rowActions(item) : rowActions || [];
    const separators = acts.filter((a) => a.separator).length;
    const estHeight = acts.length * 41 + separators * 9 + 8;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow < estHeight + 12
        ? Math.max(8, rect.top - estHeight - 8)
        : rect.bottom + 8;

    setOpenActionId(id);
    setDropdownPos({
      top,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  };

  const table = useReactTable({
    data,
    columns: rowActions 
      ? [
          ...columns,
          {
            id: "actions",
            header: "",
            cell: ({ row }) => {
              const item = row.original;
              const id = getRowId(item);

              return (
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <div className="relative" data-row-actions={id}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleActions(e, item)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                      title="More actions"
                      aria-label="More actions"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>
              );
            },
            enableSorting: false,
          },
        ]
      : columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting,
    manualPagination: true,
  });

  if (loading) {
    return (
      <div className="border border-[var(--color-surface-border)] rounded-xl bg-[var(--color-surface)] overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center text-[var(--color-ink-muted)]">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border border-[var(--color-surface-border)] rounded-xl bg-[var(--color-surface)] p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center mb-4">
          <Inbox size={20} className="text-[var(--color-ink-subtle)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--color-ink)] mb-1">{emptyMessage}</p>
        <p className="text-xs text-[var(--color-ink-muted)]">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <>
      {/* ✅ REMOVED rounded-xl and overflow-hidden to make top edges sharp */}
      <div className="border border-[var(--color-surface-border)] bg-[var(--color-surface)] flex flex-col shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <table className="w-full min-w-max text-sm text-left">
            <thead className="text-xs text-[var(--color-ink-muted)] uppercase bg-[var(--color-surface-hover)] sticky top-0 z-10 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className={`px-6 py-3.5 font-semibold tracking-wide whitespace-nowrap ${
                          canSort ? "cursor-pointer select-none hover:text-[var(--color-ink)] transition-colors" : ""
                        }`}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="text-[var(--color-ink-subtle)]">
                              {sorted === "asc" ? <ArrowUp size={14} /> : sorted === "desc" ? <ArrowDown size={14} /> : <ArrowUpDown size={14} />}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[var(--color-surface-border)]">
              {table.getRowModel().rows.map((row) => {
                const item = row.original;
                
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      onRowClick ? "cursor-pointer hover:bg-[var(--color-surface-hover)]" : ""
                    }`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-[var(--color-ink)] whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && onPageChange && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            viewMode={viewMode}
          />
        )}
      </div>

      {/* ✅ Portal-rendered Row Actions Dropdown */}
      {mounted && openActionId !== null && dropdownPos && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpenActionId(null)} />
          
          <div
            data-dropdown-menu={openActionId}
            className="fixed z-[9999] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{ top: dropdownPos.top, right: dropdownPos.right }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const item = data.find((d) => getRowId(d) === openActionId);
              if (!item) return null;
              
              const actions = typeof rowActions === "function" ? rowActions(item) : rowActions || [];
              
              return actions.map((action, index) => (
                <Fragment key={`${action.label}-${index}`}>
                  {action.separator && index > 0 && (
                    <div className="h-px bg-[var(--color-surface-border)] my-1" />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      
                      setOpenActionId(null);
                      setDropdownPos(null);
                      
                      if (typeof action.onClick === "function") {
                        action.onClick(item);
                      }
                    }}
                    disabled={action.disabled}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                      action.disabled
                        ? "text-[var(--color-ink-subtle)] cursor-not-allowed"
                        : action.variant === "danger"
                        ? "text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)]"
                        : action.variant === "primary"
                        ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                        : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    {action.icon && <action.icon size={14} />}
                    {action.label}
                  </button>
                </Fragment>
              ));
            })()}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
