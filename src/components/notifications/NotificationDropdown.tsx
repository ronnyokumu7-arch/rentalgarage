"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Checks, FileText, CreditCard, User, Car, Warning,
  X, ArrowLeft, ArrowRight,
} from "@phosphor-icons/react";
import { brand } from "@/lib/brand";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/lib/api/notifications";

// --- Helpers ---
const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

const getIcon = (type: string) => {
  switch (type) {
    case "payment": return <CreditCard size={20} weight="fill" />;
    case "booking": return <FileText size={20} weight="fill" />;
    case "client": return <User size={20} weight="fill" />;
    case "vehicle": return <Car size={20} weight="fill" />;
    case "alert": return <Warning size={20} weight="fill" />;
    default: return <Bell size={20} weight="fill" />;
  }
};

const getActionLabel = (url?: string) => {
  if (!url) return "View Details";
  if (url.includes("booking")) return "View Booking";
  if (url.includes("invoice")) return "View Invoice";
  if (url.includes("client")) return "View Client";
  if (url.includes("vehicle")) return "View Vehicle";
  return "View Details";
};

// ✅ Theme-independent brand fill: purple bg + white content is legible in BOTH light & dark.
const brandFill = { backgroundColor: brand.colors.primary, color: "#ffffff" } as const;

// --- Main Component ---
export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const {
    notifications, unreadCount, isLoading,
    fetchNotifications, handleMarkAsRead, handleMarkAllAsRead,
  } = useNotifications();

  const containerRef = useClickOutside(() => {
    setIsOpen(false);
    setSelectedNotification(null);
  });

  useEffect(() => {
    if (isOpen && !selectedNotification) {
      fetchNotifications();
    }
  }, [isOpen, selectedNotification, fetchNotifications]);

  const handleNotificationTap = async (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }
  };

  const handleActionClick = () => {
    if (selectedNotification?.action_url) {
      setIsOpen(false);
      setSelectedNotification(null);
      router.push(selectedNotification.action_url);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* ✅ TRIGGER: plain bell when 0 unread, pinging red dot when >0 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex w-9 h-9 rounded-xl items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink transition-all duration-200 active:scale-95"
        aria-label="Notifications"
      >
        <Bell size={20} weight={unreadCount > 0 ? "fill" : "regular"} />

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: brand.colors.danger.main || "#f43f5e" }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: brand.colors.danger.main || "#f43f5e" }}
            />
          </span>
        )}
      </button>

      {/* ✅ DESKTOP POPOVER */}
      {isOpen && (
        <div className="hidden md:block absolute right-0 mt-2 w-96 rounded-xl shadow-2xl border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 bg-surface border-surface-border">
          {selectedNotification ? (
            <FocusModeView
              notification={selectedNotification}
              onBack={() => setSelectedNotification(null)}
              onAction={handleActionClick}
            />
          ) : (
            <ListView
              notifications={notifications}
              unreadCount={unreadCount}
              isLoading={isLoading}
              onMarkAllRead={handleMarkAllAsRead}
              onItemTap={handleNotificationTap}
            />
          )}
        </div>
      )}

      {/* ✅ MOBILE BOTTOM SHEET */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative mt-auto w-full max-h-[90vh] rounded-t-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 bg-surface">
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-ink-subtle/30" />
            </div>

            {selectedNotification ? (
              <FocusModeView
                notification={selectedNotification}
                onBack={() => setSelectedNotification(null)}
                onAction={handleActionClick}
                isMobile
              />
            ) : (
              <ListView
                notifications={notifications}
                unreadCount={unreadCount}
                isLoading={isLoading}
                onMarkAllRead={handleMarkAllAsRead}
                onItemTap={handleNotificationTap}
                isMobile
                onClose={() => setIsOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- List View ---
function ListView({ notifications, unreadCount, isLoading, onMarkAllRead, onItemTap, isMobile = false, onClose }: any) {
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-surface-border">
        <h3 className="font-bold text-base text-ink">
          Notifications {unreadCount > 0 && <span className="text-xs font-normal text-ink-muted">({unreadCount} new)</span>}
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-md text-primary hover:bg-surface-hover transition-colors"
            >
              <Checks size={14} weight="bold" /> Mark all read
            </button>
          )}
          {isMobile && (
            <button onClick={onClose} className="p-1 rounded-md text-ink-muted hover:bg-surface-hover transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[60vh] md:max-h-[500px]">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-muted">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={40} className="mx-auto mb-3 opacity-30 text-ink-muted" />
            <p className="text-sm font-semibold text-ink">All caught up!</p>
            <p className="text-xs mt-1 text-ink-muted">No new notifications.</p>
          </div>
        ) : (
          <ul>
            {notifications.map((n: Notification) => (
              <li key={n.id} className="border-b border-surface-border last:border-0">
                <button
                  onClick={() => onItemTap(n)}
                  className="w-full text-left p-4 flex gap-3 transition-colors hover:bg-surface-hover"
                  style={!n.is_read ? { borderLeft: `3px solid ${brand.colors.primary}` } : undefined}
                >
                  {/* ✅ Icon circle: brand fill when unread (visible in BOTH themes) */}
                  <div
                    className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      n.is_read ? "bg-surface-hover text-ink-muted" : ""
                    }`}
                    style={!n.is_read ? brandFill : undefined}
                  >
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold truncate text-ink">{n.title}</p>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: brand.colors.primary }} />
                      )}
                    </div>
                    <p className="text-xs mt-1 line-clamp-2 text-ink-muted">{n.message}</p>
                    <p className="text-[10px] mt-2 font-medium uppercase tracking-wide text-ink-subtle">
                      {getTimeAgo(n.created_at)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

// --- Focus Mode ---
function FocusModeView({ notification, onBack, onAction, isMobile = false }: { notification: Notification; onBack: () => void; onAction: () => void; isMobile?: boolean }) {
  return (
    <div className="flex flex-col h-full" style={{ minHeight: isMobile ? "60vh" : "400px" }}>
      <div className="flex items-center gap-3 p-4 border-b border-surface-border">
        <button onClick={onBack} className="p-1 rounded-md hover:bg-surface-hover transition-colors text-ink-muted">
          <ArrowLeft size={20} weight="bold" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{notification.type}</p>
          <p className="text-xs text-ink-subtle">{getTimeAgo(notification.created_at)}</p>
        </div>
        {!notification.is_read && (
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.colors.primary }} />
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-surface-hover text-primary">
            {getIcon(notification.type)}
          </div>
          <h2 className="text-xl font-bold leading-tight text-ink">{notification.title}</h2>
        </div>

        <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">{notification.message}</p>

        {notification.payload && Object.keys(notification.payload).length > 0 && (
          <div className="mt-6 p-4 rounded-lg border border-surface-border bg-surface-hover">
            <p className="font-bold mb-2 uppercase tracking-wide text-ink-subtle text-xs">Details</p>
            {Object.entries(notification.payload).map(([key, value]) => (
              <div key={key} className="flex justify-between py-1.5 border-b border-surface-border last:border-0">
                <span className="capitalize text-xs text-ink-muted">{key.replace(/_/g, " ")}:</span>
                <span className="text-xs font-semibold text-ink">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {notification.action_url && (
        <div className="p-4 border-t border-surface-border">
          {/* ✅ CTA: brand fill + white text = visible in BOTH themes */}
          <button
            onClick={onAction}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:opacity-90 active:scale-[0.98]"
            style={brandFill}
          >
            {getActionLabel(notification.action_url)} <ArrowRight size={16} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}
