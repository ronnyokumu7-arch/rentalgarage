// src/app/dashboard/tasks/AssignedTo.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Calendar, Tag, Clock, Ban, CheckCircle2,
  Users, UserX, Wrench, Building2, Briefcase, DollarSign, Shield, Car, Archive,
  Search, Flag, ChevronRight
} from "lucide-react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";
import UserFilterSelector from "@/components/ui/UserFilterSelector";
import type { Task, User } from "@/lib/types";

interface AssignedToTabProps {
  tasks: Task[];
  users: User[];
  loading: boolean;
  metrics: { user: { total: number; overdue: number; completed: number } };
  
  search: string;
  setSearch: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  selectedUserId: string;
  setSelectedUserId: (val: string) => void;
  
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  pageSize: number;
  totalPages: number;
  filteredTasks: Task[];

  openDropdownId: number | null;
  dropdownPos: { top: number; right: number } | null;
  onToggleDropdown: (e: React.MouseEvent, taskId: number) => void;
  onStatusChange: (taskId: number, status: Task["status"]) => void;
  onArchive: (taskId: number) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  compliance: Shield, fleet: Car, finance: DollarSign, booking: Briefcase,
  hr: Users, operations: Building2, maintenance: Wrench, other: Tag,
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400" },
  in_progress: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  in_review: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  blocked: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  unassigned: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-rose-500",
  high: "bg-amber-500",
  medium: "bg-blue-500",
  low: "bg-slate-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  in_review: "In Review",
  blocked: "Blocked",
  unassigned: "Unassigned",
  completed: "Completed",
};

const PRIORITIES = ["urgent", "high", "medium", "low"];

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return { text: "No date", isOverdue: false };
  const date = new Date(dateStr);
  const isOverdue = date < new Date();
  return { text: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), isOverdue };
};

const getAssigneeName = (userId: number | null, users: User[]) => {
  if (!userId) return null;
  const user = users.find((u) => u.id === userId);
  return user?.full_name || "Unknown User";
};

const getAssigneeInitials = (userId: number | null, users: User[]) => {
  const name = getAssigneeName(userId, users);
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
};

export default function AssignedToTab({
  tasks: _tasks,
  users,
  loading,
  metrics,
  search,
  setSearch,
  priorityFilter,
  setPriorityFilter,
  selectedUserId,
  setSelectedUserId,
  currentPage,
  setCurrentPage,
  pageSize,
  totalPages: _totalPages,
  filteredTasks,
  openDropdownId: _openDropdownId,
  dropdownPos: _dropdownPos,
  onToggleDropdown: _onToggleDropdown,
  onStatusChange,
  onArchive
}: AssignedToTabProps) {
  const router = useRouter();

  // ✅ Reusable row actions for both table and cards
  const getTaskActions = (task: Task): RowAction<Task>[] => {
    const actions: RowAction<Task>[] = [];

    if (task.status !== "completed") {
      actions.push(
        {
          label: "Mark In Progress",
          icon: Clock,
          variant: "default",
          onClick: () => onStatusChange(task.id, "in_progress"),
        },
        {
          label: "Mark Completed",
          icon: CheckCircle2,
          variant: "primary",
          onClick: () => onStatusChange(task.id, "completed"),
        }
      );
    }

    actions.push({
      label: "Archive Task",
      icon: Archive,
      variant: "danger",
      separator: true,
      onClick: () => onArchive(task.id),
    });

    return actions;
  };

  // Client-side filtering for showCompleted toggle (preserved from original)
  const displayTasks = filteredTasks; // Simplified - hook handles filtering

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
        <Clock className="w-5 h-5 animate-spin" /> Loading tasks...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ✅ TOOLBAR: Metrics + Search + Filters + User Selector */}
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        
        {/* Metrics Counter Panel */}
        <div className="flex items-center justify-between gap-1 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Total</span>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{metrics.user.total}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Overdue</span>
            <span className="text-xs font-bold text-rose-500 tabular-nums">{metrics.user.overdue}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Completed</span>
            <span className="text-xs font-bold text-emerald-500 tabular-nums">{metrics.user.completed}</span>
          </div>
        </div>

        {/* Controls: Search + Filters + User Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:w-80">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
              />
            </div>

            {/* ✅ Reusable FilterDropdown - Priority */}
            <FilterDropdown
              filterId="assigned-priority"
              label="Priority"
              options={PRIORITIES.map((p) => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))}
              value={priorityFilter || null}
              onChange={(value) => setPriorityFilter(value || "")}
              icon={Flag}
            />
          </div>

          {/* User Filter Selector - Custom component for this tab */}
          <div className="flex-shrink-0">
            <UserFilterSelector 
              users={users} 
              selectedUserId={selectedUserId} 
              onChange={setSelectedUserId} 
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <>
        {/* ✅ MOBILE: Premium Task CardGrid */}
        <div className="block md:hidden">
          <CardGrid
            data={displayTasks}
            getCardId={(task) => task.id}
            compact={true}
            cardClassName="!p-2.5 hover:!border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200"
            containerClassName="px-2 pb-2"
            maxHeight="calc(100vh - 160px)"
            
            renderCardHeader={({ item }) => {
              const CategoryIcon = CATEGORY_ICONS[item.category] || Tag;
              const priorityColor = PRIORITY_COLORS[item.priority] || "bg-slate-400";
              const isCompleted = item.status === 'completed';
              
              return (
                <div 
                  className="flex items-center justify-between w-full cursor-pointer"
                  onClick={() => router.push(`/dashboard/tasks/${item.id}`)}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center">
                        <CategoryIcon size={14} className="text-[var(--color-primary)]" />
                      </div>
                      <div className="absolute -top-0.5 -right-0.5">
                        <div className={`w-2 h-2 rounded-full ${priorityColor} ring-1 ring-[var(--color-surface)]`} />
                      </div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate ${isCompleted ? 'line-through text-[var(--color-ink-subtle)]' : 'text-[var(--color-ink)]'}`}>
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <span className="text-[9px] text-[var(--color-ink-muted)] font-medium capitalize">
                          {item.priority}
                        </span>
                        <span className="text-[8px] text-[var(--color-ink-subtle)]">•</span>
                        <span className="text-[9px] text-[var(--color-ink-muted)] truncate">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight size={14} className="text-[var(--color-ink-subtle)] flex-shrink-0 ml-1" />
                </div>
              );
            }}
            
            renderCardBody={({ item }) => {
              const assigneeName = getAssigneeName(item.user_id, users);
              const dateInfo = formatDate(item.due_date);
              const style = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
              const isCompleted = item.status === 'completed';
              
              return (
                <div className="mt-1.5 pt-1.5 border-t border-[var(--color-surface-border)]/50">
                  <div className="flex items-center gap-2">
                    {/* Assignee */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {assigneeName ? (
                        <>
                          <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[8px] font-bold text-[var(--color-primary)] flex-shrink-0">
                            {getAssigneeInitials(item.user_id, users)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate leading-tight">
                              {assigneeName}
                            </p>
                            <span className="text-[8px] text-[var(--color-ink-muted)] font-medium">
                              Assignee
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] truncate leading-tight">
                            Unassigned
                          </p>
                          <span className="text-[8px] text-[var(--color-ink-muted)] font-medium">
                            No assignee
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Calendar size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className={`text-[11px] font-semibold truncate leading-tight ${
                          dateInfo.isOverdue && !isCompleted ? 'text-rose-500' : 'text-[var(--color-ink)]'
                        }`}>
                          {dateInfo.text}
                        </p>
                        <span className="text-[8px] text-[var(--color-ink-muted)] font-medium">
                          {dateInfo.isOverdue && !isCompleted ? '⚠️ Overdue' : 'Due Date'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="mt-1.5 pt-1.5 border-t border-[var(--color-surface-border)]/50 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${style.bg} ${style.text}`}>
                      {item.status === 'in_progress' && <Clock size={8} />}
                      {item.status === 'blocked' && <Ban size={8} />}
                      {STATUS_LABELS[item.status] || item.status}
                    </span>
                    
                    {!isCompleted ? (
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onStatusChange(item.id, "completed"); 
                        }}
                        className="text-[10px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <CheckCircle2 size={11} />
                        Complete
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onArchive(item.id); 
                        }}
                        className="text-[10px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Archive size={11} />
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              );
            }}
            
            rowActions={getTaskActions}
          />
        </div>

        {/* ✅ DESKTOP: Reusable DataTable */}
        <div className="hidden md:block">
          <DataTable
            data={displayTasks}
            columns={[
              {
                header: "Task",
                accessorKey: "title",
                cell: ({ row }) => {
                  const task = row.original;
                  const CategoryIcon = CATEGORY_ICONS[task.category] || Tag;
                  return (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
                        <CategoryIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/tasks/${task.id}`);
                          }}
                          className={`text-sm font-semibold truncate hover:text-[var(--color-primary)] transition-colors text-left ${task.status === 'completed' ? 'line-through text-[var(--color-ink-subtle)]' : 'text-[var(--color-ink)]'}`}
                        >
                          {task.title}
                        </button>
                        <p className="text-xs text-[var(--color-ink-muted)] truncate capitalize flex items-center gap-1 mt-0.5">
                          <Tag size={10} /> {task.category}
                        </p>
                      </div>
                    </div>
                  );
                },
              },
              {
                header: "Assignee",
                accessorKey: "user_id",
                cell: ({ row }) => {
                  const task = row.original;
                  const assigneeName = getAssigneeName(task.user_id, users);
                  const isUnassigned = task.status === "unassigned" || task.user_id === null;
                  
                  return isUnassigned ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                      <UserX size={10} /> Unassigned
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)] flex-shrink-0">
                        {getAssigneeInitials(task.user_id, users)}
                      </div>
                      <span className="font-medium truncate max-w-[120px]">{assigneeName}</span>
                    </div>
                  );
                },
              },
              {
                header: "Priority",
                accessorKey: "priority",
                cell: ({ row }) => (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[row.original.priority] || "bg-slate-400"}`} />
                    <span className="text-xs font-semibold capitalize text-[var(--color-ink)]">{row.original.priority}</span>
                  </div>
                ),
              },
              {
                header: "Status",
                accessorKey: "status",
                cell: ({ row }) => {
                  const task = row.original;
                  const style = STATUS_STYLES[task.status] || STATUS_STYLES.pending;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                      {task.status === 'in_progress' && <Clock size={10} />}
                      {task.status === 'blocked' && <Ban size={10} />}
                      {STATUS_LABELS[task.status] || task.status}
                    </span>
                  );
                },
              },
              {
                header: "Due Date",
                accessorKey: "due_date",
                cell: ({ row }) => {
                  const dateInfo = formatDate(row.original.due_date);
                  return (
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-[var(--color-ink-subtle)]" />
                      <span className={`text-xs font-medium ${dateInfo.isOverdue && row.original.status !== 'completed' ? "text-rose-500 font-bold" : "text-[var(--color-ink)]"}`}>
                        {dateInfo.text}
                      </span>
                      {dateInfo.isOverdue && row.original.status !== 'completed' && <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[9px] font-extrabold text-rose-500">OVERDUE</span>}
                    </div>
                  );
                },
              },
            ]}
            rowActions={getTaskActions}
            getRowId={(task) => task.id}
            onRowClick={(task) => router.push(`/dashboard/tasks/${task.id}`)}
            loading={loading}
            emptyMessage="No tasks found"
            currentPage={currentPage}
            totalPages={Math.ceil(displayTasks.length / pageSize) || 1}
            totalItems={displayTasks.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            viewMode="desktop"
          />
        </div>
      </>
    </div>
  );
}
