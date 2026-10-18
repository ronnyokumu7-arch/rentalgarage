// src/components/dashboard/mobile-carousel/MobileCarouselCard.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pin } from "lucide-react";

import MobileFleetStatusSlide, {
  type CarouselVehicle,
} from "./MobileFleetStatusSlide";
import MobileAlertsSlide from "./MobileAlertsSlide";
import MobilePromoSlide, {
  PROMOS,
  PROMO_DISMISS_KEY_PREFIX,
  type Promo,
} from "./MobilePromoSlide";
import type { NeedsAttentionData } from "@/hooks/dashboard/useNeedsAttention";

// ✅ Increased to 6s for better readability
const ROTATION_INTERVAL_MS = 6000;

type SlideKey = "alerts" | "fleet" | "promo";

interface MobileCarouselCardProps {
  vehicles: CarouselVehicle[];
  alerts: NeedsAttentionData;
}

export default function MobileCarouselCard({
  vehicles,
  alerts,
}: MobileCarouselCardProps) {
  const hasAlerts = alerts.totalCount > 0;

  const [dismissedPromoIds, setDismissedPromoIds] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = PROMOS.filter(
      (p) => sessionStorage.getItem(PROMO_DISMISS_KEY_PREFIX + p.id) === "1"
    ).map((p) => p.id);
    setDismissedPromoIds(dismissed);
  }, []);

  const activePromos: Promo[] = PROMOS.filter(
    (p) => !dismissedPromoIds.includes(p.id)
  );

  const slides: SlideKey[] = [];
  if (hasAlerts) slides.push("alerts");
  slides.push("fleet");
  if (activePromos.length > 0) slides.push("promo");

  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [touched, setTouched] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // ✅ Removed auto-pinning default. Starts unpinned.
  const [pinned, setPinned] = useState(false);

  // One-shot hint pulse
  const [hintPulse, setHintPulse] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setHintPulse(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (pinned) return;
    if (hovered) return;
    if (touched) return;
    if (reducedMotion) return;
    
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(t);
  }, [slides.length, pinned, hovered, touched, reducedMotion]);

  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= slides.length) return;
      setIndex(i);
    },
    [slides.length]
  );

  const activeSlide = slides[index];

  const handleDismissPromo = (promoId: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(PROMO_DISMISS_KEY_PREFIX + promoId, "1");
    }
    setDismissedPromoIds((ids) => [...ids, promoId]);
    setIndex((i) => (i > 0 ? i - 1 : 0));
  };

  const togglePin = () => setPinned((p) => !p);

  if (slides.length === 1 && activeSlide === "fleet") {
    return (
      <div className="bg-surface rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <MobileFleetStatusSlide vehicles={vehicles} />
      </div>
    );
  }

  const showPromoX = activeSlide === "promo" && activePromos[0];

  return (
    <div
      className="bg-surface rounded-2xl border border-surface-border shadow-card overflow-hidden flex flex-col relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setTouched(true)}
      onTouchEnd={() => window.setTimeout(() => setTouched(false), 3000)}
    >
      {/* ── Control cluster: dots + dismiss + pin (Absolute Top Right) ── */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {/* Dots */}
        {slides.length > 1 && (
          <div className="flex items-center gap-1 mr-1">
            {slides.map((key, i) => (
              <button
                key={key}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`
                  transition-all duration-300 rounded-full
                  ${i === index
                    ? "w-4 h-1.5 bg-primary"
                    : "w-1.5 h-1.5 bg-ink-faint/40 hover:bg-ink-muted"}
                  ${hintPulse && i !== index ? "animate-pulse" : ""}
                `}
              />
            ))}
          </div>
        )}

        {showPromoX && (
          <button
            onClick={() => handleDismissPromo(activePromos[0].id)}
            aria-label="Dismiss promo"
            className="p-1.5 rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors bg-surface/50 backdrop-blur-sm"
          >
            <X size={14} />
          </button>
        )}

        <button
          onClick={togglePin}
          aria-label={pinned ? "Unpin slide" : "Pin this slide"}
          className={`p-1.5 rounded-lg transition-all bg-surface/50 backdrop-blur-sm ${
            pinned
              ? "text-primary bg-primary/10 hover:bg-primary/15"
              : "text-ink-muted hover:bg-surface-hover hover:text-ink"
          }`}
        >
          <Pin
            size={14}
            strokeWidth={2}
            className={pinned ? "fill-primary/30 rotate-45" : "rotate-45"}
          />
        </button>
      </div>

      {/* Slide viewport — No extra top padding needed, content handles it */}
      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSlide}
            initial={reducedMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, x: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) goTo(index + 1);
              else if (info.offset.x > 60) goTo(index - 1);
            }}
          >
            {activeSlide === "fleet" && (
              <MobileFleetStatusSlide vehicles={vehicles} />
            )}
            {activeSlide === "alerts" && <MobileAlertsSlide alerts={alerts} />}
            {activeSlide === "promo" && activePromos[0] && (
              <MobilePromoSlide promo={activePromos[0]} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
