// src/app/dashboard/tasks/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { ListChecks, Users, CheckCircle2 } from "lucide-react";
import { useTasksList } from "@/hooks/tasks/useTasksList";
import type { Task } from "@/lib/types";
import TaskProfileModal from "@/components/tasks/TaskProfileModal";
import TasksTab from "@/components/tasks/TasksTab";
import AssignedToTab from "@/components/tasks/AssignedTo";
import CompletedTasksTab from "@/components/tasks/CompletedTasks";

const TABS = [
  { id: "tasks" as const, label: "Tasks", icon: ListChecks },
  { id: "assigned-to" as const, label: "Assigned To", icon: Users },
  { id: "completed" as const, label: "Completed", icon: CheckCircle2 },
];

// ✅ REUSABLE: Premium Sliding Tab Switcher (Matches all other pages)
function PremiumTabSwitcher({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: any) => void }) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; top: number; height: number } | null>(null);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabRefs.current[activeTab];
      if (activeEl) {
        const rect = activeEl.getBoundingClientRect();
        const containerRect = activeEl.parentElement?.getBoundingClientRect();
        if (containerRect) {
          setIndicatorStyle({
            left: rect.left - containerRect.left,
            width: rect.width,
            top: rect.top - containerRect.top,
            height: rect.height,
          });
        }
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  return (
    <div className="relative w-full sm:w-auto">
      {/* Sliding Indicator Pill */}
      {indicatorStyle && (
        <div
          className="absolute z-0 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: indicatorStyle.top,
            height: indicatorStyle.height,
          }}
        />
      )}

      {/* Tab Container - No Scrollbar, Snap Centering */}
      <div 
        className="relative z-10 flex items-center gap-1 overflow-x-auto pb-0.5 pt-0.5 scrollbar-hide snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el; }}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 
                whitespace-nowrap touch-manipulation cursor-pointer snap-center flex-shrink-0
                ${isActive 
                  ? "text-[var(--color-ink)]" 
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]/50"
                }
              `}
            >
              <Icon size={isActive ? 16 : 14} className={`transition-all duration-300 ${isActive ? "text-[var(--color-primary)]" : "opacity-70"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Subtle bottom border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--color-surface-border)]/50 -z-10" />
    </div>
  );
}

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    loading,
    activeTab, setActiveTab,
    search, setSearch,
    priorityFilter, setPriorityFilter,
    categoryFilter, setCategoryFilter,
    selectedUserId, setSelectedUserId,
    timeFilter, setTimeFilter,
    currentPage, setCurrentPage,
    pageSize,
    filteredTasks,
    paginatedTasks,
    totalPages,
    metrics,
    users,
    openDropdownId,
    dropdownPos,
    handleToggleDropdown,
    handleAssign,
    handleClaim,
    handleStatusChange,
    handleReopen,
    handleArchive,
    refetch,
  } = useTasksList();

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // ✅ Dynamic Header Info
  const currentTabInfo = {
    tasks: {
      title: "Task Management",
      description: "Track, assign, and monitor operational tasks across your team.",
      icon: <ListChecks size={20} />,
    },
    "assigned-to": {
      title: "Assigned To",
      description: "View and manage tasks by team member and workload distribution.",
      icon: <Users size={20} />,
    },
    completed: {
      title: "Completed Tasks",
      description: "Review completed tasks, track historical performance, and reopen items.",
      icon: <CheckCircle2 size={20} />,
    },
  }[activeTab];

  return (
    <div className="space-y-6">
      {/* Header & Premium Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              {currentTabInfo.icon}
            </div>
            {currentTabInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>

        {/* ✅ Premium Sliding Tab Switcher */}
        <PremiumTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content Card - Matches Fleet/Clients/Bookings pattern */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
        
        {activeTab === "tasks" && (
          <TasksTab
            tasks={paginatedTasks}
            users={users}
            loading={loading}
            metrics={metrics}
            search={search}
            setSearch={setSearch}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            filteredTasks={filteredTasks}
            openDropdownId={openDropdownId}
            dropdownPos={dropdownPos}
            onToggleDropdown={handleToggleDropdown}
            onAssign={handleAssign}
            onClaim={handleClaim}
            onStatusChange={handleStatusChange}
            onArchive={handleArchive}
            onOpenCreateModal={handleOpenNewTask}
            onEdit={handleEditTask}
          />
        )}

        {activeTab === "assigned-to" && (
          <AssignedToTab
            tasks={paginatedTasks}
            users={users}
            loading={loading}
            metrics={metrics}
            search={search}
            setSearch={setSearch}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            filteredTasks={filteredTasks}
            openDropdownId={openDropdownId}
            dropdownPos={dropdownPos}
            onToggleDropdown={handleToggleDropdown}
            onStatusChange={handleStatusChange}
            onArchive={handleArchive}
          />
        )}

        {activeTab === "completed" && (
          <CompletedTasksTab
            tasks={paginatedTasks}
            users={users}
            loading={loading}
            metrics={metrics}
            search={search}
            setSearch={setSearch}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            filteredTasks={filteredTasks}
            openDropdownId={openDropdownId}
            dropdownPos={dropdownPos}
            onToggleDropdown={handleToggleDropdown}
            onReopen={handleReopen}
          />
        )}
      </div>

      {/* Task Profile Modal */}
      <TaskProfileModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingTask={editingTask} 
        onSaveSuccess={refetch} 
      />
    </div>
  );
}
