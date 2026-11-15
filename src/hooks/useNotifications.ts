import { useState, useCallback, useEffect, useRef } from "react";
import {
  getNotifications,
  getNotificationCounts,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "@/lib/api/notifications";

const POLL_INTERVAL_MS = 60_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

  // ✅ Lightweight counts fetch — drives the BELL DOT. Safe to poll.
  const refreshCounts = useCallback(async () => {
    try {
      const counts = await getNotificationCounts();
      if (mountedRef.current) setUnreadCount(counts.unread_count ?? 0);
    } catch {
      // Silent: bell simply won't update this tick.
    }
  }, []);

  // ✅ Full list fetch — drives the DROPDOWN. Called on open.
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getNotifications({ page: 1, per_page: 20 });
      if (!mountedRef.current) return;
      setNotifications(res.items);
      setUnreadCount(res.items.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  // ✅ On mount + every 60s: keep the bell accurate WITHOUT opening the dropdown.
  useEffect(() => {
    mountedRef.current = true;
    refreshCounts();
    const id = setInterval(refreshCounts, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [refreshCounts]);

  const handleMarkAsRead = useCallback(async (id: number) => {
    // Optimistic update so the dot + list react instantly.
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    refreshCounts,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
}
