// src/components/client/[id]/ComplianceDocumentsSection.tsx
"use client";

import { useState } from "react";
import {
  FileText,
  Upload,
  Eye,
  ZoomIn,
  ShieldCheck,
} from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import SecureImage from "@/components/ui/SecureImage";
import type { Client } from "@/lib/types";

interface ComplianceDocumentsSectionProps {
  client: Client;
  files: {
    idFrontFile: File | null;
    setIdFrontFile: (f: File | null) => void;
    idBackFile: File | null;
    setIdBackFile: (f: File | null) => void;
    dlFrontFile: File | null;
    setDlFrontFile: (f: File | null) => void;
  };
  loading: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onPreview: (src: string, label: string) => void;
  onManageVerification: () => void;
}

type DocTab = "idFront" | "idBack" | "dlFront" | "selfie";

export default function ComplianceDocumentsSection({
  client,
  files,
  loading,
  onSave,
  onDiscard,
  onPreview,
  onManageVerification,
}: ComplianceDocumentsSectionProps) {
  const [activeDocTab, setActiveDocTab] = useState<DocTab>("idFront");

  // ✅ Client DL is only required/relevant for self_drive.
  //    Backend KYC gate (lifecycle.py::activate_client) enforces:
  //      self_drive  → id_image_front + dl_image_front
  //      own_driver  → id_image_front + driver_id_image_front + driver_dl_image_front
  //      chauffeur   → id_image_front only
  //    So the DL slot should not render for own_driver / chauffeur.
  const showDlSlot = client.driving_arrangement === "self_drive";

  const docConfig = [
    {
      id: "idFront" as const,
      label: "ID Front",
      file: files.idFrontFile,
      setFile: files.setIdFrontFile,
      existing: client.id_image_front,
    },
    {
      id: "idBack" as const,
      label: "ID Back",
      file: files.idBackFile,
      setFile: files.setIdBackFile,
      existing: client.id_image_back,
    },
    ...(showDlSlot
      ? [
          {
            id: "dlFront" as const,
            label: "Driver's License",
            file: files.dlFrontFile,
            setFile: files.setDlFrontFile,
            existing: client.dl_image_front,
          },
        ]
      : []),
    {
      id: "selfie" as const,
      label: "Vetting Selfie",
      file: null as File | null,
      setFile: (_: File | null) => {},
      existing: client.selfie_with_id_image,
    },
  ];

  // ✅ Defensive: if the active tab was dlFront but the DL slot got
  //    hidden (e.g. client arrangement changed underneath us on refetch),
  //    fall back to the first available doc.
  const activeDoc =
    docConfig.find((d) => d.id === activeDocTab) ?? docConfig[0];
  const activeSrc = activeDoc.file
    ? URL.createObjectURL(activeDoc.file)
    : activeDoc.existing;

  // ✅ Empty state only considers docs that can actually be uploaded here.
  //    Driver ID/DL live in ClientDriverSection, not here.
  const isEmpty =
    !client.id_image_front &&
    !client.id_image_back &&
    (!showDlSlot || !client.dl_image_front) &&
    !client.selfie_with_id_image &&
    !files.idFrontFile &&
    !files.idBackFile &&
    (!showDlSlot || !files.dlFrontFile);

  const hasUnsaved =
    !!files.idFrontFile ||
    !!files.idBackFile ||
    (showDlSlot && !!files.dlFrontFile);

  return (
    <SectionCard title="Compliance Documents" icon={FileText}>
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-dashed border-[var(--color-surface-border)] flex items-center justify-center mb-4">
            <FileText size={24} className="text-[var(--color-ink-subtle)]" />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">
            No Documents Uploaded
          </h3>
          <p className="text-xs text-[var(--color-ink-muted)] max-w-xs mb-6">
            This client hasn't submitted any compliance documents yet. Once they
            complete vetting, you'll be able to review them here.
          </p>
          {client.status === "pending" && (
            <button
              onClick={onManageVerification}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-all"
            >
              <ShieldCheck size={14} /> Send Verification Link
            </button>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP VIEW */}
          <div className="hidden md:block space-y-4">
            <div
              className={`relative aspect-[1.58/1] rounded-xl overflow-hidden border border-[var(--color-surface-border)] bg-[#1A1714] shadow-sm group ${activeSrc ? "cursor-pointer" : ""}`}
              onClick={() => activeSrc && onPreview(activeSrc, activeDoc.label)}
            >
              {activeSrc ? (
                <>
                  <SecureImage
                    src={activeSrc}
                    alt={activeDoc.label}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                    <span className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-bold flex items-center gap-1.5">
                      <ZoomIn size={14} /> Click to Zoom
                    </span>
                    {activeDoc.id !== "selfie" && (
                      <label
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-all cursor-pointer shadow-lg"
                      >
                        <Upload size={14} /> Replace Document
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            activeDoc.setFile(e.target.files?.[0] || null)
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-subtle)] border-2 border-dashed border-[var(--color-surface-border)] rounded-xl bg-[var(--color-surface-hover)]/30">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center mb-3">
                    <Upload size={20} className="text-[var(--color-ink-muted)]" />
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-ink)] mb-1">
                    Not Uploaded
                  </span>
                  <span className="text-xs text-[var(--color-ink-muted)] mb-4 text-center px-4">
                    {activeDoc.label} has not been provided yet
                  </span>
                  {activeDoc.id !== "selfie" && (
                    <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold cursor-pointer shadow-sm hover:bg-[var(--color-primary-hover)] transition-all active:scale-95">
                      <Upload size={14} /> Upload Now
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          activeDoc.setFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* ✅ 4 columns when DL slot is present, 3 otherwise */}
            <div
              className={`grid gap-2 ${
                showDlSlot ? "grid-cols-4" : "grid-cols-3"
              }`}
            >
              {docConfig.map((doc) => {
                const src = doc.file
                  ? URL.createObjectURL(doc.file)
                  : doc.existing;
                const isActive = activeDoc.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDocTab(doc.id)}
                    className={`relative aspect-[1.58/1] rounded-lg overflow-hidden border-2 transition-all bg-[#1A1714] ${
                      isActive
                        ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {src ? (
                      <SecureImage
                        src={src}
                        alt={doc.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-surface-hover)]">
                        <FileText
                          size={14}
                          className="text-[var(--color-ink-subtle)] mb-0.5"
                        />
                        <span className="text-[8px] font-bold text-[var(--color-ink-subtle)] uppercase">
                          Empty
                        </span>
                      </div>
                    )}
                    {doc.file && (
                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 border border-black/20" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MOBILE VIEW */}
          <div className="md:hidden -mx-4 px-4 pb-2 overflow-x-auto snap-x snap-mandatory flex gap-4 custom-scrollbar">
            {docConfig.map((doc) => {
              const src = doc.file
                ? URL.createObjectURL(doc.file)
                : doc.existing;
              return (
                <div
                  key={doc.id}
                  className="snap-center shrink-0 w-[85%] space-y-2"
                >
                  <div className="relative aspect-[1.58/1] rounded-xl overflow-hidden border border-[var(--color-surface-border)] bg-[#1A1714] shadow-sm">
                    {src ? (
                      <SecureImage
                        src={src}
                        alt={doc.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-subtle)] border-2 border-dashed border-[var(--color-surface-border)] m-1 rounded-lg">
                        <Upload size={20} className="mb-1" />
                        <span className="text-[10px] font-medium text-[var(--color-ink-muted)]">
                          Not Uploaded
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2 flex gap-2">
                      {src && (
                        <button
                          onClick={() => onPreview(src, doc.label)}
                          className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center shadow-lg active:scale-95"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {doc.id !== "selfie" && (
                        <label className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg cursor-pointer active:scale-95">
                          <Upload size={16} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              doc.setFile(e.target.files?.[0] || null)
                            }
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[11px] font-bold text-[var(--color-ink-muted)]">
                      {doc.label}
                    </p>
                    {doc.file && (
                      <span className="text-[9px] font-bold uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                    {!src && (
                      <span className="text-[9px] font-bold uppercase text-[var(--color-ink-subtle)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded">
                        Empty
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {hasUnsaved && (
        <div className="mt-5 flex items-center justify-between bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl p-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-xs font-bold text-[var(--color-primary)]">
              Unsaved documents
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDiscard}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] transition-colors"
            >
              Discard
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Save Documents"}
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
