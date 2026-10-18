// src/components/dashboard/MobileDashboardCards.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Landmark } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
   Mobile Hero Earnings — hero number, label, subtitle, trend.
   Props override the defaults so it can display "This Year (YTD)" or
   "Total Revenue" depending on context.
────────────────────────────────────────────────────────────────────── */

interface MobileHeroEarningsProps {
  value: string;
  label?: string;
  subtitle?: string;
  change?: { value: string; positive: boolean };
  changeLabel?: string;
}

export function MobileHeroEarnings({
  value,
  label = "Total Revenue",
  subtitle = "Lifetime earnings",
  change,
  changeLabel = "vs last month",
}: MobileHeroEarningsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="pt-1 pb-3"
    >
      <div className="flex items-center gap-2 mb-0.5">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Landmark size={13} className="text-white" />
        </div>
        <p className="text-[10px] font-medium text-ink-muted uppercase tracking-wider">
          {label}
        </p>
      </div>

      {/* ✅ PREMIUM GRADIENT TEXT (unchanged) */}
      <p className="text-3xl font-bold tracking-tight font-display mt-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 bg-clip-text text-transparent">
        {value}
      </p>

      <div className="flex items-center gap-3 mt-0.5">
        <p className="text-[11px] text-ink-subtle">{subtitle}</p>
        {change && (
          <div
            className={`flex items-center gap-0.5 text-[10px] font-semibold ${
              change.positive ? "text-success" : "text-danger"
            }`}
          >
            <ArrowUpRight size={12} />
            {change.value}
            <span className="text-ink-muted font-normal">{changeLabel}</span>
          </div>
        )}
      </div>
      <div className="mt-2.5 h-px bg-surface-border/60" />
    </motion.div>
  );
}
