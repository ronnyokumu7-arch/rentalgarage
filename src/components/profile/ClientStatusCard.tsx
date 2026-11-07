"use client";

import { useState } from "react";
import { 
  Shield, CreditCard, CheckCircle as CheckCircle2, WarningCircle as AlertCircle,
  Clock, CircleNotch as Loader2, Prohibit as Ban, UserCheck
} from "@phosphor-icons/react/ssr";
import SectionCard from "@/components/ui/SectionCard";
import type { Client } from "@/lib/types";

interface ClientStatusCardProps {
  client: Client;
  onStatusAction: (action: "suspend" | "reactivate") => void;
}

export default function ClientStatusCard({ 
  client, 
  onStatusAction 
}: ClientStatusCardProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);

  // DL Health Logic
  const getDlHealth = () => {
    if (!client.dl_expiry) return { label: "Not Set", variant: "neutral", icon: Clock };
    
    const daysLeft = Math.ceil(
      (new Date(client.dl_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysLeft < 0) return { label: "Expired", variant: "danger", icon: AlertCircle };
    if (daysLeft < 30) return { label: `${daysLeft}d Left`, variant: "warning", icon: AlertCircle };
    return { label: "Valid", variant: "success", icon: CheckCircle2 };
  };

  const dlHealth = getDlHealth();

  // Action Config
  const getActionConfig = () => {
    switch (client.status) {
      case "pending":
        return { 
          label: "Verify Client", 
          badgeClass: "badge-success",
          action: "reactivate" as const,
          icon: UserCheck
        };
      case "active":
        return { 
          label: "Suspend Account", 
          badgeClass: "badge-warning",
          action: "suspend" as const,
          icon: Ban
        };
      case "suspended":
        return { 
          label: "Reactivate Client", 
          badgeClass: "badge-success",
          action: "reactivate" as const,
          icon: UserCheck
        };
      default:
        return { label: "Manage", badgeClass: "badge-neutral", action: null, icon: null };
    }
  };

  const actionConfig = getActionConfig();

  const handleButtonClick = async () => {
    if (!actionConfig.action) return;
    setIsActionLoading(true);
    try {
      await onStatusAction(actionConfig.action);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <SectionCard className="card p-0 overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-surface-hover/30">
        <div className="flex items-center gap-2.5">
          <Shield size={16} className="text-primary" aria-hidden="true" />
          <h3 className="text-ink font-semibold tracking-tight">
            Status & Compliance
          </h3>
        </div>
      </div>

      {/* Clean Content */}
      <div className="p-5 space-y-5">
        
        {/* Account Status Row */}
        <div className="flex items-center justify-between">
          <div>
            <span className="label mb-1">Account Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                client.status === 'active' ? 'bg-success' : 
                client.status === 'suspended' ? 'bg-warning' : 'bg-ink-subtle'
              }`} />
              <span className="text-ink font-semibold capitalize">
                {client.status === 'active' ? 'Verified' : client.status}
              </span>
            </div>
          </div>

          {/* ✅ Action Button: Added before:content-none to hide the stray dot */}
          {actionConfig.action && (
            <button
              onClick={handleButtonClick}
              disabled={isActionLoading}
              className={`badge before:content-none ${actionConfig.badgeClass} cursor-pointer transition-all hover:opacity-80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isActionLoading ? (
                <Loader2 size={12} className="animate-spin" aria-hidden="true" />
              ) : actionConfig.icon ? (
                <actionConfig.icon size={12} aria-hidden="true" />
              ) : null}
              <span>{isActionLoading ? "Processing..." : actionConfig.label}</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* DL Health Row */}
        <div className="flex items-center justify-between">
          <div>
            <span className="label mb-1">Driving License Expiry</span>
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-ink-subtle" aria-hidden="true" />
              <span className="text-ink font-medium">
                {client.dl_expiry 
                  ? new Date(client.dl_expiry).toLocaleDateString("en-GB") 
                  : "Not Provided"}
              </span>
            </div>
          </div>

          {/* ✅ DL Badge: before:content-none hides the dot */}
          <div className={`badge before:content-none ${
            dlHealth.variant === 'success' ? 'badge-success' :
            dlHealth.variant === 'warning' ? 'badge-warning' :
            dlHealth.variant === 'danger' ? 'badge-danger' :
            'badge-neutral'
          }`}>
            <dlHealth.icon size={12} aria-hidden="true" />
            <span>{dlHealth.label}</span>
          </div>
        </div>

      </div>
    </SectionCard>
  );
}
