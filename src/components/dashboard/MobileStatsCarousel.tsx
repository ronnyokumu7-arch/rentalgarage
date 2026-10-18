// src/components/dashboard/MobileStatsCarousel.tsx
"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Wallet,
  CalendarRange,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface MobileStatsCarouselProps {
  thisWeekRevenue: number;
  lastWeekRevenue: number;
  weekOverWeekPercent: string;
  isWeekGrowth: boolean;

  mtdRevenue: number;
  lastMonthRevenue: number;
  monthOverMonthPercent: string;
  isPositiveGrowth: boolean;

  thisYearRevenue?: number | null;
  lastYearSamePeriodRevenue?: number | null;
  yearOverYearPercent?: string | null;
  isYearGrowth?: boolean;

  pendingPayments: number;

  commission: any;
}

export default function MobileStatsCarousel(props: MobileStatsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const cardWidth = 200;

  const {
    thisWeekRevenue = 0,
    weekOverWeekPercent = "0.0",
    isWeekGrowth = false,
    mtdRevenue = 0,
    monthOverMonthPercent = "0.0",
    isPositiveGrowth = false,
    thisYearRevenue = null,
    lastYearSamePeriodRevenue = null,
    yearOverYearPercent = null,
    isYearGrowth = false,
    pendingPayments = 0,
    commission = null,
  } = props;

  const statsData = [
    ...(pendingPayments > 0
      ? [{
          id: 'pending',
          label: 'Pending Payments',
          value: `KES ${pendingPayments.toLocaleString()}`,
          subtext: 'Follow up with clients',
          icon: AlertCircle,
          gradient: 'from-rose-500 to-red-600',
          href: '/dashboard/financials?tab=invoices',
        }]
      : []),
    {
      id: 'week',
      label: 'This Week',
      value: `KES ${thisWeekRevenue.toLocaleString()}`,
      subtext: 'Earnings this wk',
      trend: {
        value: `${isWeekGrowth ? '+' : ''}${weekOverWeekPercent}%`,
        positive: isWeekGrowth,
        icon: isWeekGrowth ? TrendingUp : TrendingDown,
        textColor: isWeekGrowth ? 'text-emerald-500' : 'text-rose-500',
      },
      icon: CalendarRange,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'month',
      label: 'This Month',
      value: `KES ${mtdRevenue.toLocaleString()}`,
      subtext: 'Earnings this mo',
      trend: {
        value: `${isPositiveGrowth ? '+' : ''}${monthOverMonthPercent}%`,
        positive: isPositiveGrowth,
        icon: isPositiveGrowth ? TrendingUp : TrendingDown,
        textColor: isPositiveGrowth ? 'text-emerald-500' : 'text-rose-500',
      },
      icon: TrendingUp,
      gradient: 'from-amber-500 to-orange-600',
    },
    ...(thisYearRevenue != null && lastYearSamePeriodRevenue != null && yearOverYearPercent != null
      ? [{
          id: 'year',
          label: 'This Year',
          value: `KES ${thisYearRevenue.toLocaleString()}`,
          subtext: 'Earnings this yr',
          trend: {
            value: `${isYearGrowth ? '+' : ''}${yearOverYearPercent}%`,
            positive: !!isYearGrowth,
            icon: isYearGrowth ? TrendingUp : TrendingDown,
            textColor: isYearGrowth ? 'text-emerald-500' : 'text-rose-500',
          },
          icon: Calendar,
          gradient: 'from-violet-500 to-purple-600',
        }]
      : []),
    ...(commission && commission.today_count > 0
      ? [{
          id: 'platform',
          label: 'Platform Fee',
          value: `KES ${parseFloat(commission.today_total).toLocaleString()}`,
          subtext: `${commission.today_count} trip${commission.today_count !== 1 ? 's' : ''} today`,
          icon: Wallet,
          gradient: 'from-blue-500 to-indigo-600',
        }]
      : []),
  ];

  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({ left: index * (cardWidth + 12), behavior: 'smooth' });
    setScrollIndex(index);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const newIndex = Math.round(containerRef.current.scrollLeft / (cardWidth + 12));
    if (newIndex !== scrollIndex && newIndex < statsData.length) {
      setScrollIndex(newIndex);
    }
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="flex items-stretch gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={handleScroll}
      >
        {statsData.map((item, index) => {
          const isLinked = 'href' in item && !!item.href;

          // ✅ Fixed h-[96px] container ensures every card is identical size
          const innerContent = (
            <div className={`w-full h-[96px] bg-surface rounded-xl border border-surface-border shadow-card p-3.5 flex flex-col justify-between transition-all duration-300 ${isLinked ? 'cursor-pointer hover:border-[var(--color-primary)]/40 group/card' : ''} ${scrollIndex === index ? 'ring-2 ring-primary/20 shadow-glow' : ''}`}>
              
              {/* Top Section: Label, Value, Trend */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-ink-muted truncate">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold text-ink tracking-tight font-display truncate">
                      {item.value}
                    </p>

                    <div className="flex items-center gap-1.5 min-w-0">
                      {item.trend && (
                        <span className={`flex items-center gap-0.5 text-[9px] font-bold shrink-0 ${item.trend.textColor}`}>
                          <item.trend.icon size={10} strokeWidth={2.5} />
                          {item.trend.value}
                        </span>
                      )}
                      {item.subtext && (
                        <span className={`text-[7px] truncate ${isLinked ? 'text-ink-subtle group-hover/card:text-ink-muted' : 'text-ink-subtle'}`}>
                          {item.subtext}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 shadow-sm mt-0.5`}>
                    <item.icon size={12} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Bottom Section: Dots + CTA */}
              <div className="flex items-center justify-between h-4">
                <div className="flex items-center gap-1">
                  {statsData.map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToIndex(dotIndex);
                      }}
                    >
                      <div className={`transition-all duration-300 rounded-full ${dotIndex === scrollIndex ? 'w-4 h-1 bg-primary' : 'w-1 h-1 bg-ink-faint/40 hover:bg-ink-muted'}`} />
                    </button>
                  ))}
                </div>
                {isLinked && (
                  <span className="text-[9px] font-bold text-[var(--color-primary)] flex items-center gap-0.5 opacity-80 group-hover/card:opacity-100 group-hover/card:translate-x-0.5 transition-all leading-none">
                    View <ChevronRight size={10} />
                  </span>
                )}
              </div>
            </div>
          );

          return (
            <motion.div
              key={item.id}
              className="snap-start flex-shrink-0 flex"
              style={{ width: cardWidth }}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {isLinked ? (
                <Link href={(item as any).href} className="w-full h-full">
                  {innerContent}
                </Link>
              ) : (
                <div className="w-full h-full">{innerContent}</div>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-surface to-transparent pointer-events-none" />
    </div>
  );
}
