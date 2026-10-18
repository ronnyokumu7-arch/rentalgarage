"use client";

import { Calendar, FileText, Wrench, ShieldCheck, AlertCircle } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { formatMoney } from "@/lib/fleet/constants";

interface VehicleSpecsPanelProps {
  vehicle: Vehicle;
  onOpenDocument: (kind: "insurance" | "registration" | "inspection") => void;
}

const SPEC_ROWS = (v: Vehicle) => [
  { label: "Make", value: v.make },
  { label: "Model", value: v.model },
  { label: "Year", value: String(v.year) },
  { label: "Plate", value: v.plate_number, mono: true },
  { label: "VIN", value: v.vin || "—", mono: true },
  { label: "Daily Rate", value: formatMoney(v.daily_rate) },
  { label: "Current Mileage", value: `${v.current_mileage.toLocaleString()} km` },
  { label: "Next Service", value: v.next_service_km ? `${v.next_service_km.toLocaleString()} km` : "Not set" },
];

const DOCS = (v: Vehicle) => [
  {
    kind: "insurance" as const,
    label: "Insurance",
    hasFile: !!v.insurance_doc,
    meta: v.insurance_number ? `Policy ${v.insurance_number}` : "No policy number",
    expiry: v.insurance_expiry,
  },
  {
    kind: "registration" as const,
    label: "Registration",
    hasFile: !!v.registration_doc,
    meta: "Registration certificate",
    expiry: null,
  },
  {
    kind: "inspection" as const,
    label: "Inspection",
    hasFile: !!v.inspection_doc,
    meta: "Inspection report",
    expiry: null,
  },
];

export default function VehicleSpecsPanel({ vehicle, onOpenDocument }: VehicleSpecsPanelProps) {
  const rows = SPEC_ROWS(vehicle);
  const docs = DOCS(vehicle);

  return (
    <div className="space-y-4">
      {/* Specs */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-[var(--color-primary)]" />
          <h2 className="text-sm font-bold text-[var(--color-ink)] tracking-tight">Vehicle Specs</h2>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {rows.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                {row.label}
              </dt>
              <dd
                className={`text-xs sm:text-sm font-semibold text-[var(--color-ink)] mt-0.5 truncate ${
                  row.mono ? "font-mono" : ""
                }`}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Service History */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wrench size={16} className="text-amber-500" />
          <h2 className="text-sm font-bold text-[var(--color-ink)] tracking-tight">Service</h2>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Wrench size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {vehicle.next_service_km
                ? `Next service at ${vehicle.next_service_km.toLocaleString()} km`
                : "No service threshold set"}
            </p>
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">
              {vehicle.next_service_km
                ? `${(vehicle.next_service_km - vehicle.current_mileage).toLocaleString()} km remaining`
                : "Set a threshold from the actions menu"}
            </p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-[var(--color-primary)]" />
          <h2 className="text-sm font-bold text-[var(--color-ink)] tracking-tight">Documents</h2>
        </div>
        <div className="space-y-2">
          {docs.map((doc) => (
            <button
              key={doc.kind}
              onClick={() => onOpenDocument(doc.kind)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                doc.hasFile
                  ? "border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 hover:border-[var(--color-primary)]/40"
                  : "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  doc.hasFile
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-500"
                }`}
              >
                {doc.hasFile ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--color-ink)]">{doc.label}</p>
                <p className="text-[10px] text-[var(--color-ink-muted)] truncate">
                  {doc.hasFile ? doc.meta : "Missing — tap to upload"}
                </p>
              </div>
              <span className="text-[10px] font-bold text-[var(--color-primary)] flex-shrink-0">
                {doc.hasFile ? "View" : "Upload"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
