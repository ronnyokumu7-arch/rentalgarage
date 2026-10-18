// src/components/dashboard/DesktopStatCard.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DesktopStatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  trendLabel?: string;
  gradient: string;
  delay?: number;
  size?: "md" | "lg"; // ✅ Added size prop
}

export default function DesktopStatCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  trendLabel = "vs last month",
  gradient,
  delay = 0,
  size = "md",
}: DesktopStatCardProps) {
  const isLarge = size === "lg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`group relative bg-surface rounded-2xl border border-surface-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden ${
        isLarge ? "h-[120px]" : "h-[120px]"
      }`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className={`p-5 h-full flex flex-col justify-between`}>
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className={`font-bold uppercase tracking-wider text-ink-muted ${isLarge ? "text-[11px]" : "text-[10px]"}`}>
              {label}
            </p>
            <p className={`font-bold text-ink tracking-tight font-display truncate ${isLarge ? "text-2xl" : "text-xl"}`}>
              {value}
            </p>
            {subtext && <p className="text-xs text-ink-subtle truncate">{subtext}</p>}
          </div>
          <div className={`rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity ${isLarge ? "w-12 h-12" : "w-10 h-10"}`}>
            <Icon size={isLarge ? 20 : 16} className="text-white" />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend.positive ? 'text-success' : 'text-danger'} mt-1`}>
            {trend.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend.value}
            <span className="text-ink-muted font-normal">{trendLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
