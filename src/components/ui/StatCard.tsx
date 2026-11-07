"use client";

import type { Icon } from "@phosphor-icons/react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: Icon;
  variant?: "default" | "accent" | "success" | "warning" | "danger";
  trend?: { value: string; isPositive: boolean };
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = "default",
  trend 
}: StatCardProps) {
  
  // ✅ Premium Color Mapping with Hover Glow
  const styles = {
    accent: { 
      bg: "bg-indigo-50 dark:bg-indigo-900/20", 
      text: "text-indigo-600 dark:text-indigo-400",
      glow: "bg-indigo-500"
    },
    success: { 
      bg: "bg-emerald-50 dark:bg-emerald-900/20", 
      text: "text-emerald-600 dark:text-emerald-400",
      glow: "bg-emerald-500"
    },
    warning: { 
      bg: "bg-amber-50 dark:bg-amber-900/20", 
      text: "text-amber-600 dark:text-amber-400",
      glow: "bg-amber-500"
    },
    danger: { 
      bg: "bg-rose-50 dark:bg-rose-900/20", 
      text: "text-rose-600 dark:text-rose-400",
      glow: "bg-rose-500"
    },
    default: { 
      bg: "bg-blue-50 dark:bg-blue-900/20", 
      text: "text-blue-600 dark:text-blue-400",
      glow: "bg-blue-500"
    },
  };

  const currentStyle = styles[variant] || styles.default;

  return (
    <div className="relative group bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600">
      
      {/* ✨ Billion-Dollar Hover Glow (Fades in on hover) */}
      <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${currentStyle.glow}`} />

      {/* Top Row: Title & Subtitle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </p>
        {subtitle && (
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {subtitle}
          </span>
        )}
      </div>

      {/* Bottom Row: Icon + Value + Trend (Compact & Horizontal) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icon Pill with micro-interaction (scales and rotates slightly) */}
          <div className={`p-2.5 rounded-xl ${currentStyle.bg} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            <Icon size={20} className={currentStyle.text} weight="regular" aria-hidden="true" />
          </div>
          
          {/* Value with tabular-nums for premium financial alignment */}
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">
            {value}
          </p>
        </div>

        {/* Trend Badge */}
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold shadow-sm ${
            trend.isPositive 
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
              : "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
          }`}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}
