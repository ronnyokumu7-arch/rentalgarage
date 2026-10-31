"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  FileText,
  Car,
  CreditCard,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
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
      const data =
        personType === "client"
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

  const handleDecision = async (
    decision: "approve" | "reject",
    rejectionNotes?: string
  ) => {
    setSubmitting(true);
    try {
      if (personType === "client") {
        await clientsApi.reviewClient(personId, {
          decision,
          rejection_notes: rejectionNotes,
        });
      } else {
        await driversApi.reviewDriver(personId, {
          decision,
          rejection_notes: rejectionNotes,
        });
      }

      toast.success(`Verification ${decision}d successfully`);

      // ✅ CRITICAL: Small delay to let backend process and parent component refresh data
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 300);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || `Failed to ${decision} verification`
      );
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

  // ✅ Client-owned driver block (own_driver arrangement only).
  //    These are the personal driver's ID + DL images, stored inline on
  //    the client record (client.driver_id_image_front /
  //    client.driver_dl_image_front) and exposed via ClientOut.driver.
  //    Without surfacing them here, a reviewer could approve an own_driver
  //    client without ever seeing the personal driver's documents.
  const driver = personType === "client" ? person.driver : null;
  const hasDriverDocs = !!(driver?.id_image_front || driver?.dl_image_front);
  const showDriverSection =
    personType === "client" && person.driving_arrangement === "own_driver";

  // ✅ Empty-state now considers driver docs too, so an own_driver client
  //    whose only files are the driver's isn't misreported as "nothing uploaded".
  const hasAnyDocuments = !!(
    person.id_image_front ||
    person.id_image_back ||
    person.dl_image_front ||
    person.selfie_with_id_image ||
    (personType === "client" && hasDriverDocs)
  );

  const isRejected = person.verification_status === "rejected";

  return (
    <>
      <Modal
        open={isOpen && !lightboxImage}
        onClose={onClose}
        title="Review Verification"
        subtitle="Compare uploaded documents with the identity selfie"
        size="lg"
      >
        <div className="space-y-6">
          {/* Person Info */}
          <div className="p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--color-ink)] truncate">
                  {person.full_name}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-[var(--color-ink-muted)]">
                  {person.email && (
                    <span className="flex items-center gap-1.5 truncate">
                      <Mail size={14} className="shrink-0" />
                      <span className="truncate">{person.email}</span>
                    </span>
                  )}
                  {person.phone && (
                    <span className="flex items-center gap-1.5 truncate">
                      <Phone size={14} className="shrink-0" />
                      <span className="truncate">{person.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Previous rejection banner (read-only, informs re-review) */}
          {isRejected && person.rejection_notes && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle
                size={16}
                className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
                  Previously rejected
                </p>
                <p className="text-[11px] text-rose-600/90 dark:text-rose-400/80 mt-0.5 leading-relaxed">
                  {person.rejection_notes}
                </p>
              </div>
            </div>
          )}

          {/* Documents Section */}
          {!hasAnyDocuments ? (
            <div className="p-8 text-center rounded-xl bg-[var(--color-surface-hover)] border border-dashed border-[var(--color-surface-border)]">
              <FileText
                size={48}
                className="mx-auto text-[var(--color-ink-subtle)] mb-3"
              />
              <p className="text-sm text-[var(--color-ink-muted)]">
                No documents or selfie uploaded for verification.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* ID Documents - Side by Side Thumbnails */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
                    <FileText size={16} className="text-[var(--color-primary)]" />
                    Submitted Documents
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
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
                              <p className="text-[10px] text-center font-medium">
                                ID Front
                              </p>
                            </div>
                          }
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
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
                              <p className="text-[10px] text-center font-medium">
                                ID Back
                              </p>
                            </div>
                          }
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
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
                              <p className="text-[10px] text-center font-medium">
                                Driver's License
                              </p>
                            </div>
                          }
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Eye size={20} className="text-white" />
                        </div>
                      </button>
                    )}

                    {!person.id_image_front &&
                      !person.id_image_back &&
                      !person.dl_image_front && (
                        <div className="col-span-2 p-4 text-center rounded-lg bg-[var(--color-surface-hover)] border border-dashed border-[var(--color-surface-border)]">
                          <p className="text-xs text-[var(--color-ink-muted)] italic">
                            No client ID documents uploaded
                          </p>
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
                      onClick={() =>
                        handleOpenLightbox(person.selfie_with_id_image)
                      }
                      className="group relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-xl bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)] transition-all overflow-hidden"
                      title="Click to view selfie"
                    >
                      <SecureImage
                        src={person.selfie_with_id_image}
                        alt="Identity Selfie"
                        className="w-full h-full object-cover"
                        fallback={
                          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-subtle)] p-4">
                            <User size={32} className="mb-2" />
                            <p className="text-xs text-center font-medium">
                              Click to view selfie
                            </p>
                          </div>
                        }
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye size={24} className="text-white" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-full aspect-[3/4] sm:aspect-[4/5] rounded-xl bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] flex items-center justify-center">
                      <div className="text-center text-[var(--color-ink-subtle)] p-4">
                        <User size={32} className="mx-auto mb-2" />
                        <p className="text-sm font-medium">No selfie uploaded</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ Personal Driver Documents — shown for own_driver clients */}
              {showDriverSection && (
                <div className="pt-6 border-t border-[var(--color-surface-border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
                      <UserCheck
                        size={16}
                        className="text-[var(--color-primary)]"
                      />
                      Personal Driver Documents
                    </h4>
                    {!hasDriverDocs && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        Not Uploaded
                      </span>
                    )}
                  </div>

                  {hasDriverDocs ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {driver?.id_image_front && (
                          <button
                            onClick={() =>
                              handleOpenLightbox(driver.id_image_front)
                            }
                            className="group relative aspect-[4/3] rounded-lg bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)] transition-all overflow-hidden"
                            title="Click to view Driver ID Front"
                          >
                            <SecureImage
                              src={driver.id_image_front}
                              alt="Driver ID Front"
                              className="w-full h-full object-cover"
                              fallback={
                                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-subtle)] p-2">
                                  <CreditCard size={20} className="mb-1" />
                                  <p className="text-[10px] text-center font-medium">
                                    Driver ID Front
                                  </p>
                                </div>
                              }
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Eye size={20} className="text-white" />
                            </div>
                          </button>
                        )}

                        {driver?.dl_image_front && (
                          <button
                            onClick={() =>
                              handleOpenLightbox(driver.dl_image_front)
                            }
                            className="group relative aspect-[4/3] rounded-lg bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)] transition-all overflow-hidden"
                            title="Click to view Driver DL Front"
                          >
                            <SecureImage
                              src={driver.dl_image_front}
                              alt="Driver DL Front"
                              className="w-full h-full object-cover"
                              fallback={
                                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-subtle)] p-2">
                                  <Car size={20} className="mb-1" />
                                  <p className="text-[10px] text-center font-medium">
                                    Driver DL Front
                                  </p>
                                </div>
                              }
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Eye size={20} className="text-white" />
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Driver identity summary, so the reviewer can
                          match the driver docs against the driver record */}
                      {driver && (
                        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-[11px] text-[var(--color-ink-muted)] space-y-1">
                          <div className="flex justify-between gap-2">
                            <span className="font-semibold text-[var(--color-ink)]">
                              {driver.full_name}
                            </span>
                            <span className="font-mono">{driver.phone}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span>ID: <span className="font-mono">{driver.id_number}</span></span>
                            <span>DL: <span className="font-mono">{driver.dl_number}</span></span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 text-center rounded-lg bg-[var(--color-surface-hover)] border border-dashed border-[var(--color-surface-border)]">
                      <UserCheck
                        size={32}
                        className="mx-auto text-[var(--color-ink-subtle)] mb-2"
                      />
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        This client declared a personal driver, but no driver
                        documents have been uploaded yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Decision Buttons - Stacked on mobile, side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--color-surface-border)]">
            <button
              onClick={() => handleDecision("approve")}
              disabled={submitting || !hasAnyDocuments}
              className="w-full sm:flex-1 py-3.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              Approve Verification
            </button>
            <button
              onClick={() => {
                const notes = prompt("Enter rejection reason (optional):");
                if (notes !== null) {
                  handleDecision("reject", notes || undefined);
                }
              }}
              disabled={submitting || !hasAnyDocuments}
              className="w-full sm:flex-1 py-3.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <XCircle size={16} />
              )}
              Reject Verification
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
