// src/components/client/[id]/ClientStatusBanner.tsx
"use client";

import { Clock, ShieldCheck } from "lucide-react";
import type { Client } from "@/lib/types";

interface ClientStatusBannerProps {
  client: Client;
  onManageVerification: () => void;
}

export default function ClientStatusBanner({
  client,
  onManageVerification,
}: ClientStatusBannerProps) {
  const isPending = client.status === "pending";
  const isUnderReview = client.verification_status === "under_review";
  const isRejected = client.verification_status === "rejected";

  if (!isPending && !isUnderReview && !isRejected) return null;

  return (
    <div
      className={`mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border ${
        isRejected
          ? "bg-rose-500/10 border-rose-500/20"
          : "bg-amber-500/10 border-amber-500/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isRejected ? "bg-rose-500/20" : "bg-amber-500/20"
          }`}
        >
          <Clock
            size={20}
            className={isRejected ? "text-rose-600" : "text-amber-600"}
          />
        </div>
        <div>
          <p
            className={`text-sm font-bold ${
              isRejected
                ? "text-rose-700 dark:text-rose-400"
                : "text-amber-700 dark:text-amber-400"
            }`}
          >
            {isRejected
              ? "Verification Rejected"
              : isUnderReview
                ? "Verification Submitted"
                : "Verification Pending"}
          </p>
          <p
            className={`text-xs mt-0.5 ${
              isRejected
                ? "text-rose-600/90 dark:text-rose-400/80"
                : "text-amber-600/90 dark:text-amber-400/80"
            }`}
          >
            {isRejected
              ? "This client's verification was rejected. Re-send the link to allow them to re-submit."
              : isUnderReview
                ? "The client has uploaded their selfie and documents. Review them to activate the account."
                : "This client is awaiting vetting. Send them a verification link to get started."}
          </p>
        </div>
      </div>
      <button
        onClick={onManageVerification}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-all ${
          isRejected
            ? "bg-rose-600 hover:bg-rose-700"
            : "bg-amber-600 hover:bg-amber-700"
        }`}
      >
        <ShieldCheck size={14} />
        {isRejected ? "Re-verify" : isUnderReview ? "Review Now" : "Manage"}
      </button>
    </div>
  );
}
