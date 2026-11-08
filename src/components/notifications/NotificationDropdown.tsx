"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  Clock,
  Warning, // Replaced AlertCircle
  Users,
  Car,
  Gear, // Replaced Settings
  CreditCard,
  Calendar,
  X,
} from "@phosphor-icons/react";
import {
  useNotificationCounts,
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useClearReadNotifications,
  notificationKeys,
} from "@/hooks/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/lib/api/notifications";

// ============================================================================
// TYPE HELPERS
// ============================================================================

const notificationIcons: Record<string, React.ElementType> = {
  booking: Calendar,
  payment: CreditCard,
  client: Users,
  vehicle: Car,
  system: Gear,
  alert: Warning,
};

const notificationColors: Record<string, string> = {
  booking: "bg-blue-500/10 text-blue-500",
  payment: "bg-emerald-500/10 text-emerald-500",
  client: "bg-purple-500/10 text-purple-500",
  vehicle: "bg-orange-500/10 text-orange-500",
  system: "bg-gray-500/10 text-gray-500",
  alert: "bg-rose-500/10 text-rose-500",
};

const priorityColors: Record<string, string> = {
  low: "border-l-gray-400",
  normal: "border-l-blue-500",
  high: "border-l-rose-500",
};

// ============================================================================
// COMPONENT
// ============================================================================

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);

  // ✅ FIXED: Removed unused isLoadingCounts
  const { data: counts } = useNotificationCounts();
  const { data: notificationsData, isLoading: isLoadingList } = useNotifications({
    page,
    per_page: 20,
    unread_only: activeTab === "unread",
  });

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const clearReadMutation = useClearReadNotifications();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ✅ FIXED: Explicitly typed to avoid 'possibly undefined' error
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }

    if (notification.action_url) {
      router.push(notification.action_url);
      onClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
    queryClient.setQueryData(notificationKeys.counts(), {
      unread_count: 0,
      total_count: counts?.total_count || 0,
    });
  };

  const handleClearRead = async () => {
    await clearReadMutation.mutateAsync();
    queryClient.setQueryData(notificationKeys.counts(), {
      unread_count: 0,
      total_count: 0,
    });
  };

  const unreadCount = counts?.unread_count || 0;
  const totalCount = counts?.total_count || 0;
  const notifications = notificationsData?.items || [];
  const hasMore = notificationsData?.has_more || false;

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-[calc(100%+8px)] w-[380px] max-w-[calc(100vw-2rem)] bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-dropdown)] z-[9999] overflow-hidden animate-in slide-up fade-in duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-surface-border)]">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[var(--color-ink)]" weight="regular" />
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-rose-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        {unreadCount > 0 ? (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors disabled:opacity-50"
          >
            <CheckCircle size={12} weight="regular" />
            Mark all read
          </button>
        ) : totalCount > 0 ? (
          <button
            onClick={handleClearRead}
            disabled={clearReadMutation.isPending}
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-danger)] transition-colors disabled:opacity-50"
          >
            <X size={12} weight="regular" />
            Clear read
          </button>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-surface-border)]">
        <button
          onClick={() => {
            setActiveTab("all");
            setPage(1);
          }}
          className={`flex-1 px-4 py-2.5 text-[11px] font-semibold transition-colors ${
            activeTab === "all"
              ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          All ({totalCount})
        </button>
        <button
          onClick={() => {
            setActiveTab("unread");
            setPage(1);
          }}
          className={`flex-1 px-4 py-2.5 text-[11px] font-semibold transition-colors ${
            activeTab === "unread"
              ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
        {isLoadingList ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock size={24} className="text-[var(--color-ink-muted)] animate-spin" weight="regular" />
            <p className="mt-2 text-xs text-[var(--color-ink-muted)]">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell size={32} className="text-[var(--color-ink-subtle)] mb-2" weight="regular" />
            <p className="text-xs font-medium text-[var(--color-ink)]">No notifications</p>
            <p className="mt-1 text-[10px] text-[var(--color-ink-muted)]">
              {activeTab === "unread"
                ? "You're all caught up!"
                : "When you get notifications, they'll appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[var(--color-surface-border)]">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell;
                const colorClass = notificationColors[notification.type];
                const borderClass = priorityColors[notification.priority];

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 hover:bg-[var(--color-surface-hover)] transition-colors border-l-2 ${borderClass} ${
                      !notification.is_read ? "bg-[var(--color-primary)]/[0.02]" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon size={14} weight="regular" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-[11px] font-semibold text-[var(--color-ink)] truncate ${!notification.is_read ? "font-bold" : ""}`}>
                            {notification.title}
                          </h4>
                          <span className="flex-shrink-0 text-[10px] text-[var(--color-ink-subtle)]">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-[var(--color-ink-muted)] line-clamp-2">
                          {notification.message}
                        </p>
                        {!notification.is_read && (
                          <span className="inline-block mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {hasMore && (
              <div className="p-3 border-t border-[var(--color-surface-border)]">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="w-full py-2 text-[11px] font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-lg transition-colors"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
