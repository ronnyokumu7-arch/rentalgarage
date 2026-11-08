// src/components/client-profile/ClientProfileHeader.tsx
"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Edit3, Mail, Phone, MessageCircle, UserCheck, UserX, ShieldCheck } from "lucide-react";
import type { Client } from "@/lib/types";
import Badge from "@/components/ui/Badge";

interface ClientProfileHeaderProps {
  client: Client;
  onStatusAction?: () => void;
  actionLoading?: boolean;
}

export default function ClientProfileHeader({ client, onStatusAction, actionLoading }: ClientProfileHeaderProps) {
  const router = useRouter();

  // Determine button text and icon based on current status
  const getActionButtonDetails = () => {
    if (client.status === "active") {
      return { label: "Suspend", icon: UserX };
    }
    if (client.status === "pending") {
      return { label: "Verify", icon: ShieldCheck };
    }
    // suspended or inactive
    return { label: "Reactivate", icon: UserCheck };
  };

  const actionDetails = getActionButtonDetails();
  const ActionIcon = actionDetails.icon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-2">
      {/* Avatar - Left aligned */}
      <div className="relative flex-shrink-0 mt-1">
        {client.avatar_image ? (
          <Image
            src={client.avatar_image}
            alt={client.full_name}
            width={64}
            height={64}
            unoptimized
            className="w-16 h-16 rounded-xl object-cover border border-surface-border shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-surface-card border border-surface-border shadow-sm flex items-center justify-center text-xl font-bold text-ink">
            {client.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
        )}
        {/* Status Indicator */}
        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface flex items-center justify-center ${
          client.status === "active" ? "bg-success" : 
          client.status === "suspended" ? "bg-danger" : "bg-warning"
        }`}>
          {client.status === "active" && (
            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      </div>

      {/* Info & Actions - Right of Avatar */}
      <div className="flex flex-col gap-3">
        {/* Name Row */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-ink tracking-tight">{client.full_name}</h1>
          <Badge 
            variant={client.status === "active" ? "success" : client.status === "suspended" ? "danger" : "warning"} 
            size="xs"
          >
            {client.status.toUpperCase()}
          </Badge>
        </div>
        
        {/* Contact Details - Stacked */}
        <div className="flex flex-col gap-0.5">
          {client.email && (
            <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-accent-dark transition-colors w-fit">
              <Mail size={14} />
              <span>{client.email}</span>
            </a>
          )}
          <div className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Phone size={14} />
            <span>{client.phone}</span>
          </div>
        </div>

        {/* Action Buttons - Below Contact Details */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}`, '_blank')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-card text-ink text-xs font-medium hover:bg-surface-hover transition-colors border border-surface-border shadow-sm"
          >
            <MessageCircle size={14} />
            Message
          </button>

          {/* ✅ REPURPOSED ANALYTICS BUTTON (Exact same size/classes) */}
          <button
            onClick={onStatusAction}
            disabled={actionLoading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-card text-ink text-xs font-medium hover:bg-surface-hover transition-colors border border-surface-border shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ActionIcon size={14} />
            {actionLoading ? "Processing..." : actionDetails.label}
          </button>

          {/* Edit Button - Icon Only (Pencil) */}
          <button
            onClick={() => router.push(`/dashboard/clients/${client.id}/edit`)}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-card text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors border border-surface-border shadow-sm"
            title="Edit Profile"
          >
            <Edit3 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
