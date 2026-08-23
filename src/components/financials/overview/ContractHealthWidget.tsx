// src/components/financials/overview/ContractHealthWidget.tsx
"use client";

import { FileText, CheckCircle2, Send, PenLine, TrendingUp } from "lucide-react";
import type { ContractHealth } from "@/hooks/financials/useFinancialOverview";

interface Props {
  data: ContractHealth;
}

export default function ContractHealthWidget({ data }: Props) {
  // SVG Gauge Math - Properly sized
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke dasharray for each segment
  const signedOffset = circumference - ((data.signed_percentage / 100) * circumference);
  const draftOffset = circumference - ((data.draft_percentage / 100) * circumference);
  const sentOffset = circumference - ((data.sent_percentage / 100) * circumference);

  // Calculate rotation offsets to stack segments
  const signedRotation = 0;
  const draftRotation = (data.signed_percentage / 100) * 360;
  const sentRotation = ((data.signed_percentage + data.draft_percentage) / 100) * 360;

  // Determine health status
  const getHealthStatus = () => {
    if (data.signed_percentage >= 60) return { label: "Excellent", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (data.signed_percentage >= 40) return { label: "Good", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" };
    if (data.signed_percentage >= 20) return { label: "Fair", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
    return { label: "Needs Attention", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" };
  };

  const health = getHealthStatus();

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden h-full">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--color-surface-border)] bg-gradient-to-r from-[var(--color-primary)]/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-ink)]">Contract Health</h3>
              <p className="text-[10px] text-[var(--color-ink-muted)]">Active contract distribution</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-[8px] font-extrabold uppercase tracking-wider border ${health.bg} ${health.color}`}>
            {health.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          
          {/* Gauge - Properly sized with padding */}
          <div className="flex justify-center sm:flex-1">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50" cy="50" r={radius}
                  stroke="var(--color-surface-hover)"
                  strokeWidth="10"
                  fill="transparent"
                />
                
                {/* Signed segment (Green) */}
                {data.signed_percentage > 0 && (
                  <circle
                    cx="50" cy="50" r={radius}
                    stroke="var(--color-success-text)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={signedOffset}
                    strokeLinecap="round"
                    style={{ transform: `rotate(${signedRotation}deg)`, transformOrigin: 'center' }}
                    className="transition-all duration-1000 ease-out"
                  />
                )}
                
                {/* Draft segment (Yellow/Warning) */}
                {data.draft_percentage > 0 && (
                  <circle
                    cx="50" cy="50" r={radius}
                    stroke="var(--color-warning-text)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={draftOffset}
                    strokeLinecap="round"
                    style={{ transform: `rotate(${draftRotation}deg)`, transformOrigin: 'center' }}
                    className="transition-all duration-1000 ease-out"
                  />
                )}
                
                {/* Sent segment (Primary/Blue) */}
                {data.sent_percentage > 0 && (
                  <circle
                    cx="50" cy="50" r={radius}
                    stroke="var(--color-primary)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={sentOffset}
                    strokeLinecap="round"
                    style={{ transform: `rotate(${sentRotation}deg)`, transformOrigin: 'center' }}
                    className="transition-all duration-1000 ease-out"
                  />
                )}
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-[var(--color-ink)] tabular-nums">{data.total_active}</span>
                <span className="text-[8px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Active</span>
              </div>
            </div>
          </div>

          {/* Stats List - Compact rectangles */}
          <div className="flex-1 space-y-2 w-full">
            {/* Signed */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  <CheckCircle2 size={12} />
                </div>
                <span className="text-xs font-semibold text-[var(--color-ink)]">Signed</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">{data.signed_count}</span>
                <span className="text-[9px] font-medium text-[var(--color-ink-muted)]">({data.signed_percentage}%)</span>
              </div>
            </div>

            {/* Draft */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                  <PenLine size={12} />
                </div>
                <span className="text-xs font-semibold text-[var(--color-ink)]">Draft</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">{data.draft_count}</span>
                <span className="text-[9px] font-medium text-[var(--color-ink-muted)]">({data.draft_percentage}%)</span>
              </div>
            </div>

            {/* Sent */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <Send size={12} />
                </div>
                <span className="text-xs font-semibold text-[var(--color-ink)]">Sent</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">{data.sent_count}</span>
                <span className="text-[9px] font-medium text-[var(--color-ink-muted)]">({data.sent_percentage}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Trend Indicator */}
        <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-[10px] font-medium text-[var(--color-ink-muted)]">
              {data.signed_percentage >= 50 ? "Healthy contract pipeline" : "Improve contract closure"}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">
            {data.total_active} active
          </span>
        </div>
      </div>
    </div>
  );
}
