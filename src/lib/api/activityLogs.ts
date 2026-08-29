import apiClient from "@/lib/api-client";

export interface ActivityLog {
  id: number;
  tenant_id: number;
  user_id: number | null;
  action: string;
  label: string; // ✅ NEW: Human-readable title (e.g., "Payment Received")
  target_type: string | null;
  target_id: number | null;
  summary: Record<string, any> | null; // ✅ NEW: Denormalized snapshot (client, amount, etc.)
  details: Record<string, any> | null;
  priority: number; // ✅ NEW: 1=Low, 2=Normal, 3=High, 4=Critical
  created_at: string;
}

export interface PaginatedActivityLogs {
  items: ActivityLog[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ActivityLogsQueryParams {
  user_id?: number;
  action?: string;
  target_type?: string;
  start_date?: string;
  end_date?: string;
  sort_by_priority?: boolean;
  page?: number;
  page_size?: number;
}

export const activityLogsApi = {
  list: (params: ActivityLogsQueryParams = {}) => {
    const queryParams: Record<string, any> = {};
    
    // ✅ Include all new filter parameters (backward compatible)
    if (params.user_id) queryParams.user_id = params.user_id;
    if (params.action) queryParams.action = params.action;
    if (params.target_type) queryParams.target_type = params.target_type;
    if (params.start_date) queryParams.start_date = params.start_date;
    if (params.end_date) queryParams.end_date = params.end_date;
    if (params.sort_by_priority) queryParams.sort_by_priority = params.sort_by_priority;
    if (params.page) queryParams.page = params.page;
    if (params.page_size) queryParams.page_size = params.page_size;
    
    return apiClient.get<PaginatedActivityLogs>("/activity-logs/", { params: queryParams }).then((r) => r.data);
  },
};
