// src/hooks/dashboard/features/useActivityTab.ts
"use client";

import { useRecentActivity } from "@/hooks/dashboard/useRecentActivity";

export function useActivityTab() {
  const { activities, loading } = useRecentActivity();
  return { activities, loading };
}
