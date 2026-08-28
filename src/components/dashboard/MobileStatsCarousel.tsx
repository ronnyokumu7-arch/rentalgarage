// src/components/dashboard/MobileStatsCarousel.tsx
"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertCircle, Wallet } from "lucide-react";

interface MobileStatsCarouselProps {
  mtdRevenue: number;
  lastMonthRevenue: number;
  monthOverMonthPercent: string;
  isPositiveGrowth: boolean;
  pendingPayments: number;
  commission: any;
}

export default function MobileStatsCarousel({
  mtdRevenue, lastMonthRevenue, monthOverMonthPercent, isPositiveGrowth, pendingPayments, commission,
}: MobileStatsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const cardWidth = 200;

  const statsData = [
    {
      id: 'month',
      label: 'This Month',
      value: `KES ${mtdRevenue.toLocaleString()}`,
      subtext: `Last month: KES ${lastMonthRevenue.toLocaleString()}`,
      icon: TrendingUp,
      gradient: 'from-amber-500 to-orange-600',
      trend: { 
        value: `${isPositiveGrowth ? '+' : ''}${monthOverMonthPercent}%`, 
        positive: isPositiveGrowth,
        icon: isPositiveGrowth ? TrendingUp : TrendingDown,
        textColor: isPositiveGrowth ? 'text-emerald-500' : 'text-rose-500'
      }
    },
    {
      id: 'pending',
      label: 'Pending',
      value: `KES ${pendingPayments.toLocaleString()}`,
      subtext: 'Awaiting collection',
      icon: AlertCircle,
      gradient: 'from-rose-500 to-red-600',
    },
    {
      id: 'platform',
      label: 'Platform Fee',
      value: commission ? `KES ${parseFloat(commission.today_total).toLocaleString()}` : "—",
      subtext: commission ? `${commission.today_count} trip${commission.today_count !== 1 ? 's' : ''} today` : "Loading...",
      icon: Wallet,
      gradient: 'from-blue-500 to-indigo-600',
    },
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
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={handleScroll}
      >
        {statsData.map((item, index) => (
          <motion.div 
            key={item.id} 
            className="snap-start flex-shrink-0" 
            style={{ width: cardWidth }}
            initial={{ opacity: 0, x: 15 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={`bg-surface rounded-xl border border-surface-border shadow-card p-4 h-[105px] flex flex-col justify-between transition-all duration-300 ${scrollIndex === index ? 'ring-2 ring-primary/20 shadow-glow' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-ink-muted truncate">{item.label}</p>
                  <p className="text-sm font-bold text-ink tracking-tight font-display truncate">{item.value}</p>
                  {item.subtext && <p className="text-[7px] text-ink-subtle truncate">{item.subtext}</p>}
                  
                  {/* ✅ PREMIUM TREND INDICATOR */}
                  {item.trend && (
                    <div className={`flex items-center gap-0.5 text-[9px] font-bold ${item.trend.textColor}`}>
                      <item.trend.icon size={10} strokeWidth={2.5} />
                      {item.trend.value}
                    </div>
                  )}
                </div>
                
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                  <item.icon size={14} className="text-white" />
                </div>
              </div>

              <div className="flex items-center gap-1">
                {statsData.map((_, dotIndex) => (
                  <button key={dotIndex} onClick={() => scrollToIndex(dotIndex)}>
                    <div className={`transition-all duration-300 rounded-full ${dotIndex === scrollIndex ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-ink-faint/40 hover:bg-ink-muted'}`} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-surface to-transparent pointer-events-none" />
    </div>
  );
}
