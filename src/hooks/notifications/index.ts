import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationCounts,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearReadNotifications,
  markMultipleNotificationsAsRead,
  deleteMultipleNotifications,
  type GetNotificationsParams,
} from '@/lib/api/notifications';

// ✅ FIXED: Import types from the single source of truth
import type {
  Notification,
  NotificationCountResponse,
  NotificationListResponse,
} from '@/lib/types';

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
// QUERIES
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

// ============================================================================
// MUTATIONS
// ============================================================================

// ✅ UPDATED: Added optimistic updates for instant UI feedback (live bell & dot removal)
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) => markNotificationAsRead(notificationId),
    
    // 1. Optimistically update UI before the server responds
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });
      await queryClient.cancelQueries({ queryKey: notificationKeys.counts() });

      const previousCounts = queryClient.getQueryData<NotificationCountResponse>(notificationKeys.counts());

      // Mark as read in the list instantly
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: notificationKeys.lists() },
        (old) =>
          old
            ? {
                ...old,
                items: old.items.map((n) =>
                  n.id === notificationId ? { ...n, is_read: true } : n
                ),
              }
            : old
      );

      // Drop the bell count instantly
      if (previousCounts && previousCounts.unread_count > 0) {
        queryClient.setQueryData(notificationKeys.counts(), {
          ...previousCounts,
          unread_count: previousCounts.unread_count - 1,
        });
      }

      return { previousCounts };
    },

    // 2. Rollback if the server request fails
    // ✅ FIXED: Prefixed unused 'err' and 'notificationId' with '_' to satisfy TS
    onError: (_err, _notificationId, context) => {
      if (context?.previousCounts) {
        queryClient.setQueryData(notificationKeys.counts(), context.previousCounts);
      }
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },

    // 3. Always sync with the server after to ensure absolute truth
    onSettled: () => {
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

// ✅ NEW: Bulk mark-as-read (multi-select "Mark as read")
export const useBulkMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => markMultipleNotificationsAsRead(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });
      const idSet = new Set(ids);
      
      // ✅ FIXED: Explicitly typed 'old' and 'n' parameters
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: notificationKeys.lists() },
        (old: NotificationListResponse | undefined) =>
          old
            ? { ...old, items: old.items.map((n: Notification) => (idSet.has(n.id) ? { ...n, is_read: true } : n)) }
            : old,
      );
      return { ids };
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.counts() });
    },
  });
};

// ✅ NEW: Bulk delete / archive (multi-select "Archive")
export const useBulkDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => deleteMultipleNotifications(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });
      const idSet = new Set(ids);
      
      // ✅ FIXED: Explicitly typed 'old' and 'n' parameters
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: notificationKeys.lists() },
        (old: NotificationListResponse | undefined) => 
          (old ? { ...old, items: old.items.filter((n: Notification) => !idSet.has(n.id)) } : old),
      );
      return { ids };
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.counts() });
    },
  });
};
