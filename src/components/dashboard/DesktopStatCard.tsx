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
  gradient: string;
  delay?: number;
}

export default function DesktopStatCard({
  label, value, subtext, icon: Icon, trend, gradient, delay = 0,
}: DesktopStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="group relative bg-surface rounded-2xl border border-surface-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
            <p className="text-2xl font-bold text-ink tracking-tight font-display">{value}</p>
            {subtext && <p className="text-xs text-ink-subtle">{subtext}</p>}
            {trend && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${trend.positive ? 'text-success' : 'text-danger'}`}>
                {trend.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trend.value}
                <span className="text-ink-muted font-normal">vs last month</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}>
            <Icon size={20} className="text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
