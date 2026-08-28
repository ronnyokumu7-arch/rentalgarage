// src/hooks/dashboard/features/useTasksTab.ts
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useActionCenterTasks } from "@/hooks/dashboard/useActionCenterTasks";

export function useTasksTab() {
  const { tasks, loading, handleClaim, handleComplete } = useActionCenterTasks();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleClaimTask = async (rawId: any) => {
    const taskId = Number(rawId);
    if (!taskId || isNaN(taskId)) { toast.error("Invalid task ID"); return; }
    setUpdatingId(taskId);
    await handleClaim(taskId);
    setUpdatingId(null);
  };

  const handleCompleteTask = async (rawId: any) => {
    const taskId = Number(rawId);
    if (!taskId || isNaN(taskId)) { toast.error("Invalid task ID"); return; }
    setUpdatingId(taskId);
    await handleComplete(taskId);
    setUpdatingId(null);
  };

  const closeMenu = () => setOpenMenuId(null);

  return {
    tasks,
    loading,
    updatingId,
    openMenuId,
    setOpenMenuId,
    handleClaimTask,
    handleCompleteTask,
    closeMenu,
  };
}
