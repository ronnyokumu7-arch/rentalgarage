import api from '@/lib/api-client'; // ⚠️ Adjust this import to match your actual API client setup
import type { 
  Notification, 
  NotificationCountResponse, 
  NotificationListResponse, 
  BulkNotificationAction 
} from '@/lib/types';

// ============================================================================
// REQUEST PARAMS
// ============================================================================

export interface GetNotificationsParams {
  page?: number;
  per_page?: number;
  filter?: 'all' | 'unread' | 'read'; // ✅ UPDATED: Replaced unread_only with filter
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch unread and total notification counts (for the TopBar badge).
 */
export const getNotificationCounts = async (): Promise<NotificationCountResponse> => {
  const { data } = await api.get('/notifications/counts');
  return data;
};

/**
 * Fetch paginated notifications (for the dropdown list).
 */
export const getNotifications = async (
  params: GetNotificationsParams = {}
): Promise<NotificationListResponse> => {
  const { data } = await api.get('/notifications/', { params });
  return data;
};

/**
 * Mark a specific notification as read.
 */
export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
  const { data } = await api.patch(`/notifications/${notificationId}/read`);
  return data;
};

/**
 * Mark all unread notifications as read.
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};

/**
 * ✅ NEW: Mark multiple specific notifications as read (for multi-select UI).
 */
export const markMultipleNotificationsAsRead = async (ids: number[]): Promise<void> => {
  const payload: BulkNotificationAction = { ids };
  await api.post('/notifications/bulk-read', payload);
};

/**
 * ✅ NEW: Delete multiple specific notifications (for 'Archive' in multi-select UI).
 */
export const deleteMultipleNotifications = async (ids: number[]): Promise<void> => {
  const payload: BulkNotificationAction = { ids };
  await api.post('/notifications/bulk-delete', payload);
};

/**
 * Manually delete all read notifications for the current user.
 * Used by the "Clear read" button in the UI to keep the inbox clean.
 */
export const clearReadNotifications = async (): Promise<void> => {
  await api.post('/notifications/clear-read');
};
