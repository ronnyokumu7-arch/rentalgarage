import api from '@/lib/api-client'; // ⚠️ Adjust this import to match your actual API client setup (e.g., axios instance)

// ============================================================================
// TYPES (Matching Backend Pydantic Schemas)
// ============================================================================

export type NotificationType = 'booking' | 'payment' | 'client' | 'vehicle' | 'system' | 'alert';
export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  payload?: Record<string, any>; // ✅ FIXED: Renamed from 'metadata'
  action_url?: string;
  is_read: boolean;
  created_at: string; // ISO date string
  updated_at?: string;
}

export interface NotificationCountResponse {
  unread_count: number;
  total_count: number;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface GetNotificationsParams {
  page?: number;
  per_page?: number;
  unread_only?: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch unread and total notification counts (for the TopBar badge).
 */
export const getNotificationCounts = async (): Promise<NotificationCountResponse> => {
  const { data } = await api.get('/api/v1/notifications/counts');
  return data;
};

/**
 * Fetch paginated notifications (for the dropdown list).
 */
export const getNotifications = async (
  params: GetNotificationsParams = {}
): Promise<NotificationListResponse> => {
  const { data } = await api.get('/api/v1/notifications/', { params });
  return data;
};

/**
 * Mark a specific notification as read.
 */
export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
  const { data } = await api.patch(`/api/v1/notifications/${notificationId}/read`);
  return data;
};

/**
 * Mark all unread notifications as read.
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch('/api/v1/notifications/read-all');
};

/**
 * Manually delete all read notifications for the current user.
 * Used by the "Clear read" button in the UI to keep the inbox clean.
 */
export const clearReadNotifications = async (): Promise<void> => {
  await api.post('/api/v1/notifications/clear-read');
};
