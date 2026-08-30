"use client";

import { useState } from "react";
import { Car, UserCircle, Heart, Info, ChevronDown, Plane, Building2, Map } from 'lucide-react';
import { labelClass } from "./constants";
import type { ServiceType, ServiceDefinition } from '@/lib/types';

// ✅ MILESTONE 1.1: Premium catalog-driven Service Selector
// Segmented control (Self Drive | Chauffeur) + INLINE expanding sub-service panel.
// Inline = mobile-safe: full width, no absolute dropdowns, zero truncation at 360px.
export default function ServiceTypeSelector({
  value,
  onChange,
  services,
}: {
  value: ServiceType;
  onChange: (type: ServiceType) => void;
  services: ServiceDefinition[];
}) {
  const [chauffeurOpen, setChauffeurOpen] = useState(false);

  const selectedService = services.find((s) => s.key === value);
  const chauffeurServices = services.filter((s) => s.category === "chauffeur");
  const isChauffeur = !!selectedService?.category && selectedService.category === "chauffeur";

  const getIcon = (key: ServiceType) => {
    if (key === "selfdrive") return Car;
    if (key === "wedding") return Heart;
    if (key === "corporate") return Building2;
    if (key === "airport_transfer") return Plane;
    if (key === "city_excursion") return Map;
    return UserCircle; // pro_driver, hourly, taxi
  };

  const chauffeurShortLabel = () => {
    if (!isChauffeur || !selectedService) return "Chauffeur";
    return selectedService.display_name.replace("Chauffeur · ", "");
  };

  return (
    <div>
      <label className={labelClass}>
        Service Type <span className="text-[var(--color-danger)]">*</span>
      </label>

      {/* ✅ Premium segmented control */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] p-1">
        <button
          type="button"
          onClick={() => { onChange("selfdrive"); setChauffeurOpen(false); }}
          className={`flex items-center justify-center gap-1.5 px-1 py-2.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all active:scale-[0.98] ${
            !isChauffeur
              ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]/25"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          <Car size={14} />
          Self Drive
        </button>

        <button
          type="button"
          onClick={() => setChauffeurOpen((o) => !o)}
          aria-expanded={chauffeurOpen}
          className={`flex items-center justify-center gap-1.5 px-1 py-2.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all active:scale-[0.98] ${
            isChauffeur
              ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]/25"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          <UserCircle size={14} />
          {chauffeurShortLabel()}
          <ChevronDown
            size={12}
            className={`transition-transform ${chauffeurOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* ✅ Inline expanding panel — full width, thumb-friendly, never truncates */}
      {chauffeurOpen && (
        <div className="mt-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-1 space-y-1">
          {chauffeurServices.map((svc) => {
            const Icon = getIcon(svc.key);
            const active = value === svc.key;
            return (
              <button
                key={svc.key}
                type="button"
                disabled={!svc.is_live}
                onClick={() => { onChange(svc.key); setChauffeurOpen(false); }}
                className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  active
                    ? "bg-[var(--color-primary)]/10"
                    : svc.is_live
                    ? "hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-hover)]"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <Icon
                  size={16}
                  className={`shrink-0 mt-0.5 ${active ? "text-[var(--color-primary)]" : "text-[var(--color-ink-muted)]"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold ${active ? "text-[var(--color-primary)]" : "text-[var(--color-ink)]"}`}>
                      {svc.display_name}
                    </span>
                    {!svc.is_live && (
                      <span className="text-[8px] font-bold uppercase tracking-wide bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] px-1.5 py-0.5 rounded whitespace-nowrap">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">
                    {svc.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Dynamic caption — one line, updates with selection */}
      {selectedService && (
        <p className="mt-2 flex items-start gap-1.5 text-[10px] text-[var(--color-ink-muted)]">
          <Info size={11} className="text-[var(--color-primary)] shrink-0 mt-[1px]" />
          {selectedService.description}
        </p>
      )}
    </div>
  );
}
