"use client";
import { confirmAction } from "@/lib/utils/confirmAction";

import { useState } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import { Flame, DotsSixVertical as GripVertical, Calendar, Clock, Eye, Trash as Trash2 } from "@phosphor-icons/react/ssr";
import { ScheduledTask } from "@/hooks/scheduler/useTaskSchedulerTimeline";

interface TaskTimelineBarProps {
  task: ScheduledTask;
  left: number;
  width: number;
  isCreateMode: boolean;
  pendingTaskCount?: number;
  onOpenUserSettings?: (userId: number) => void;
  onStatusChange?: (taskId: number, status: ScheduledTask["status"]) => void;
  onDeleteTask?: (taskId: number) => void;
}

export default function TaskTimelineBar({
  task,
  left,
  width,
  isCreateMode,
  pendingTaskCount = 0,
  onOpenUserSettings,
  onStatusChange,
  onDeleteTask,
}: TaskTimelineBarProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);

  const durationDays = differenceInDays(
    parseISO(task.dueDate),
    parseISO(task.startDate)
  );

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    const payload = JSON.stringify({ taskId: task.id, durationDays, assignedUserId: task.assignedUserId });
    e.dataTransfer.setData("application/json", payload);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCreateMode && onOpenUserSettings) {
      onOpenUserSettings(task.assignedUserId);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
  };

  const handleContextMenuClose = () => {
    setShowContextMenu(false);
  };

  // ✅ NEW: Urgency-based color system
  const getUrgencyStyle = () => {
    const now = new Date();
    const dueDate = parseISO(task.dueDate);
    const msUntilDue = dueDate.getTime() - now.getTime();
    const hoursUntilDue = msUntilDue / (1000 * 60 * 60);
    const minutesUntilDue = msUntilDue / (1000 * 60);

    // COMPLETED: Always green (though these should be filtered out)
    if (task.status === "completed") {
      return "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300";
    }

    // <= 30 mins OR overdue: ROSE (Critical)
    if (minutesUntilDue <= 30) {
      return "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300";
    }

    // <= 3 hours: AMBER (Warning)
    if (hoursUntilDue <= 3) {
      return "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300";
    }

    // > 3 hours: GREEN (Fresh/On track)
    return "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300";
  };

  const getPriorityBadge = (priority: ScheduledTask["priority"]) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="px-1.5 py-0.5 rounded-sm bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Flame size={10} aria-hidden="true" /> Urgent
          </span>
        );
      case "high":
        return (
          <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[9px] uppercase tracking-wider shrink-0">
            High
          </span>
        );
      case "medium":
        return (
          <span className="px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-600 dark:text-blue-400 font-extrabold text-[9px] uppercase tracking-wider shrink-0">
            Med
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded-sm bg-slate-500/20 text-slate-600 dark:text-slate-400 font-extrabold text-[9px] uppercase tracking-wider shrink-0">
            Low
          </span>
        );
    }
  };

  return (
    <>
      <div
        style={{ 
          left: `calc(${left}% + 4px)`, 
          width: `calc(${width}% - 8px)` 
        }}
        draggable={!isCreateMode}
        onDragStart={handleDragStart}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        // ✅ UPDATED: Uses urgency-based colors instead of status-based
        className={`absolute h-14 my-1 border rounded-sm p-1.5 flex flex-col justify-between transition-all duration-200 shadow-sm z-20 overflow-hidden cursor-pointer select-none group ${getUrgencyStyle()} ${
          isCreateMode ? "opacity-20 pointer-events-none" : ""
        } hover:shadow-md`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <span className="text-[11px] font-extrabold truncate tracking-tight flex items-center gap-1">
            <GripVertical size={11} className="opacity-40 shrink-0" aria-hidden="true" />
            <span className="truncate">{task.title}</span>
          </span>
          <div className="shrink-0 flex items-center gap-1">
            {getPriorityBadge(task.priority)}
            {pendingTaskCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-sm bg-[var(--color-surface-border)]/50 text-[var(--color-ink-muted)] font-extrabold text-[9px] tabular-nums shrink-0">
                {pendingTaskCount}
              </span>
            )}
          </div>
        </div>

        {/* Progress Line & Date Range */}
        <div className="space-y-1 mt-1">
          <div className="flex items-center justify-between text-[9px] font-bold opacity-90">
            <span className="font-mono tracking-tight opacity-80 flex items-center gap-1">
              <Calendar size={8} aria-hidden="true" />
              {format(parseISO(task.startDate), "MMM d")} - {format(parseISO(task.dueDate), "MMM d")}
            </span>
            <span className="font-mono text-[9px] font-black">
              {task.progressPercentage}%
            </span>
          </div>

          <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-sm overflow-hidden">
            <div
              style={{ width: `${task.progressPercentage}%` }}
              className={`h-full transition-all duration-500 ease-out ${
                task.status === "completed" ? "bg-emerald-500" :
                task.status === "blocked" ? "bg-rose-500" :
                "bg-[var(--color-primary)]"
              }`}
            />
          </div>
        </div>
      </div>

      {/* RIGHT-CLICK CONTEXT MENU */}
      {showContextMenu && (
        <>
          <div 
            className="fixed inset-0 z-[60]" 
            onClick={handleContextMenuClose}
          />
          <div 
            className="absolute z-[70] w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <button
              onClick={() => {
                handleContextMenuClose();
                onOpenUserSettings?.(task.assignedUserId);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <Eye size={14} className="text-[var(--color-ink-muted)]" aria-hidden="true" />
              <span>View User Tasks</span>
            </button>
            
            {onStatusChange && (
              <>
                <div className="h-px bg-[var(--color-surface-border)] my-1" />
                <button
                  onClick={() => {
                    handleContextMenuClose();
                    onStatusChange(task.id, 'in_progress');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <Clock size={14} className="text-blue-500" aria-hidden="true" />
                  <span>Mark In Progress</span>
                </button>
                <button
                  onClick={() => {
                    handleContextMenuClose();
                    onStatusChange(task.id, 'completed');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <Clock size={14} className="text-emerald-500" aria-hidden="true" />
                  <span>Mark Completed</span>
                </button>
              </>
            )}
            
            <div className="h-px bg-[var(--color-surface-border)] my-1" />
            
            {onDeleteTask && (
              <button
                onClick={() => {
                  handleContextMenuClose();
                  if (confirmAction('Are you sure you want to delete this task?')) {
                    onDeleteTask(task.id);
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 size={14} aria-hidden="true" />
                <span>Delete Task</span>
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
