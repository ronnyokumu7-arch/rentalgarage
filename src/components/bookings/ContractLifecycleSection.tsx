// src/components/bookings/ContractLifecycleSection.tsx
"use client";

import { FileText, Mail, CheckCircle2, Copy, Share2 } from "lucide-react";
import type { Contract } from "@/lib/types";
import Badge from "@/components/ui/Badge";

interface ContractLifecycleSectionProps {
  contract: Contract | null;
  onCopyLink: () => void;
  onShare: () => void;
}

export default function ContractLifecycleSection({ contract, onCopyLink, onShare }: ContractLifecycleSectionProps) {
  
  if (!contract) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <FileText size={32} className="text-ink-subtle mb-3" />
        <h3 className="text-sm font-bold text-ink">No Contract Generated</h3>
        <p className="text-xs text-ink-muted mt-1">A contract will be auto-generated once the booking is confirmed.</p>
      </div>
    );
  }

  const isDraft = contract.status === "draft";
  const isSent = contract.status === "sent";
  const isSigned = contract.status === "signed";

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-accent-dark" />
          <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Contract Lifecycle</h3>
        </div>
        <Badge variant={isSigned ? "success" : isSent ? "accent" : "neutral"} dot>
          {contract.status.toUpperCase()}
        </Badge>
      </div>

      {/* Timeline */}
      <div className="relative pl-8 space-y-6 mb-6">
        {/* Vertical Line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-surface-border" />

        {/* Node 1: Generated */}
        <div className="relative flex items-start gap-3">
          <div className={`absolute -left-8 w-6 h-6 rounded-full border-2 border-surface-card flex items-center justify-center z-10 ${isDraft ? 'bg-surface-hover' : 'bg-success'}`}>
            <FileText size={12} className={isDraft ? 'text-ink-muted' : 'text-white'} />
          </div>
          <div>
            <p className={`text-sm font-bold ${isDraft ? 'text-ink-muted' : 'text-ink'}`}>Generated</p>
            <p className="text-xs text-ink-muted mt-0.5">Created on {new Date(contract.created_at).toLocaleString()}</p>
          </div>
        </div>

        {/* Node 2: Sent */}
        <div className="relative flex items-start gap-3">
          <div className={`absolute -left-8 w-6 h-6 rounded-full border-2 border-surface-card flex items-center justify-center z-10 ${
            isDraft ? 'bg-surface-hover' : isSent ? 'bg-accent-dark' : 'bg-success'
          }`}>
            <Mail size={12} className={isDraft ? 'text-ink-muted' : 'text-white'} />
          </div>
          <div>
            <p className={`text-sm font-bold ${isDraft ? 'text-ink-muted' : 'text-ink'}`}>Sent to Client</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {!isDraft ? `Delivered on ${new Date(contract.updated_at).toLocaleString()}` : 'Awaiting delivery...'}
            </p>
          </div>
        </div>

        {/* Node 3: Signed */}
        <div className="relative flex items-start gap-3">
          <div className={`absolute -left-8 w-6 h-6 rounded-full border-2 border-surface-card flex items-center justify-center z-10 ${
            isSigned ? 'bg-success' : 'bg-surface-hover'
          }`}>
            <CheckCircle2 size={12} className={isSigned ? 'text-white' : 'text-ink-muted'} />
          </div>
          <div>
            <p className={`text-sm font-bold ${isSigned ? 'text-ink' : 'text-ink-muted'}`}>Signed & Executed</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {isSigned ? `Signed on ${new Date(contract.signed_at || contract.updated_at).toLocaleString()}` : 'Pending client signature'}
            </p>
          </div>
        </div>
      </div>

      {/* Contract Details & Actions */}
      <div className="pt-4 border-t border-surface-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] uppercase text-ink-subtle font-bold">Contract ID</p>
            <p className="text-xs font-mono font-bold text-ink">{contract.contract_number}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={onCopyLink} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-ink bg-surface-hover border border-surface-border rounded-lg hover:bg-surface-border transition-colors">
            <Copy size={12} /> Copy Link
          </button>
          <button onClick={onShare} disabled={isSigned} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-white bg-accent-dark rounded-lg hover:bg-accent-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Share2 size={12} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
