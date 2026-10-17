// src/app/dashboard/fleet/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Pencil,
  Wrench,
  CheckCircle2,
  RotateCcw,
  Archive,
  Flag,
  MoreVertical,
} from "lucide-react";
import { useVehicleProfile } from "@/hooks/fleet/useVehicleProfile";
import ProfileLayout from "@/components/profile/ProfileLayout";
import VehicleSpecsCard from "@/components/fleet/VehicleSpecsCard";
import VehicleDocumentsCard from "@/components/fleet/VehicleDocumentsCard";
import SecureLightbox from "@/components/ui/SecureLightbox";
import type { VehicleStatus } from "@/lib/types";
import { useRef, useEffect } from "react";

/* ──────────────────────────────────────────────────────────────────────
   Status mapping for the hero pill
────────────────────────────────────────────────────────────────────── */

const STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "Available",
  rented: "Rented",
  maintenance: "In Maintenance",
  pending_activation: "Pending Activation",
  retired: "Retired",
};

const getHeroStatus = (status: VehicleStatus) => {
  if (status === "available" || status === "rented") return "active";
  if (status === "retired") return "suspended";
  return "pending";
};

/* ──────────────────────────────────────────────────────────────────────
   Compact Icon Action Group (matches Client/Investor pattern)
────────────────────────────────────────────────────────────────────── */

type ActionItem = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger" | "primary" | "success" | "warning";
  disabled?: boolean;
  hidden?: boolean;
  separator?: boolean;
};

function ProfileActionGroup({ actions }: { actions: ActionItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const visibleActions = actions.filter((a) => !a.hidden);

  // Split into "primary" (always visible as a labeled pill) and "overflow" (inside ⋮)
  const primaryAction = visibleActions.find((a) => a.tone === "primary" || a.tone === "success" || a.tone === "warning");
  const overflowActions = visibleActions.filter((a) => a !== primaryAction);

  return (
    <div className="flex items-center gap-2">
      {primaryAction && (
        <button
          type="button"
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 disabled:opacity-50 ${
            primaryAction.tone === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              : primaryAction.tone === "warning"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/20"
          }`}
        >
          <primaryAction.icon size={14} />
          {primaryAction.label}
        </button>
      )}

      {overflowActions.length > 0 && (
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-10 h-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95"
          >
            <MoreVertical size={18} />
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-lg)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="py-1">
                {overflowActions.map((action, i) => {
                  const Icon = action.icon;
                  const toneClass =
                    action.tone === "danger"
                      ? "text-rose-600 hover:bg-rose-500/10"
                      : action.tone === "primary"
                        ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                        : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]";
                  return (
                    <div key={action.label}>
                      {action.separator && i > 0 && <div className="h-px bg-[var(--color-surface-border)] my-1" />}
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          action.onClick();
                        }}
                        disabled={action.disabled}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold transition-colors disabled:opacity-40 ${toneClass}`}
                      >
                        <Icon size={14} className="shrink-0" />
                        <span className="flex-1 text-left">{action.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Page
────────────────────────────────────────────────────────────────────── */

export default function VehicleProfilePage() {
  const params = useParams();
  const vehicleId = Number(params?.id);

  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);

  const {
    vehicle,
    loading,
    isEditing,
    setIsEditing,
    actionLoading,
    handleUpdate,
    handleStatusAction,
  } = useVehicleProfile(vehicleId);

  if (loading || !vehicle) {
    return (
      <ProfileLayout
        title="Vehicle Profile"
        subtitle="Loading..."
        initials=".."
        status="pending"
        statusLabel="Loading"
        backHref="/dashboard/fleet"
        backLabel="Fleet"
        loading={true}
      >
        <div />
      </ProfileLayout>
    );
  }

  const heroStatus = vehicle.is_archived ? "suspended" : getHeroStatus(vehicle.status);
  const statusLabel = vehicle.is_archived ? "Archived" : STATUS_LABELS[vehicle.status];
  const initials = `${vehicle.make?.substring(0, 1) || ""}${vehicle.model?.substring(0, 1) || ""}`.toUpperCase();

  // ─── Build Actions ────────────────────────────────────────────────
  const actions: ActionItem[] = [];

  if (vehicle.is_archived) {
    actions.push({
      icon: RotateCcw,
      label: "Restore to Fleet",
      onClick: () => handleStatusAction("restore"),
      tone: "success",
      disabled: !!actionLoading,
    });
  } else {
    // Primary action (depends on state)
    if (vehicle.status === "pending_activation") {
      actions.push({
        icon: CheckCircle2,
        label: "Activate Vehicle",
        onClick: () => handleStatusAction("activate"),
        tone: "success",
        disabled: !!actionLoading,
      });
    } else if (vehicle.status === "maintenance") {
      actions.push({
        icon: RotateCcw,
        label: "Return to Fleet",
        onClick: () => handleStatusAction("reactivate"),
        tone: "success",
        disabled: !!actionLoading,
      });
    } else if (vehicle.status === "available") {
      actions.push({
        icon: Wrench,
        label: "Send to Garage",
        onClick: () => handleStatusAction("maintenance"),
        tone: "warning",
        disabled: !!actionLoading,
      });
    }

    // Overflow menu
    actions.push(
      {
        icon: Pencil,
        label: "Edit Details",
        onClick: () => setIsEditing(true),
        hidden: isEditing,
      },
      {
        icon: Flag,
        label: "Retire Vehicle",
        onClick: () => handleStatusAction("retire"),
        tone: "danger",
        disabled: !!actionLoading || vehicle.status === "retired",
        hidden: vehicle.status === "retired",
        separator: true,
      },
      {
        icon: Archive,
        label: "Archive Vehicle",
        onClick: () => handleStatusAction("archive"),
        tone: "danger",
        disabled: !!actionLoading,
        hidden: vehicle.status === "retired",
      }
    );
  }

  return (
    <>
      <ProfileLayout
        title={`${vehicle.make} ${vehicle.model}`}
        subtitle={`Plate ${vehicle.plate_number} · Model Year ${vehicle.year}`}
        initials={initials}
        status={heroStatus as "active" | "pending" | "suspended"}
        statusLabel={statusLabel}
        backHref="/dashboard/fleet"
        backLabel="Fleet"
        actionNode={<ProfileActionGroup actions={actions} />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Specs */}
          <div className="lg:col-span-7">
            <VehicleSpecsCard
              vehicle={vehicle}
              isEditing={isEditing}
              onSave={handleUpdate}
              onCancel={() => setIsEditing(false)}
              actionLoading={actionLoading}
            />
          </div>

          {/* Right: Documents (with SecureLightbox integration) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-6">
              <VehicleDocumentsCard
                vehicle={vehicle}
                onViewDocument={(url, label) => setLightbox({ src: url, label })}
              />
            </div>
          </div>
        </div>
      </ProfileLayout>

      {/* ── SECURE LIGHTBOX ────────────────────────────────────── */}
      <SecureLightbox
        url={lightbox?.src ?? null}
        title={lightbox?.label}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
