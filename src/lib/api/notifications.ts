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
  // ✅ FIX: Removed /api/v1 to prevent duplicated baseURL paths (e.g., /api/v1/api/v1/...)
  const { data } = await api.get('/notifications/counts');
  return data;
};

/**
 * Fetch paginated notifications (for the dropdown list).
 */
export const getNotifications = async (
  params: GetNotificationsParams = {}
): Promise<NotificationListResponse> => {
  // ✅ FIX: Removed /api/v1 to prevent duplicated baseURL paths
  const { data } = await api.get('/notifications/', { params });
  return data;
};

/**
 * Mark a specific notification as read.
 */
export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
  // ✅ FIX: Removed /api/v1 to prevent duplicated baseURL paths
  const { data } = await api.patch(`/notifications/${notificationId}/read`);
  return data;
};

/**
 * Mark all unread notifications as read.
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  // ✅ FIX: Removed /api/v1 to prevent duplicated baseURL paths
  await api.patch('/notifications/read-all');
};

/**
 * Manually delete all read notifications for the current user.
 * Used by the "Clear read" button in the UI to keep the inbox clean.
 */
export const clearReadNotifications = async (): Promise<void> => {
  // ✅ FIX: Removed /api/v1 to prevent duplicated baseURL paths
  await api.post('/notifications/clear-read');
};
