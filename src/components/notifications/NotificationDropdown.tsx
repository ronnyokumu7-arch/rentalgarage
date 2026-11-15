"use client";

import { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell } from "@phosphor-icons/react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { confirmAction } from "@/lib/utils/confirmAction"; // ✅ SAFETY IMPORT
import {
  useNotifications,
  useNotificationCounts,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useClearReadNotifications,
  useBulkMarkAsRead,
  useBulkDelete,
} from "@/hooks/notifications";
import { useNotificationSelection } from "@/hooks/notifications/useNotificationSelection";
import NotificationList from "./NotificationList";
import NotificationFocusView from "./NotificationFocusView";
import type { Notification } from "@/lib/types";

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => [containerRef, sheetRef], []);

  const { data: countsData } = useNotificationCounts();
  const unreadCount = countsData?.unread_count ?? 0;
  const globalTotalCount = countsData?.total_count ?? 0;
  const readCount = globalTotalCount - unreadCount;

  const { data: listData, isLoading } = useNotifications({ filter, page: 1, per_page: 50 });
  const notifications = listData?.items ?? [];

  const selection = useNotificationSelection();

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const clearReadMutation = useClearReadNotifications();
  const bulkMarkAsReadMutation = useBulkMarkAsRead();
  const bulkDeleteMutation = useBulkDelete();

  const close = () => {
    setIsOpen(false);
    setSelectedNotification(null);
    selection.clearAll();
    setFilter("all");
  };

  useClickOutside(close, refs);

  // ✅ SINGLE ITEM: Tap opens detail view AND marks as read.
  const handleItemTap = (n: Notification) => {
    setSelectedNotification(n);
    if (!n.is_read) {
      markAsReadMutation.mutate(n.id);
    }
  };

  // ✅ SINGLE ITEM: Long press enters selection mode.
  const handleItemLongPress = (id: number) => {
    if (!selection.isSelected(id)) {
      selection.toggle(id);
    }
  };

  const handleSelectAll = () => {
    selection.selectAll(notifications.map((n) => n.id));
  };

  // ✅ MULTIPLE ITEMS: Strictly marks as read. NO deletion.
  const handleMarkSelectedRead = () => {
    const ids = Array.from(selection.selectedIds);
    if (ids.length > 0) {
      bulkMarkAsReadMutation.mutate(ids, {
        onSuccess: () => selection.clearAll(),
      });
    }
  };

  // ✅ MULTIPLE ITEMS: Strictly deletes, but ONLY after explicit confirmation.
  const handleArchiveSelected = () => {
    const ids = Array.from(selection.selectedIds);
    if (ids.length === 0) return;
    
    // ✅ SAFETY NET: Prevents accidental permanent deletion
    const confirmed = confirmAction(
      `Are you sure you want to permanently delete ${ids.length} notification(s)? This cannot be undone.`
    );
    
    if (confirmed) {
      bulkDeleteMutation.mutate(ids, {
        onSuccess: () => selection.clearAll(),
      });
    }
  };

  const handleClearRead = () => {
    // ✅ SAFETY NET: Prevents accidental mass wipe
    const confirmed = confirmAction(
      "Are you sure you want to permanently delete all read notifications? This cannot be undone."
    );
    
    if (confirmed) {
      clearReadMutation.mutate();
    }
  };

  const handleActionClick = () => {
    const url = selectedNotification?.action_url;
    if (url && typeof url === "string" && url.startsWith("/")) {
      close();
      router.push(url);
    } else {
      close();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex w-9 h-9 rounded-xl items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink-primary)] transition-all duration-200 active:scale-95"
        aria-label="Notifications"
      >
        <Bell size={20} weight={unreadCount > 0 ? "fill" : "regular"} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[var(--status-cancelled)]" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--status-cancelled)]" />
          </span>
        )}
      </button>

      {/* Desktop Popover */}
      {isOpen && (
        <div className="hidden md:block absolute right-0 mt-2 w-96 rounded-xl shadow-2xl border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 bg-[var(--color-surface)] border-[var(--color-surface-border)]">
          {selectedNotification ? (
            <NotificationFocusView
              notification={selectedNotification}
              onBack={() => setSelectedNotification(null)}
              onAction={handleActionClick}
            />
          ) : (
            <NotificationList
              notifications={notifications}
              totalCount={globalTotalCount}
              unreadCount={unreadCount}
              readCount={readCount}
              isLoading={isLoading}
              filter={filter}
              setFilter={setFilter}
              selectedIds={selection.selectedIds}
              isSelectionMode={selection.isSelectionMode}
              onMarkAllRead={() => markAllAsReadMutation.mutate()}
              onClearRead={handleClearRead}
              onArchiveSelected={handleArchiveSelected}
              onMarkSelectedRead={handleMarkSelectedRead}
              onItemTap={handleItemTap}
              onItemLongPress={handleItemLongPress}
              onToggleSelect={selection.toggle}
              onSelectAll={handleSelectAll}
              onCancelSelection={selection.clearAll}
            />
          )}
        </div>
      )}

      {/* Mobile Bottom Sheet */}
      {isOpen &&
        createPortal(
          <div
            ref={sheetRef}
            className="md:hidden fixed inset-0 z-[9999] flex flex-col bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div className="absolute inset-0" onClick={close} />
            <div className="relative mt-auto w-full max-h-[90dvh] rounded-t-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 bg-[var(--color-surface)] pb-24">
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-[var(--color-ink-subtle)] opacity-40" />
              </div>

              {selectedNotification ? (
                <NotificationFocusView
                  notification={selectedNotification}
                  onBack={() => setSelectedNotification(null)}
                  onAction={handleActionClick}
                  isMobile
                />
              ) : (
                <NotificationList
                  notifications={notifications}
                  totalCount={globalTotalCount}
                  unreadCount={unreadCount}
                  readCount={readCount}
                  isLoading={isLoading}
                  filter={filter}
                  setFilter={setFilter}
                  selectedIds={selection.selectedIds}
                  isSelectionMode={selection.isSelectionMode}
                  onMarkAllRead={() => markAllAsReadMutation.mutate()}
                  onClearRead={handleClearRead}
                  onArchiveSelected={handleArchiveSelected}
                  onMarkSelectedRead={handleMarkSelectedRead}
                  onItemTap={handleItemTap}
                  onItemLongPress={handleItemLongPress}
              onToggleSelect={selection.toggle}
                  onSelectAll={handleSelectAll}
                  onCancelSelection={selection.clearAll}
                  isMobile
                  onClose={close}
                />
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
