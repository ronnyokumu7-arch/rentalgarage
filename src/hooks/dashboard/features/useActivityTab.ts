// src/hooks/dashboard/features/useActivityTab.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { activityLogsApi } from "@/lib/api/activityLogs";
import { useActivityMapper } from "@/hooks/useActivityMapper";
import type { ActivityData } from "@/components/dashboard/UnifiedActivityCard";

type TimeFilter = "today" | "week" | "month";

// ✅ Helper to calculate date ranges for Today / Week / Month
const getDateRange = (filter: TimeFilter): { start_date: string; end_date: string } => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  
  end.setHours(23, 59, 59, 999);

  if (filter === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (filter === "week") {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
  } else if (filter === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }

  return {
    start_date: start.toISOString(),
    end_date: end.toISOString(),
  };
};

export function useActivityTab(initialFilter: TimeFilter = "week") {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(initialFilter);

  // ✅ Use a ref to keep the mapper stable (prevents infinite loop)
  const mapperRef = useRef(useActivityMapper());

  const fetchActivities = useCallback(async (filter: TimeFilter) => {
    setLoading(true);
    try {
      const { start_date, end_date } = getDateRange(filter);
      
      const response = await activityLogsApi.list({
        start_date,
        end_date,
        sort_by_priority: true,
        page: 1,
        page_size: 50,
      });
      
      // ✅ MAP the raw ActivityLog objects to ActivityData
      const mappedActivities = (response.items || []).map((activity: any) => 
        mapperRef.current.mapActivity(activity)
      );
      
      setActivities(mappedActivities);
    } catch (e) {
      console.error("Failed to fetch activity logs:", e);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Empty dependency array = only runs once

  useEffect(() => {
    fetchActivities(timeFilter);
  }, [timeFilter, fetchActivities]);

  const refetch = useCallback(() => {
    fetchActivities(timeFilter);
  }, [fetchActivities, timeFilter]);

  return {
    activities,
    loading,
    timeFilter,
    setTimeFilter,
    refetch,
  };
}
