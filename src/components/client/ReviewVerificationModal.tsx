"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, CheckCircle, XCircle, Loader2, Eye, FileText, Car, CreditCard } from "lucide-react";
import Modal from "@/components/ui/Modal";
import SecureImage from "@/components/ui/SecureImage";
import SecureLightbox from "@/components/ui/SecureLightbox";
import { clientsApi } from "@/lib/api/clients";
import { driversApi } from "@/lib/api/drivers";
import toast from "react-hot-toast";

interface ReviewVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: number;
  personType: "client" | "driver";
  onSuccess?: () => void;
}

export default function ReviewVerificationModal({
  isOpen,
  onClose,
  personId,
  personType,
  onSuccess,
}: ReviewVerificationModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [person, setPerson] = useState<any>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && personId) {
      loadPersonData();
    }
  }, [isOpen, personId]);

  const loadPersonData = async () => {
    setLoading(true);
    try {
      const data = personType === "client" 
        ? await clientsApi.get(personId)
        : await driversApi.get(personId);
      setPerson(data);
    } catch (error) {
      console.error("Failed to load verification details:", error);
      toast.error("Failed to load verification details");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision: "approve" | "reject", rejectionNotes?: string) => {
    setSubmitting(true);
    try {
      if (personType === "client") {
        await clientsApi.reviewClient(personId, { decision, rejection_notes: rejectionNotes });
      } else {
        await driversApi.reviewDriver(personId, { decision, rejection_notes: rejectionNotes });
      }
      
      toast.success(`Verification ${decision}d successfully`);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${decision} verification`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
  };

  const handleCloseLightbox = () => {
    setLightboxImage(null);
  };

  if (!person && loading) {
    return (
      <Modal open={isOpen} onClose={onClose} title="Review Verification" size="lg">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
        </div>
      </Modal>
    );
  }

  if (!person) return null;

  // Check if ANY documents exist
  const hasAnyDocuments = !!(
    person.id_image_front || 
    person.id_image_back || 
    person.dl_image_front || 
    person.selfie_with_id_image
  );

  return (
    <>
      <Modal open={isOpen && !lightboxImage} onClose={onClose} title="Review Verification" size="lg">
        <div className="space-y-6">
          {/* Person Info */}
          <div className="p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                <User size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--color-ink)]">{person.full_name}</h3>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-[var(--color-ink-muted)]">
                  {person.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={12} />
                      {person.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Phone size={12} />
                    {person.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          {!hasAnyDocuments ? (
            <div className="p-8 text-center rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
              <FileText size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-3" />
              <p className="text-sm text-[var(--color-ink-muted)]">No documents or selfie uploaded for verification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID Documents - Side by Side Thumbnails */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
                  <FileText size={16} className="text-[var(--color-primary)]" />
                  Submitted Documents
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  {person.id_image_front && (
                    <button
                      onClick={() => handleOpenLightbox(person.id_image_front)}
                      className="group relative aspect-[4/3] rounded-lg bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)] transition-all overflow-hidden"
                      title="Click to view ID Front"
                    >
                      <SecureImage
                        src={person.id_image_front}
                        alt="ID Front"
                        className="w-full h-full object-cover"
                        fallback={
                          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-subtle)] p-2">
                            <CreditCard size={20} className="mb-1" />
                            <p className="text-[9px] text-center">ID Front</p>
                          </div>
                        }
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye size={20} className="text-white" />
                      </div>
                    </button>
                  )}

                  {person.id_image_back && (
                    <button
                      onClick={() => handleOpenLightbox(person.id_image_back)}
                      className="group relative aspect-[4/3] rounded-lg bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)] transition-all overflow-hidden"
                      title="Click to view ID Back"
                    >
                      <SecureImage
                        src={person.id_image_back}
                        alt="ID Back"
                        className="w-full h-full object-cover"
                        fallback={
                          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-subtle)] p-2">
                            <CreditCard size={20} className="mb-1" />
                            <p className="text-[9px] text-center">ID Back</p>
                          </div>
                        }
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye size={20} className="text-white" />
                      </div>
                    </button>
                  )}

                  {person.dl_image_front && (
                    <button
                      onClick={() => handleOpenLightbox(person.dl_image_front)}
                      className="group relative aspect-[4/3] rounded-lg bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)] transition-all overflow-hidden col-span-2"
                      title="Click to view Driver's License"
                    >
                      <SecureImage
                        src={person.dl_image_front}
                        alt="Driver's License"
                        className="w-full h-full object-cover"
                        fallback={
                          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-subtle)] p-2">
                            <Car size={20} className="mb-1" />
                            <p className="text-[9px] text-center">Driver's License</p>
                          </div>
                        }
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye size={20} className="text-white" />
                      </div>
                    </button>
                  )}

                  {!person.id_image_front && !person.id_image_back && !person.dl_image_front && (
                    <div className="col-span-2 p-4 text-center rounded-lg bg-[var(--color-surface-hover)] border border-dashed border-[var(--color-surface-border)]">
                      <p className="text-xs text-[var(--color-ink-muted)] italic">No ID documents uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selfie - Full Height */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
                  <User size={16} className="text-[var(--color-primary)]" />
                  Identity Selfie
                </h4>
                
                {person.selfie_with_id_image ? (
                  <button
                    onClick={() => handleOpenLightbox(person.selfie_with_id_image)}
                    className="group relative w-full aspect-[3/4] rounded-xl bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)] transition-all overflow-hidden"
                    title="Click to view selfie"
                  >
                    <SecureImage
                      src={person.selfie_with_id_image}
                      alt="Identity Selfie"
                      className="w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-subtle)] p-4">
                          <User size={32} className="mb-2" />
                          <p className="text-xs text-center">Click to view selfie</p>
                        </div>
                      }
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye size={24} className="text-white" />
                    </div>
                  </button>
                ) : (
                  <div className="w-full aspect-[3/4] rounded-xl bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] flex items-center justify-center">
                    <div className="text-center text-[var(--color-ink-subtle)] p-4">
                      <User size={32} className="mx-auto mb-2" />
                      <p className="text-sm">No selfie uploaded</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Decision Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[var(--color-surface-border)]">
            <button
              onClick={() => handleDecision("approve")}
              disabled={submitting || !hasAnyDocuments}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Approve
            </button>
            <button
              onClick={() => {
                const notes = prompt("Enter rejection reason (optional):");
                if (notes !== null) {
                  handleDecision("reject", notes || undefined);
                }
              }}
              disabled={submitting || !hasAnyDocuments}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
              Reject
            </button>
          </div>
        </div>
      </Modal>

      <SecureLightbox
        url={lightboxImage}
        title="Document Preview"
        onClose={handleCloseLightbox}
      />
    </>
  );
}
