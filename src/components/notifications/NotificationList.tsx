"use client";

import { Checks, Trash, Archive, X, Bell } from "@phosphor-icons/react";
import NotificationRow from "./NotificationRow";
import type { Notification } from "@/lib/types"; // ✅ FIX: single source of truth

export type FilterType = "all" | "unread" | "read";

interface NotificationListProps {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
  readCount: number;
  isLoading: boolean;
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  selectedIds: Set<number>; // ✅ FIX: number, not string
  isSelectionMode: boolean;
  onMarkAllRead: () => void;
  onClearRead: () => void;
  onArchiveSelected: () => void;
  onMarkSelectedRead: () => void;
  onItemTap: (n: Notification) => void;
  onItemLongPress: (id: number) => void; // ✅ FIX: number, not string
  onToggleSelect: (id: number) => void;  // ✅ FIX: number, not string
  onSelectAll: () => void;
  onCancelSelection: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function NotificationList({
  notifications,
  totalCount,
  unreadCount,
  readCount,
  isLoading,
  filter,
  setFilter,
  selectedIds,
  isSelectionMode,
  onMarkAllRead,
  onClearRead,
  onArchiveSelected,
  onMarkSelectedRead,
  onItemTap,
  onItemLongPress,
  onToggleSelect,
  onSelectAll,
  onCancelSelection,
  isMobile = false,
  onClose,
}: NotificationListProps) {
  const hasReadNotifications = readCount > 0;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3 border-b border-[var(--color-surface-border)]">
        <h3 className="font-bold text-base text-[var(--color-ink-primary)]">
          {isSelectionMode ? `${selectedIds.size} selected` : "Notifications"}
        </h3>
        <button
          onClick={isSelectionMode ? onCancelSelection : onClose}
          className="p-1 rounded-md text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
          aria-label={isSelectionMode ? "Cancel selection" : "Close"}
        >
          <X size={20} weight={isSelectionMode ? "bold" : "regular"} />
        </button>
      </div>

      {/* Toolbar */}
      {isSelectionMode ? (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-primary)] bg-[var(--color-primary-muted)]">
          <button
            onClick={onSelectAll}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
          >
            Select All
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkSelectedRead}
              className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 hover:bg-white/90 text-[var(--color-primary)] transition-colors"
            >
              <Checks size={14} weight="bold" />
              Mark as read
            </button>
            <button
              onClick={onArchiveSelected}
              className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 hover:bg-white/90 text-[var(--color-ink-muted)] hover:text-[var(--color-ink-primary)] transition-colors"
            >
              <Archive size={14} weight="bold" />
              Archive
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-3">
            {(["all", "unread", "read"] as FilterType[]).map((f) => {
              const count = f === "all" ? totalCount : f === "unread" ? unreadCount : readCount;
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative text-xs font-semibold pb-2 capitalize transition-colors ${
                    isActive
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-primary)]"
                  }`}
                >
                  {f} {count > 0 && <span className="opacity-60">({count})</span>}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[10px] font-semibold flex items-center gap-1 px-2 py-1 rounded text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition-colors"
                title="Mark all as read"
              >
                <Checks size={12} weight="bold" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            {hasReadNotifications && (
              <button
                onClick={onClearRead}
                className="text-[10px] font-semibold flex items-center gap-1 px-2 py-1 rounded text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink-primary)] transition-colors"
                title="Clear read notifications"
              >
                <Trash size={12} weight="bold" />
                <span className="hidden sm:inline">Clear read</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="overflow-y-auto max-h-[60vh] md:max-h-[500px]">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-[var(--color-ink-muted)]">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            {filter === "unread" ? (
              <>
                <Checks size={40} className="mx-auto mb-3 opacity-30 text-[var(--color-primary)]" />
                <p className="text-sm font-semibold text-[var(--color-ink-primary)]">
                  You're all caught up!
                </p>
                <p className="text-xs mt-1 text-[var(--color-ink-muted)]">
                  New notifications will show up here.
                </p>
              </>
            ) : filter === "read" ? (
              <>
                <Archive size={40} className="mx-auto mb-3 opacity-30 text-[var(--color-ink-muted)]" />
                <p className="text-sm font-semibold text-[var(--color-ink-primary)]">
                  No read notifications.
                </p>
                <p className="text-xs mt-1 text-[var(--color-ink-muted)]">
                  Read items will appear here.
                </p>
              </>
            ) : (
              <>
                <Bell size={40} className="mx-auto mb-3 opacity-30 text-[var(--color-ink-muted)]" />
                <p className="text-sm font-semibold text-[var(--color-ink-primary)]">
                  No notifications yet.
                </p>
                <p className="text-xs mt-1 text-[var(--color-ink-muted)]">
                  We'll notify you when something happens.
                </p>
              </>
            )}
          </div>
        ) : (
          <ul>
            {notifications.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                isSelected={selectedIds.has(n.id)}
                isSelectionMode={isSelectionMode}
                onTap={() => onItemTap(n)}
                onLongPress={() => onItemLongPress(n.id)}
                onToggleSelect={() => onToggleSelect(n.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Mobile Hint */}
      {isMobile && !isSelectionMode && notifications.length > 0 && (
        <p className="text-center text-[10px] text-[var(--color-ink-subtle)] py-2 border-t border-[var(--color-surface-border)]">
          Hold a notification to select
        </p>
      )}
    </>
  );
}
