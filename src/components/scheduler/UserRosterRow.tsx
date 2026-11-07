// src/components/scheduler/UserRosterRow.tsx
"use client";

import { DotsThreeVertical as MoreVertical } from "@phosphor-icons/react/ssr";
import { TeamMember } from "@/hooks/scheduler/useTaskSchedulerTimeline";

interface UserRosterRowProps {
  user: TeamMember;
  activeTaskCount: number;
  isSelected: boolean;
  onSelectUser: (userId: number) => void;
  onOpenActions: () => void;
}

export default function UserRosterRow({
  user,
  activeTaskCount,
  isSelected,
  onSelectUser,
  onOpenActions,
}: UserRosterRowProps) {
  return (
    <div
      onClick={() => onSelectUser(user.id)}
      className={`w-72 flex-shrink-0 p-3 px-3.5 border-r border-[var(--color-surface-border)] bg-[var(--color-surface)] z-20 flex items-center justify-between sticky left-0 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.04)] transition-colors select-none group/roster cursor-pointer border-l-4 ${
        isSelected
          ? "bg-[var(--color-primary)]/[0.03] border-l-[var(--color-primary)]"
          : "hover:bg-[var(--color-surface-hover)]/40 border-l-transparent"
      }`}
    >
      {/* Left Side: Avatar & Identity */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Avatar with Active Task Badge */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center font-extrabold text-xs text-[var(--color-primary)] overflow-hidden group-hover/roster:border-[var(--color-primary)]/40 transition-colors">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.fullName} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span>{user.fullName.charAt(0)}</span>
            )}
          </div>
          {activeTaskCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-primary)] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm border-2 border-[var(--color-surface)]">
              {activeTaskCount}
            </span>
          )}
        </div>

        {/* Name & Role Details */}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-extrabold text-[var(--color-ink)] truncate tracking-tight leading-snug">
            {user.fullName}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[var(--color-ink-muted)]">
            <span className="truncate max-w-[100px] font-medium">{user.role}</span>
            <span className="text-[var(--color-surface-border)]">•</span>
            <span className="font-mono text-[9px] font-semibold opacity-80">
              {user.maxCapacityHours}h/wk
            </span>
          </div>
        </div>
      </div>

      {/* Right Side: Actions Menu Trigger */}
      <div className="relative shrink-0 pl-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // Prevents triggering onSelectUser
            onOpenActions();
          }}
          className="w-7 h-7 rounded-lg hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-all"
          aria-label="Open user actions"
        >
          <MoreVertical size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
