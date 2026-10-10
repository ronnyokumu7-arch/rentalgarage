// src/components/client/ReviewVerificationModal.tsx
"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, FileText, User, Eye } from "lucide-react";
import Modal from "@/components/ui/Modal";
import SecureImage from "@/components/ui/SecureImage";
import SecureLightbox from "@/components/ui/SecureLightbox";
import { clientsApi } from "@/lib/api/clients";
import { driversApi } from "@/lib/api/drivers";
import type { Client, Driver } from "@/lib/types";
import toast from "react-hot-toast";

interface ReviewVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: number;
  personType: "client" | "driver";
  onSuccess: () => void;
}

export default function ReviewVerificationModal({
  isOpen,
  onClose,
  personId,
  personType,
  onSuccess,
}: ReviewVerificationModalProps) {
  const [data, setData] = useState<Client | Driver | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [lightbox, setLightbox] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (isOpen && personId) {
      setLoading(true);
      const fetcher = personType === "client" 
        ? clientsApi.get(personId) 
        : driversApi.get(personId);
      
      fetcher
        .then(setData)
        .catch(() => toast.error("Failed to load verification details"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, personId, personType]);

  const handleSubmit = async () => {
    if (decision === "reject" && !rejectionNotes.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { 
        decision, 
        rejection_notes: decision === "reject" ? rejectionNotes : undefined 
      };
      
      if (personType === "client") {
        await clientsApi.reviewClient(personId, payload);
      } else {
        await driversApi.reviewDriver(personId, payload);
      }
      
      toast.success(`Verification ${decision}d successfully!`);
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setData(null);
    setDecision("approve");
    setRejectionNotes("");
    setLightbox(null);
    onClose();
  };

  if (!isOpen) return null;

  const entity = data as any; // Unified access for shared fields

  return (
    <Modal open={isOpen} onClose={handleClose} title="Review Verification" size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : !data ? (
        <div className="text-center py-12 text-[var(--color-ink-muted)]">
          Failed to load verification data.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-ink)]">{entity.full_name}</h3>
              <p className="text-sm text-[var(--color-ink-muted)]">
                {entity.phone} • {entity.email || "No email"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Documents */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
                <FileText size={16} className="text-[var(--color-primary)]" />
                Submitted Documents
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {entity.id_image_front && (
                  <DocViewer 
                    label="ID Front" 
                    url={entity.id_image_front} 
                    onOpen={() => setLightbox({ url: entity.id_image_front, title: "ID Front" })} 
                  />
                )}
                {entity.id_image_back && (
                  <DocViewer 
                    label="ID Back" 
                    url={entity.id_image_back} 
                    onOpen={() => setLightbox({ url: entity.id_image_back, title: "ID Back" })} 
                  />
                )}
                {entity.dl_image_front && (
                  <DocViewer 
                    label="DL Front" 
                    url={entity.dl_image_front} 
                    onOpen={() => setLightbox({ url: entity.dl_image_front, title: "DL Front" })} 
                  />
                )}
                {entity.dl_photo_key && (
                  <DocViewer 
                    label="DL Photo" 
                    url={entity.dl_photo_key} 
                    onOpen={() => setLightbox({ url: entity.dl_photo_key, title: "DL Photo" })} 
                  />
                )}
              </div>
            </div>

            {/* Right: Selfie & Decision */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
                <User size={16} className="text-[var(--color-primary)]" />
                Identity Selfie
              </h4>
              
              {entity.selfie_with_id_image || entity.selfie_with_id_key ? (
                <div 
                  className="relative aspect-[3/4] rounded-xl border border-[var(--color-surface-border)] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-black"
                  onClick={() => setLightbox({ url: entity.selfie_with_id_image || entity.selfie_with_id_key, title: "Identity Selfie" })}
                >
                  <SecureImage 
                    src={entity.selfie_with_id_image || entity.selfie_with_id_key} 
                    alt="Selfie with ID" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
                    <Eye size={12} /> Click to enlarge
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] rounded-xl border border-dashed border-[var(--color-surface-border)] flex flex-col items-center justify-center text-[var(--color-ink-muted)]">
                  <User size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">No selfie provided</p>
                </div>
              )}

              {/* Decision Form */}
              <div className="pt-4 border-t border-[var(--color-surface-border)] space-y-3">
                <h4 className="text-sm font-bold text-[var(--color-ink)]">Decision</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision("approve")}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                      decision === "approve"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-[var(--color-surface-border)] hover:border-emerald-500/50"
                    }`}
                  >
                    <CheckCircle size={18} />
                    <span className="font-bold">Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision("reject")}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                      decision === "reject"
                        ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                        : "border-[var(--color-surface-border)] hover:border-red-500/50"
                    }`}
                  >
                    <XCircle size={18} />
                    <span className="font-bold">Reject</span>
                  </button>
                </div>

                {decision === "reject" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-xs font-semibold text-[var(--color-ink-muted)]">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionNotes}
                      onChange={(e) => setRejectionNotes(e.target.value)}
                      placeholder="e.g., ID photo is blurry, name does not match..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-surface-border)]">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || (decision === "reject" && !rejectionNotes.trim())}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                decision === "approve" 
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20" 
                  : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
              }`}
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : decision === "approve" ? (
                <CheckCircle size={16} />
              ) : (
                <XCircle size={16} />
              )}
              {submitting ? "Processing..." : decision === "approve" ? "Approve & Activate" : "Reject & Request Retry"}
            </button>
          </div>
        </div>
      )}

      {/* Lightbox for viewing documents */}
      <SecureLightbox
        url={lightbox?.url ?? null}
        title={lightbox?.title ?? "Document"}
        onClose={() => setLightbox(null)}
      />
    </Modal>
  );
}

// Helper component for document slots
function DocViewer({ label, url, onOpen }: { label: string; url: string; onOpen: () => void }) {
  return (
    <div 
      className="aspect-square rounded-lg border border-[var(--color-surface-border)] overflow-hidden cursor-pointer hover:border-[var(--color-primary)] transition-colors bg-[var(--color-surface-hover)] relative group"
      onClick={onOpen}
    >
      <SecureImage 
        src={url} 
        alt={label} 
        className="w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white text-xs font-bold flex items-center gap-1">
          <Eye size={14} /> View
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-bold px-2 py-1 text-center">
        {label}
      </div>
    </div>
  );
}
