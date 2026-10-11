// src/components/dashboard/mobile-carousel/MobilePromoSlide.tsx
"use client";

import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────────────── */

export interface Promo {
  id: string;
  eyebrow: string;
  headline: string;
  subline: string;
  ctaLabel: string;
  ctaHref: string;
}

interface MobilePromoSlideProps {
  promo: Promo;
}

/* ──────────────────────────────────────────────────────────────────────
   v1 promo config — hardcoded. Swap for endpoint later.
   Dismissal state is owned by the orchestrator, not this slide.
────────────────────────────────────────────────────────────────────── */

export const PROMOS: Promo[] = [
  {
    id: "pro-plan",
    eyebrow: "Upgrade",
    headline: "Unlock Pro features",
    subline: "Advanced analytics, priority support, unlimited fleet.",
    ctaLabel: "Explore Pro",
    ctaHref: "/settings/billing",
  },
  {
    id: "airport-transfer",
    eyebrow: "New feature",
    headline: "Airport transfers are live",
    subline: "Book premium airport runs with dedicated pricing.",
    ctaLabel: "Try it",
    ctaHref: "/dashboard/bookings/new",
  },
];

export const PROMO_DISMISS_KEY_PREFIX = "carousel_promo_dismissed_";

/* ──────────────────────────────────────────────────────────────────────
   Slide
────────────────────────────────────────────────────────────────────── */

export default function MobilePromoSlide({ promo }: MobilePromoSlideProps) {
  return (
    <div className="p-4">
      <div className="space-y-2 pr-16">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            {promo.eyebrow}
          </span>
        </div>

        <p className="text-sm font-bold text-ink font-display tracking-tight leading-snug">
          {promo.headline}
        </p>
        <p className="text-xs text-ink-muted leading-relaxed">
          {promo.subline}
        </p>
      </div>

      <Link
        href={promo.ctaHref}
        className="mt-3 inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity"
      >
        {promo.ctaLabel}
        <ArrowUpRight size={12} />
      </Link>
    </div>
  );
}
