// src/app/dashboard/tasks/page.tsx
"use client";

import { useState } from "react";
import { ListChecks, Users, CheckCircle2, ClipboardList, UserSquare2, CircleCheckBig } from "lucide-react";
import { useTasksList } from "@/hooks/tasks/useTasksList";
import type { Task } from "@/lib/types";
import TaskProfileModal from "@/components/tasks/TaskProfileModal";
import TasksTab from "@/components/tasks/TasksTab";
import AssignedToTab from "@/components/tasks/AssignedTo";
import CompletedTasksTab from "@/components/tasks/CompletedTasks";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";

const TABS = [
  { id: "tasks", label: "Tasks", icon: ListChecks },
  { id: "assigned-to", label: "Assigned To", icon: Users },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
];

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

  // ✅ Dynamic Header Info (PREMIUM: No circles, just clean bare icons)
  const currentTabInfo = {
    tasks: {
      title: "Task Management",
      description: "Track, assign, and monitor operational tasks across your team.",
      icon: <ClipboardList size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    "assigned-to": {
      title: "Assigned To",
      description: "View and manage tasks by team member and workload distribution.",
      icon: <UserSquare2 size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    completed: {
      title: "Completed Tasks",
      description: "Review completed tasks, track historical performance, and reopen items.",
      icon: <CircleCheckBig size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
  }[activeTab];

  return (
    <div className="space-y-6">
      {/* Header & Premium Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {/* ✅ Bare Icon - No container */}
            {currentTabInfo.icon}
            
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
              {currentTabInfo.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>

        {/* ✅ Imported Reusable Premium Tab Switcher */}
        <PremiumTabSwitcher 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)} 
        />
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
