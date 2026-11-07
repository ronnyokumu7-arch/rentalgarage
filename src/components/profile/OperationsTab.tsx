"use client";

import { useOperations } from "@/hooks/profile/useOperations";
import ActionCenterList from "./ActionCenterList";
import SmartProfileViewer from "./SmartProfileViewer";
import { Stack as Layers, CursorClick as MousePointerClick, ArrowLeft } from "@phosphor-icons/react/ssr";

interface OperationsTabProps {
  userId: number;
  currentUserRole: string;
  isSelfView: boolean;
  hideHeader?: boolean;
}

export default function OperationsTab({ 
  userId, 
  currentUserRole, 
  isSelfView,
  hideHeader = false
}: OperationsTabProps) {
  const {
    tasks, selectedTask, setSelectedTask,
    activeTab, setActiveTab, loading, updatingId,
    handleToggleComplete
  } = useOperations(userId, currentUserRole, isSelfView);

  return (
    <div className="w-full flex flex-col min-h-0">
      
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center gap-3 sm:gap-4 px-1 sm:px-2 mb-3 sm:mb-6">
          <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 items-center justify-center shrink-0">
            <Layers size={22} className="text-[var(--color-primary)]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-bold text-[var(--color-ink)] truncate">
              Operations Command Center
            </h2>
            <p className="text-[11px] sm:text-xs text-[var(--color-ink-muted)] mt-0.5 truncate">
              Manage tasks, assign actions, and execute workflows in real-time.
            </p>
          </div>
        </div>
      )}

      {/* Responsive Master-Detail Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
        
        {/* LEFT PANEL: Action Center List (Hidden on mobile when task is selected) */}
        <div className={`lg:col-span-7 rounded-xl sm:rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs overflow-hidden flex-col ${
          selectedTask ? 'hidden lg:flex' : 'flex'
        }`}>
          <ActionCenterList
            tasks={tasks}
            selectedTask={selectedTask}
            onSelectTask={setSelectedTask}
            activeTab={
              activeTab === "completed" ? "done" : "pending"
            }
            onTabChange={(tab) => {
              setActiveTab(
                tab === "done" ? "completed" : "pending"
              );
            }}
            loading={loading}
            updatingId={updatingId}
            onToggleComplete={handleToggleComplete}
          />
        </div>

        {/* RIGHT PANEL: Detail Viewer / Empty State (Full width on mobile when task is selected) */}
        <div className={`lg:col-span-5 rounded-xl sm:rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs overflow-hidden flex-col ${
          !selectedTask ? 'hidden lg:flex' : 'flex'
        }`}>
          {selectedTask ? (
            <div className="flex flex-col w-full">
              {/* Mobile Return Navigation */}
              <button
                onClick={() => setSelectedTask(null)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 border-b border-[var(--color-surface-border)] active:bg-[var(--color-primary)]/10 transition-colors w-full"
              >
                <ArrowLeft size={14} className="shrink-0" aria-hidden="true" /> Back to task list
              </button>
              
              <SmartProfileViewer task={selectedTask} />
            </div>
          ) : (
            /* Desktop Empty State */
            <div className="flex flex-col items-center justify-center min-h-[320px] lg:min-h-[420px] text-center p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-3 sm:mb-4">
                <MousePointerClick size={24} className="text-[var(--color-ink-subtle)] sm:w-7 sm:h-7" aria-hidden="true" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--color-ink)] mb-1">
                Select a Task
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--color-ink-muted)] max-w-[220px] leading-relaxed">
                Click any task to view its context, linked resources, and operational actions.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
