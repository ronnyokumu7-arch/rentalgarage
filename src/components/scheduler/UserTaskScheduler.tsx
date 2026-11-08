// src/components/scheduler/UserTaskScheduler.tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { format, addDays, parseISO } from "date-fns";
import { CircleNotch as Loader2 } from "@phosphor-icons/react/ssr";

import {
  useTaskSchedulerTimeline,
  ScheduledTask,
  TeamMember,
} from "@/hooks/scheduler/useTaskSchedulerTimeline";

import SchedulerHeader from "./SchedulerHeader";
import SchedulerTimeline from "./SchedulerTimeline";
import SchedulerFooter from "./SchedulerFooter";
import UserStatsFooter from "./UserStatsFooter";
import UserActionsDrawer from "./UserActionsDrawer";
import UserSettingsDrawer, { UserPermissions } from "./UserSettingsDrawer";

import { usersApi } from "@/lib/api/users";
import { tasksApi } from "@/lib/api/tasks";
import OverlayPortal from "@/components/ui/OverlayPortal";

export default function UserTaskScheduler() {
  // --- Data State ---
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- UI Filters State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // --- Drawers State ---
  const [settingsUser, setSettingsUser] = useState<TeamMember | null>(null);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  
  const [actionsUser, setActionsUser] = useState<TeamMember | null>(null);
  const [isActionsDrawerOpen, setIsActionsDrawerOpen] = useState(false);

  // --- Selection State ---
  const [selectedStatsUserId, setSelectedStatsUserId] = useState<number | null>(null);

  // --- Task Creation Form State ---
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<ScheduledTask["priority"]>("medium");

  // 1. Fetch Data on Mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [members, fetchedTasks] = await Promise.all([
          usersApi.getTeamMembers(),
          tasksApi.getSchedulerTasks(),
        ]);
        setTeamMembers(members);
        setTasks(fetchedTasks);
      } catch (_error) {
        console.error("Failed to load scheduler data:", _error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. Timeline Hook (Includes new zoom controls)
  const {
    viewStartDate,
    viewEndDate,
    timelineDays,
    daysToShow,
    canZoomIn,
    canZoomOut,
    handleZoomIn,
    handleZoomOut,
    isCreateMode,
    schedulingStep,
    shiftWindow,
    jumpToToday,
    handleToggleCreateMode,
    handleCellClick,
    handleFinalizeTaskCreation,
    calculatePosition,
    getCellHighlightClass,
  } = useTaskSchedulerTimeline({
    tasks,
    teamMembers,
    onCreateTask: async (payload) => {
      setIsSaving(true);
      try {
        const newTask = await tasksApi.createSchedulerTask({
          assignedUserId: payload.assignedUserId,
          startDate: payload.startDate,
          dueDate: payload.dueDate,
          title: newTaskTitle.trim() || "New Scheduled Task",
          description: newTaskDescription.trim(),
          priority: newTaskPriority,
        });
        setTasks((prev) => [...prev, newTask]);
        setNewTaskTitle("");
        setNewTaskDescription("");
        setNewTaskPriority("medium");
        handleToggleCreateMode();
      } catch (_error) {
        console.error("Failed to create task:", _error);
      } finally {
        setIsSaving(false);
      }
    },
  });

  // 3. Default User: User with the most active tasks (Calculated FIRST)
  const defaultUserId = useMemo(() => {
    if (teamMembers.length === 0) return null;
    
    let topUserId: number | null = null;
    let maxActive = -1;
    
    teamMembers.forEach((user) => {
      const activeCount = tasks.filter(
        (t) => t.assignedUserId === user.id && t.status !== "completed"
      ).length;
      if (activeCount > maxActive) {
        maxActive = activeCount;
        topUserId = user.id;
      }
    });
    
    return topUserId;
  }, [teamMembers, tasks]);

  // 4. Currently Displayed User in Footer
  const displayedUserId = selectedStatsUserId ?? defaultUserId;
  
  const displayedUser = useMemo(() => {
    if (!displayedUserId) return null;
    return teamMembers.find((u) => u.id === displayedUserId) || null;
  }, [displayedUserId, teamMembers]);

  // 5. Filters (✅ EXCLUDES the footer user to prevent duplication)
  const filteredTeamMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let members = teamMembers;
    
    if (query) {
      members = members.filter((user) => 
        user.fullName.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query)
      );
    }
    
    // ✅ CRITICAL: Exclude the user currently displayed in the footer
    if (displayedUserId) {
      members = members.filter((u) => u.id !== displayedUserId);
    }
    
    return members;
  }, [teamMembers, searchQuery, displayedUserId]);

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  // 6. Handlers
  const handleUserRowSelect = useCallback((userId: number) => {
    if (isCreateMode) {
      handleCellClick(userId, viewStartDate);
    } else {
      setSelectedStatsUserId((prev) => (prev === userId ? null : userId));
    }
  }, [isCreateMode, handleCellClick, viewStartDate]);

  const handleStatusChange = useCallback(async (taskId: number, newStatus: ScheduledTask["status"]) => {
    const previousTasks = [...tasks];
    try {
      setTasks((prev) => prev.map((t) => 
        t.id === taskId ? { ...t, status: newStatus, progressPercentage: newStatus === "completed" ? 100 : t.progressPercentage } : t
      ));
      await tasksApi.updateSchedulerTask(taskId, { status: newStatus });
    } catch (_error) {
      console.error("Failed to update task status:", _error);
      setTasks(previousTasks);
    }
  }, [tasks]);

  const handleDrop = useCallback(async (e: React.DragEvent, targetUserId: number, targetDateStr: string) => {
  e.preventDefault();
  e.stopPropagation();
  const data = e.dataTransfer.getData("application/json");
  if (!data) return;

  const previousTasks = tasks; // ✅ FIXED: Snapshot BEFORE the optimistic update

  try {
    const { taskId, durationDays } = JSON.parse(data);
    const newStartDate = targetDateStr;
    const newDueDate = format(addDays(parseISO(targetDateStr), durationDays), "yyyy-MM-dd");

    // Optimistic update: update UI immediately
    setTasks((prev) => prev.map((t) =>
      t.id === taskId ? { ...t, assignedUserId: targetUserId, startDate: newStartDate, dueDate: newDueDate } : t
    ));

    // API call: persist to backend
    await tasksApi.updateSchedulerTask(taskId, {
      assignedUserId: targetUserId,
      startDate: newStartDate,
      dueDate: newDueDate
    });
  } catch (_error) {
    console.error("Failed to move task:", _error);
    setTasks(previousTasks); // ✅ Rollback on failure — now works!
  }
}, [tasks]);

const handleSaveUserSettings = useCallback(async (updatedUser: TeamMember, _permissions: UserPermissions) => {
  setIsSaving(true);
  try {
    const savedUser = await usersApi.updateTeamMember(updatedUser.id, updatedUser);
    setTeamMembers((prev) => prev.map((u) => (u.id === savedUser.id ? savedUser : u)));
    setIsSettingsDrawerOpen(false);
  } catch (_error) {
    console.error("Failed to save user settings:", _error);
  } finally {
    setIsSaving(false);
  }
}, []);

  const handleDeactivateUser = useCallback(async (userId: number) => {
    try {
      await usersApi.delete(userId);
      setTeamMembers((prev) => prev.filter((u) => u.id !== userId));
      setTasks((prev) => prev.filter((t) => t.assignedUserId !== userId));
      setIsActionsDrawerOpen(false);
      if (selectedStatsUserId === userId) {
        setSelectedStatsUserId(null);
      }
    } catch (_error) {
      console.error("Failed to deactivate user:", _error);
    }
  }, [selectedStatsUserId]);

  // 7. Global Analytics
  const analytics = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const activeTasks = tasks.filter((t) => t.status !== "completed");
    const overdueTasks = activeTasks.filter((t) => t.dueDate < todayStr);
    const completedTasks = tasks.filter((t) => t.status === "completed");
    
    const capacityUtilization = teamMembers.length > 0
      ? Math.min(100, Math.round((activeTasks.length / (teamMembers.length * 2.5)) * 100))
      : 0;
      
    const completionRate = tasks.length > 0 
      ? Math.round((completedTasks.length / tasks.length) * 100) 
      : 0;
      
    const avgTasksPerUser = teamMembers.length > 0 
      ? tasks.length / teamMembers.length 
      : 0;

    const burnoutRiskUsers = teamMembers.filter(u => 
      tasks.filter(t => t.assignedUserId === u.id && t.status !== "completed").length > 6
    ).length;

    return { 
      activeCount: activeTasks.length, 
      overdueCount: overdueTasks.length, 
      capacityUtilization, 
      completionRate, 
      avgTasksPerUser, 
      burnoutRiskUsers 
    };
  }, [tasks, teamMembers]);

  // 8. Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-96 items-center justify-center bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mb-4" aria-hidden="true" />
        <p className="text-sm font-medium text-[var(--color-ink-muted)]">Loading Scheduler...</p>
      </div>
    );
  }

  // 9. Main Render
  return (
    <div className="flex flex-col w-full max-h-[calc(100vh-4rem)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-xl shadow-black/5 overflow-hidden text-[var(--color-ink)] select-none antialiased relative">
      
      {/* Header (Now with Zoom Controls) */}
      <SchedulerHeader
        viewStartDate={viewStartDate}
        viewEndDate={viewEndDate}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        isCreateMode={isCreateMode}
        daysToShow={daysToShow}
        onShiftWindow={shiftWindow}
        onJumpToToday={jumpToToday}
        onToggleCreateMode={handleToggleCreateMode}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
      />

      {/* Global Stats Footer */}
      <SchedulerFooter
        activeCount={analytics.activeCount}
        overdueCount={analytics.overdueCount}
        capacityUtilization={analytics.capacityUtilization}
        avgTasksPerUser={analytics.avgTasksPerUser}
        completionRate={analytics.completionRate}
        burnoutRiskUsers={analytics.burnoutRiskUsers}
      />

      {/* Timeline Grid (6 rows, excludes footer user) */}
      <SchedulerTimeline
        timelineDays={timelineDays}
        filteredTeamMembers={filteredTeamMembers}
        filteredTasks={filteredTasks}
        selectedUserId={selectedStatsUserId}
        isCreateMode={isCreateMode}
        viewStartDate={viewStartDate}
        getCellHighlightClass={getCellHighlightClass}
        calculatePosition={calculatePosition}
        handleCellClick={handleCellClick}
        handleDrop={handleDrop}
        handleStatusChange={handleStatusChange}
        onOpenActions={(user) => { setActionsUser(user); setIsActionsDrawerOpen(true); }}
        onSelectUser={handleUserRowSelect}
      />

      {/* User Stats Footer - ALWAYS visible (shows 7th unique user) */}
      {displayedUser && (
        <UserStatsFooter
          user={displayedUser}
          tasks={tasks}
          onClose={() => {}}
        />
      )}

      {/* Task Creation Modal */}
      {schedulingStep === "assign-details" && (
        <OverlayPortal onClose={handleToggleCreateMode}>
         <div
           className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
           onClick={handleToggleCreateMode}
         >
            <div
              className="bg-[var(--color-surface)] p-6 rounded-2xl w-full max-w-sm border border-[var(--color-surface-border)] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
                <h3 className="text-sm font-bold mb-4">Schedule Task</h3>
                <input 
                  type="text" 
                  placeholder="Task Title" 
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full mb-3 p-2 rounded-lg border border-[var(--color-surface-border)] text-sm"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={handleToggleCreateMode} className="text-xs px-3 py-2 font-bold text-[var(--color-ink-muted)]">Cancel</button>
                  <button onClick={handleFinalizeTaskCreation} disabled={isSaving} className="text-xs px-3 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold disabled:opacity-50">
                    {isSaving ? "Saving..." : "Confirm"}
                  </button>
                </div>
            </div>
         </div>
        </OverlayPortal>
      )}
      
      {/* Drawers */}
      <UserActionsDrawer 
        isOpen={isActionsDrawerOpen} 
        onClose={() => setIsActionsDrawerOpen(false)} 
        user={actionsUser} 
        onQuickAssign={(uId) => { if(!isCreateMode) handleToggleCreateMode(); handleCellClick(uId, viewStartDate); }}
        onOpenSettings={(u) => { setSettingsUser(u); setIsSettingsDrawerOpen(true); }}
        onDeactivate={handleDeactivateUser}
      />

      <UserSettingsDrawer 
        isOpen={isSettingsDrawerOpen} 
        onClose={() => setIsSettingsDrawerOpen(false)} 
        user={settingsUser} 
        onSaveUser={handleSaveUserSettings} 
        onDeactivateUser={handleDeactivateUser} 
      />
    </div>
  );
}
