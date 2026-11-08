import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationCounts,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearReadNotifications,
  type GetNotificationsParams,
  type NotificationCountResponse,
} from '@/lib/api/notifications';

// ============================================================================
// QUERY KEYS
// ============================================================================
export const notificationKeys = {
  all: ['notifications'] as const,
  counts: () => [...notificationKeys.all, 'counts'] as const,
  lists: () => [...notificationKeys.all, 'lists'] as const,
  list: (params: GetNotificationsParams) => [...notificationKeys.lists(), params] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

export const useNotificationCounts = () => {
  return useQuery<NotificationCountResponse>({
    queryKey: notificationKeys.counts(),
    queryFn: getNotificationCounts,
    refetchInterval: 60 * 1000, 
    staleTime: 30 * 1000,
  });
};

export const useNotifications = (params: GetNotificationsParams = {}) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotifications(params),
    staleTime: 10 * 1000,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.counts() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.counts() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};

export const useClearReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearReadNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.counts() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};
