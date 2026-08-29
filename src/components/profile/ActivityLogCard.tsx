// src/components/profile/ActivityLogCard.tsx
"use client";

import { FileText, Users, Car, Settings, Clock, AlertCircle } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { ActivityLog } from "@/lib/api/activityLogs";

interface ActivityLogCardProps {
  logs: ActivityLog[];
}

// ✅ BRAND TOKENS: Semantic icon styling per target type
const getTargetConfig = (targetType: string | null) => {
  switch (targetType) {
    case "booking":
      return { 
        icon: FileText, 
        bg: "bg-blue-500/5 border-blue-500/10 text-blue-500",
        label: "Booking"
      };
    case "client":
      return { 
        icon: Users, 
        bg: "bg-emerald-500/5 border-emerald-500/10 text-emerald-500",
        label: "Client"
      };
    case "vehicle":
      return { 
        icon: Car, 
        bg: "bg-violet-500/5 border-violet-500/10 text-violet-500",
        label: "Vehicle"
      };
    default:
      return { 
        icon: Settings, 
        bg: "bg-[var(--color-surface-hover)] border-[var(--color-surface-border)] text-[var(--color-ink-subtle)]",
        label: "System"
      };
  }
};

// Format action text with proper capitalization
const formatAction = (action: string) => {
  return action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

export default function ActivityLogCard({ logs }: ActivityLogCardProps) {
  return (
    <SectionCard className="!p-0 overflow-hidden">
      
      {/* Unified Header */}
      <div className="flex items-center gap-3 p-6 pb-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
          <Clock size={18} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Recent Activity</h3>
          <p className="text-[11px] text-[var(--color-ink-muted)]">Audit trail and system events</p>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="p-6">
        {logs.length > 0 ? (
          <div className="space-y-0">
            {logs.map((log, index) => {
              const config = getTargetConfig(log.target_type);
              const Icon = config.icon;
              const isLast = index === logs.length - 1;

              return (
                <div key={log.id} className="relative flex gap-4 group">
                  
                  {/* Timeline Track */}
                  {!isLast && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-[var(--color-surface-border)]" />
                  )}

                  {/* Icon Node */}
                  <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${config.bg}`}>
                    <Icon size={16} />
                  </div>

                  {/* Content Block */}
                  <div className="flex-1 pb-6 last:pb-0 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">
                        {/* ✅ FIXED: Use log.label (human-readable) instead of log.action */}
                        {log.label || formatAction(log.action)}
                        {log.target_id && (
                          <span className="ml-1.5 text-xs font-mono text-[var(--color-ink-subtle)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded">
                            #{log.target_id}
                          </span>
                        )}
                      </p>
                      <time className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("en-US", { 
                          month: "short", 
                          day: "numeric", 
                          hour: "2-digit", 
                          minute: "2-digit" 
                        })}
                      </time>
                    </div>
                    
                    {/* ✅ FIXED: Use log.summary (denormalized data) instead of log.description */}
                    {log.summary && (
                      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mt-1 line-clamp-2">
                        {log.summary.client_name ? `Client: ${log.summary.client_name}` : ""}
                        {log.summary.booking_number ? ` • Booking: ${log.summary.booking_number}` : ""}
                        {log.summary.amount ? ` • Amount: ${log.summary.amount}` : ""}
                        {log.summary.reason ? ` • Reason: ${log.summary.reason}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-[var(--color-ink-subtle)]" />
            </div>
            <p className="text-sm font-bold text-[var(--color-ink)] mb-1">No Recent Activity</p>
            <p className="text-xs text-[var(--color-ink-muted)] max-w-[240px] mx-auto leading-relaxed">
              System events and user actions will appear here as they occur.
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
