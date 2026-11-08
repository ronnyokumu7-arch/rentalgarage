"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  Clock,
  Warning,
  Users,
  Car,
  Gear,
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

// ⚠️ IMPORTANT: Update this import path to match where your Modal component actually lives!
import Modal from "@/components/ui/Modal"; 

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

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);

  const { data: counts } = useNotificationCounts();
  const { data: notificationsData, isLoading: isLoadingList } = useNotifications({
    page,
    per_page: 20,
    unread_only: activeTab === "unread",
  });

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const clearReadMutation = useClearReadNotifications();

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

  // ============================================================================
  // MODAL FOOTER (Action Buttons)
  // ============================================================================
  const footerActions = (
    <div className="w-full flex justify-end">
      {unreadCount > 0 ? (
        <button
          onClick={handleMarkAllAsRead}
          disabled={markAllAsReadMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-xl hover:bg-[var(--color-primary)]/20 transition-colors disabled:opacity-50"
        >
          <CheckCircle size={16} weight="regular" />
          Mark all as read
        </button>
      ) : totalCount > 0 ? (
        <button
          onClick={handleClearRead}
          disabled={clearReadMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] rounded-xl hover:bg-[var(--color-surface-hover)]/80 transition-colors disabled:opacity-50"
        >
          <X size={16} weight="regular" />
          Clear read notifications
        </button>
      ) : null}
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Notifications"
      subtitle={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
      presentation="responsive" // ✅ Bottom sheet on mobile, centered modal on desktop
      size="md"
      showCloseButton={true}
      footer={footerActions}
    >
      {/* Tabs */}
      <div className="flex border-b border-[var(--color-surface-border)] mb-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <button
          onClick={() => {
            setActiveTab("all");
            setPage(1);
          }}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "all"
              ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          All ({totalCount})
        </button>
        <button
          onClick={() => {
            setActiveTab("unread");
            setPage(1);
          }}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "unread"
              ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Content */}
      {isLoadingList ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Clock size={32} className="text-[var(--color-ink-muted)] animate-spin" weight="regular" />
          <p className="mt-3 text-sm text-[var(--color-ink-muted)]">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Bell size={48} className="text-[var(--color-ink-subtle)] mb-3" weight="regular" />
          <p className="text-sm font-medium text-[var(--color-ink)]">No notifications</p>
          <p className="mt-1 text-xs text-[var(--color-ink-muted)] text-center">
            {activeTab === "unread"
              ? "You're all caught up!"
              : "When you get notifications, they'll appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || Bell;
            const colorClass = notificationColors[notification.type];
            const borderClass = priorityColors[notification.priority];

            return (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left p-3 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors border-l-4 ${borderClass} ${
                  !notification.is_read ? "bg-[var(--color-primary)]/[0.02]" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon size={18} weight="regular" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-semibold text-[var(--color-ink)] truncate ${!notification.is_read ? "font-bold" : ""}`}>
                        {notification.title}
                      </h4>
                      <span className="flex-shrink-0 text-xs text-[var(--color-ink-subtle)] whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-ink-muted)] line-clamp-2">
                      {notification.message}
                    </p>
                    {!notification.is_read && (
                      <span className="inline-block mt-2 w-2 h-2 rounded-full bg-rose-500" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {hasMore && (
            <div className="pt-2">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="w-full py-3 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-xl hover:bg-[var(--color-primary)]/20 transition-colors"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
