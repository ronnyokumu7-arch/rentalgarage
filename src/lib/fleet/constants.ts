import type { VehicleStatus } from "@/lib/types";

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  pending_activation: "Pending",
  available: "Available",
  rented: "Rented",
  maintenance: "Maintenance",
  retired: "Retired",
};

export const STATUS_DOT: Record<VehicleStatus, { color: string; pulse: boolean }> = {
  available: { color: "bg-emerald-500", pulse: false },
  pending_activation: { color: "bg-amber-500", pulse: false },
  rented: { color: "bg-emerald-500", pulse: false },
  maintenance: { color: "bg-amber-500", pulse: true },
  retired: { color: "bg-gray-400", pulse: false },
};

export const STATUS_TONE: Record<
  VehicleStatus,
  { text: string; bg: string; border: string }
> = {
  pending_activation: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  available: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  rented: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  maintenance: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  retired: {
    text: "text-[var(--color-ink-muted)]",
    bg: "bg-[var(--color-surface-hover)]",
    border: "border-[var(--color-surface-border)]",
  },
};

export function formatPlate(plate?: string | null): string {
  if (!plate) return "—";
  return plate.replace(/([A-Za-z])(\d)/, "$1 $2").toUpperCase();
}

export function formatMoney(amount: number | string | null | undefined, currency = "KES"): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!n && n !== 0) return `${currency} —`;
  return `${currency} ${Number(n).toLocaleString()}`;
}
