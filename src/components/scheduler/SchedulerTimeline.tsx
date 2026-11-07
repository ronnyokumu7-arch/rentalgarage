// src/components/scheduler/SchedulerTimeline.tsx
"use client";

import { Users } from "@phosphor-icons/react/ssr";
import { format, isToday } from "date-fns";
import { ScheduledTask, TeamMember } from "@/hooks/scheduler/useTaskSchedulerTimeline";
import UserRosterRow from "./UserRosterRow";
import TaskTimelineBar from "./TaskTimelineBar";

interface SchedulerTimelineProps {
  timelineDays: Date[];
  filteredTeamMembers: TeamMember[];
  filteredTasks: ScheduledTask[];
  selectedUserId: number | null;
  isCreateMode: boolean;
  viewStartDate: string;
  getCellHighlightClass: (userId: number, dateStr: string) => string;
  calculatePosition: (startDate: string, dueDate: string) => { left: number; width: number; visible: boolean };
  handleCellClick: (userId: number, dateStr: string) => void;
  handleDrop: (e: React.DragEvent, targetUserId: number, targetDateStr: string) => void;
  handleStatusChange: (taskId: number, newStatus: ScheduledTask["status"]) => void;
  onOpenActions: (user: TeamMember) => void;
  onSelectUser: (userId: number) => void;
}

export default function SchedulerTimeline({
  timelineDays,
  filteredTeamMembers,
  filteredTasks,
  selectedUserId,
  isCreateMode,
  viewStartDate:_viewStartDate,
  getCellHighlightClass,
  calculatePosition:_calculatePosition,
  handleCellClick,
  handleDrop,
  handleStatusChange,
  onOpenActions,
  onSelectUser,
}: SchedulerTimelineProps) {
  if (!timelineDays || timelineDays.length === 0) {
    return null;
  }

  const getPriorityWeight = (priority: string) => {
    switch (priority) {
      case "urgent": return 4;
      case "high": return 3;
      case "medium": return 2;
      case "low": return 1;
      default: return 0;
    }
  };

  return (
    <section className="flex-1 overflow-auto custom-scrollbar relative max-h-[27rem]">
      {/* Sticky Timeline Header */}
      <div className="flex sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-surface-border)] shadow-sm">
        <div className="sticky left-0 z-20 w-72 shrink-0 p-4 border-r border-[var(--color-surface-border)] bg-[var(--color-surface)]/95 font-extrabold text-[11px] uppercase text-[var(--color-ink-subtle)] flex items-center justify-between">
          <span>Team Roster</span> 
          <Users size={14} aria-hidden="true" />
        </div>
        <div className="flex flex-1 min-w-[700px]">
          {timelineDays.map((day) => (
            <div 
              key={day.toISOString()} 
              className={`flex flex-col justify-center flex-1 min-w-[50px] py-2 text-center border-r border-[var(--color-surface-border)] ${
                isToday(day) ? "bg-[var(--color-primary)]/5" : ""
              }`}
            >
              <span className={`text-[10px] font-extrabold uppercase ${
                isToday(day) ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-subtle)]'
              }`}>
                {format(day, "EEE")}
              </span>
              <span className={`w-6 h-6 mx-auto mt-1 text-xs font-mono font-bold flex items-center justify-center rounded-full ${
                isToday(day) ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-ink)]"
              }`}>
                {format(day, "d")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Rows */}
      <div className="min-w-[972px] divide-y divide-[var(--color-surface-border)]">
        {filteredTeamMembers.map((user) => {
          const tasksByScheduledDate = new Map<string, ScheduledTask[]>();
          
          filteredTasks
            .filter((t) => t.assignedUserId === user.id)
            .forEach((task) => {
              const scheduledDateStr = task.startDate;
              if (!tasksByScheduledDate.has(scheduledDateStr)) {
                tasksByScheduledDate.set(scheduledDateStr, []);
              }
              tasksByScheduledDate.get(scheduledDateStr)!.push(task);
            });

          return (
            <div 
              key={user.id} 
              className="relative flex items-stretch min-h-[4.5rem] hover:bg-[var(--color-surface-hover)]/30"
            >
              <UserRosterRow 
                user={user} 
                activeTaskCount={filteredTasks.filter((t) => t.assignedUserId === user.id && t.status !== "completed").length}
                isSelected={selectedUserId === user.id} 
                onSelectUser={onSelectUser} 
                onOpenActions={() => onOpenActions(user)} 
              />
              
              <div className="relative flex flex-1 min-w-[700px]">
                {/* Background Grid Cells (Handles drops on EMPTY days) */}
                <div className="absolute inset-0 flex">
                  {timelineDays.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    return (
                      <div 
                        key={dateStr} 
                        onClick={() => handleCellClick(user.id, dateStr)}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        onDrop={(e) => handleDrop(e, user.id, dateStr)}
                        className={`flex-1 border-r border-[var(--color-surface-border)] ${
                          isCreateMode 
                            ? "cursor-pointer hover:bg-[var(--color-primary)]/10" 
                            : "cursor-default"
                        } ${getCellHighlightClass(user.id, dateStr)}`} 
                      />
                    );
                  })}
                </div>
                
                {/* Task Cards (Handles drops on OCCUPIED days) */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-14 pointer-events-none">
                  {timelineDays.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const daysTasks = tasksByScheduledDate.get(dateStr) || [];
                    
                    if (daysTasks.length === 0) return null;
                    
                    const sortedTasks = [...daysTasks].sort((a, b) => 
                      getPriorityWeight(b.priority) - getPriorityWeight(a.priority)
                    );
                    const primaryTask = sortedTasks[0];
                    
                    const dayIndex = timelineDays.findIndex(d => format(d, "yyyy-MM-dd") === dateStr);
                    const left = (dayIndex / timelineDays.length) * 100;
                    const width = 100 / timelineDays.length;
                    
                    return (
                      <div
                        key={`${user.id}-${dateStr}`}
                        style={{ 
                          left: `calc(${left}% + 4px)`, 
                          width: `calc(${width}% - 8px)` 
                        }}
                        className="absolute h-full pointer-events-auto"
                        // ✅ CRITICAL FIX: Added drop handlers to the task card wrapper
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        onDrop={(e) => handleDrop(e, user.id, dateStr)}
                      >
                        <TaskTimelineBar 
                          task={primaryTask}
                          left={0} 
                          width={100} 
                          isCreateMode={isCreateMode} 
                          onStatusChange={handleStatusChange}
                          pendingTaskCount={daysTasks.filter(t => t.status !== "completed").length}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
