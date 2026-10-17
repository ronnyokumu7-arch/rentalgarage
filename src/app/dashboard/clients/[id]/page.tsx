// src/app/dashboard/clients/[id]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  User as UserIcon,
  Pencil,
  Check,
  Camera,
  UserCircle,
  FileText,
  Phone,
  Mail,
  Calendar,
  Car,
  CreditCard,
  ChevronDown,
  Upload,
  Eye,
  ZoomIn,
  ShieldCheck,
  Clock,
  MessageCircle,
  MoreVertical,
  Archive,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";

import ProfileLayout, { ProfileField } from "@/components/profile/ProfileLayout";
import SecureImage from "@/components/ui/SecureImage";
import SecureLightbox from "@/components/ui/SecureLightbox";
import SectionCard from "@/components/ui/SectionCard";
import Modal from "@/components/ui/Modal";
import ReviewVerificationModal from "@/components/client/ReviewVerificationModal";

import { clientsApi } from "@/lib/api/clients";
import type { Client } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────────────
   Config & Helpers
────────────────────────────────────────────────────────────────────── */

const ARRANGEMENT_LABELS: Record<string, string> = {
  self_drive: "Self Drive",
  own_driver: "Own Driver",
  chauffeur: "Chauffeur",
};

const getClientStatus = (status: string) => {
  if (status === "active") return "active";
  if (status === "suspended") return "suspended";
  return "pending";
};

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all placeholder:text-[var(--color-ink-subtle)]";
const labelClass = "block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1.5";

/* ──────────────────────────────────────────────────────────────────────
   Profile Action Group
────────────────────────────────────────────────────────────────────── */

type ActionItem = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger" | "primary" | "success";
  disabled?: boolean;
  hidden?: boolean;
};

function ProfileActionGroup({
  actions,
  compact = [],
}: {
  actions: ActionItem[];
  compact?: Array<{
    icon: React.ElementType;
    label: string;
    href: string;
    tone?: "default" | "success" | "primary";
  }>;
}) {
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

  return (
    <div className="flex items-center gap-2">
      {compact.map((btn) => {
        const Icon = btn.icon;
        const toneClass =
          btn.tone === "success"
            ? "text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/30"
            : btn.tone === "primary"
              ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30"
              : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]";
        return (
          <a
            key={btn.label}
            href={btn.href}
            target={btn.href.startsWith("http") ? "_blank" : undefined}
            rel={btn.href.startsWith("http") ? "noopener noreferrer" : undefined}
            title={btn.label}
            aria-label={btn.label}
            className={`w-10 h-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-center transition-all active:scale-95 ${toneClass}`}
          >
            <Icon size={18} />
          </a>
        );
      })}

      {visibleActions.length > 0 && (
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            title="More actions"
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded={open}
            className="w-10 h-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95"
          >
            <MoreVertical size={18} />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+6px)] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-lg)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50"
            >
              <div className="py-1">
                {visibleActions.map((action, i) => {
                  const Icon = action.icon;
                  const toneClass =
                    action.tone === "danger"
                      ? "text-rose-600 hover:bg-rose-500/10"
                      : action.tone === "primary"
                        ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                        : action.tone === "success"
                          ? "text-emerald-600 hover:bg-emerald-500/10"
                          : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]";
                  const separator = action.tone === "danger" && i > 0;
                  return (
                    <div key={action.label}>
                      {separator && <div className="h-px bg-[var(--color-surface-border)] my-1" />}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpen(false);
                          action.onClick();
                        }}
                        disabled={action.disabled}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${toneClass}`}
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
   Main Component
────────────────────────────────────────────────────────────────────── */

export default function ClientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = parseInt(params.id as string);

  const [clientData, setClientData] = useState<Client | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [editModal, setEditModal] = useState<"identity" | "driving" | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    id_type: "national_id" as "national_id" | "passport", id_number: "",
    dl_number: "", dl_expiry: "", dl_issued_date: "",
    driving_arrangement: "self_drive" as "self_drive" | "own_driver" | "chauffeur",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);

  const [activeDocTab, setActiveDocTab] = useState<"idFront" | "idBack" | "dlFront" | "selfie">("idFront");
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);

  const loadClient = async () => {
    try {
      setIsFetching(true);
      const data = await clientsApi.get(clientId);
      setClientData(data);
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        id_type: data.id_type || "national_id",
        id_number: data.id_number || "",
        dl_number: data.dl_number || "",
        dl_expiry: data.dl_expiry ? data.dl_expiry.split("T")[0] : "",
        dl_issued_date: (data as any).dl_issued_date ? (data as any).dl_issued_date.split("T")[0] : "",
        driving_arrangement: (data as any).driving_arrangement || "self_drive",
      });
    } catch (error) {
      toast.error("Failed to load client data");
      router.push("/dashboard/clients");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (clientId && !isNaN(clientId)) loadClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveModal = async () => {
    if (!clientData || !editModal) return;
    setLoading(true);
    try {
      const payload: any = {};
      
      if (editModal === "identity") {
        Object.assign(payload, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || undefined,
          phone: formData.phone,
          id_type: formData.id_type,
          id_number: formData.id_number || undefined,
        });
        if (avatarFile) {
          await clientsApi.uploadAvatar(clientId, avatarFile);
        }
      } else if (editModal === "driving") {
        Object.assign(payload, {
          dl_number: formData.dl_number || undefined,
          dl_expiry: formData.dl_expiry || undefined,
          dl_issued_date: formData.dl_issued_date || undefined,
          driving_arrangement: formData.driving_arrangement,
        });
      }

      if (Object.keys(payload).length) {
        await clientsApi.update(clientId, payload);
      }

      await loadClient();
      toast.success("Saved successfully!");
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setEditModal(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (clientData) {
      setFormData({
        first_name: clientData.first_name || "",
        last_name: clientData.last_name || "",
        email: clientData.email || "",
        phone: clientData.phone || "",
        id_type: clientData.id_type || "national_id",
        id_number: clientData.id_number || "",
        dl_number: clientData.dl_number || "",
        dl_expiry: clientData.dl_expiry ? clientData.dl_expiry.split("T")[0] : "",
        dl_issued_date: (clientData as any).dl_issued_date ? (clientData as any).dl_issued_date.split("T")[0] : "",
        driving_arrangement: (clientData as any).driving_arrangement || "self_drive",
      });
    }
  };

  const handleUploadDocuments = async () => {
    if (!idFrontFile && !idBackFile && !dlFrontFile) return;
    setLoading(true);
    try {
      const uploads = [];
      if (idFrontFile) uploads.push(clientsApi.uploadIdFront(clientId, idFrontFile));
      if (idBackFile) uploads.push(clientsApi.uploadIdBack(clientId, idBackFile));
      if (dlFrontFile) uploads.push(clientsApi.uploadDlFront(clientId, dlFrontFile));
      
      await Promise.all(uploads);
      toast.success("Documents uploaded!");
      
      await loadClient();
      setIdFrontFile(null);
      setIdBackFile(null);
      setDlFrontFile(null);
    } catch (error: any) {
      toast.error("Failed to upload documents");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = async (action: "suspend" | "reactivate") => {
    if (!clientData) return;
    if (action === "suspend" && !confirm("Are you sure you want to suspend this client?")) return;
    
    setActionLoading(true);
    try {
      if (action === "suspend") {
        await clientsApi.suspend(clientId, "Suspended via profile");
      } else {
        await clientsApi.reactivate(clientId);
      }
      await loadClient();
      toast.success(`Client ${action}d`);
    } catch {
      toast.error(`Failed to ${action} client`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this client? This will remove them from your active list.")) return;
    setActionLoading(true);
    try {
      await clientsApi.archive(clientId);
      toast.success("Client archived");
      router.push("/dashboard/clients");
    } catch {
      toast.error("Failed to archive client");
    } finally {
      setActionLoading(false);
    }
  };

  const openLightbox = (src: string | null | undefined, label: string) => {
    if (!src) return;
    setLightbox({ src, label });
  };

  if (isFetching || !clientData) {
    return (
      <ProfileLayout
        title="Client Profile"
        subtitle="Loading..."
        initials="..."
        status="pending"
        statusLabel="Loading"
        backHref="/dashboard/clients"
        backLabel="Clients"
        loading={true}
      >
        <div />
      </ProfileLayout>
    );
  }

  const clientStatus = getClientStatus(clientData.status);
  const isPending = clientData.status === "pending";
  const isUnderReview = clientData.verification_status === "under_review";
  const isSuspended = clientData.status === "suspended";

  // ✅ Safely compute initials with null fallbacks
  const initials =
    `${clientData.first_name?.[0] ?? ""}${clientData.last_name?.[0] ?? ""}`.toUpperCase() || "C";

  // ✅ Safely compute display name
  const displayName =
    [clientData.first_name, clientData.last_name].filter(Boolean).join(" ") || "Client";

  // Build the compact link buttons (phone + WhatsApp)
  const phoneDigits = (clientData.phone || "").replace(/[^\d+]/g, "");
  const compactActions = [];
  if (phoneDigits) {
    compactActions.push({
      icon: Phone,
      label: "Call client",
      href: `tel:${phoneDigits}`,
      tone: "primary" as const,
    });
    compactActions.push({
      icon: MessageCircle,
      label: "WhatsApp client",
      href: `https://wa.me/${phoneDigits.replace(/^\+/, "")}`,
      tone: "success" as const,
    });
  }

  // Build the overflow menu actions
  const menuActions: ActionItem[] = [
    {
      icon: ShieldCheck,
      label: isUnderReview ? "Review Verification" : "Manage Verification",
      onClick: () => setReviewModalOpen(true),
      tone: "primary",
      hidden: !(isPending || isUnderReview || clientData.verification_status === "rejected"),
    },
    {
      icon: Pencil,
      label: "Edit Identity",
      onClick: () => setEditModal("identity"),
    },
    {
      icon: Car,
      label: "Edit Driving Details",
      onClick: () => setEditModal("driving"),
    },
    {
      icon: isSuspended ? Check : Ban,
      label: isSuspended ? "Reactivate Client" : "Suspend Client",
      onClick: () => handleStatusAction(isSuspended ? "reactivate" : "suspend"),
      tone: isSuspended ? "success" : "danger",
      disabled: actionLoading,
    },
    {
      icon: Archive,
      label: "Archive Client",
      onClick: handleArchive,
      tone: "danger",
      disabled: actionLoading,
    },
  ];

  // Document Gallery Config
  const docConfig = [
    { id: "idFront", label: "ID Front", file: idFrontFile, setFile: setIdFrontFile, existing: clientData.id_image_front },
    { id: "idBack", label: "ID Back", file: idBackFile, setFile: setIdBackFile, existing: clientData.id_image_back },
    { id: "dlFront", label: "Driver's License", file: dlFrontFile, setFile: setDlFrontFile, existing: clientData.dl_image_front },
    { id: "selfie", label: "Vetting Selfie", file: null as File | null, setFile: (_: File | null) => {}, existing: (clientData as any).selfie_with_id_image },
  ] as const;

  const activeDoc = docConfig.find(d => d.id === activeDocTab)!;
  const activeSrc = activeDoc.file ? URL.createObjectURL(activeDoc.file) : activeDoc.existing;

  return (
    <>
      <ProfileLayout
        title={displayName}
        subtitle={`Client Profile · Joined ${new Date(clientData.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`}
        initials={initials}
        status={clientStatus as any}
        statusLabel={
          isUnderReview 
            ? "Under Review" 
            : clientData.status.charAt(0).toUpperCase() + clientData.status.slice(1)
        }
        backHref="/dashboard/clients"
        backLabel="Clients"
        actionNode={
          <ProfileActionGroup
            actions={menuActions}
            compact={compactActions}
          />
        }
      >
        {/* Pending / Under Review / Rejected Alert Banner */}
        {(isPending || isUnderReview || clientData.verification_status === "rejected") && (
          <div
            className={`mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border ${
              clientData.verification_status === "rejected"
                ? "bg-rose-500/10 border-rose-500/20"
                : "bg-amber-500/10 border-amber-500/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  clientData.verification_status === "rejected"
                    ? "bg-rose-500/20"
                    : "bg-amber-500/20"
                }`}
              >
                <Clock
                  size={20}
                  className={
                    clientData.verification_status === "rejected"
                      ? "text-rose-600"
                      : "text-amber-600"
                  }
                />
              </div>
              <div>
                <p
                  className={`text-sm font-bold ${
                    clientData.verification_status === "rejected"
                      ? "text-rose-700 dark:text-rose-400"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {clientData.verification_status === "rejected"
                    ? "Verification Rejected"
                    : isUnderReview
                      ? "Verification Submitted"
                      : "Verification Pending"}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    clientData.verification_status === "rejected"
                      ? "text-rose-600/90 dark:text-rose-400/80"
                      : "text-amber-600/90 dark:text-amber-400/80"
                  }`}
                >
                  {clientData.verification_status === "rejected"
                    ? "This client's verification was rejected. Re-send the link to allow them to re-submit."
                    : isUnderReview
                      ? "The client has uploaded their selfie and documents. Review them to activate the account."
                      : "This client is awaiting vetting. Send them a verification link to get started."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReviewModalOpen(true)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-all ${
                clientData.verification_status === "rejected"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              <ShieldCheck size={14} />
              {clientData.verification_status === "rejected"
                ? "Re-verify"
                : isUnderReview
                  ? "Review Now"
                  : "Manage"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Identity & Driving */}
          <div className="lg:col-span-7 space-y-6">
            <SectionCard title="Identity & Contact" icon={UserCircle}>
              <div className="flex flex-col">
                <ProfileField label="Full Name" value={displayName} icon={UserIcon} />
                <ProfileField label="Phone Number" value={clientData.phone} icon={Phone} isMono />
                <ProfileField label="Email Address" value={clientData.email} icon={Mail} />
                <ProfileField label="ID Number" value={clientData.id_number} icon={CreditCard} isMono />
                <ProfileField 
                  label="Verification Status" 
                  value={
                    isUnderReview ? "Under Review" :
                    clientData.verification_status === "verified" ? "Verified" :
                    clientData.verification_status === "rejected" ? "Rejected" :
                    clientData.verification_status === "sent" ? "Link Sent" :
                    "Not Started"
                  } 
                  icon={ShieldCheck} 
                />
                <div className="pt-4 flex justify-end">
                  <button onClick={() => setEditModal("identity")} className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
                    <Pencil size={12} /> Edit Identity
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Driving Details" icon={Car}>
              <div className="flex flex-col">
                <ProfileField label="License Number" value={clientData.dl_number} icon={CreditCard} isMono />
                <ProfileField label="Expiry Date" value={clientData.dl_expiry ? new Date(clientData.dl_expiry).toLocaleDateString() : "Not set"} icon={Calendar} />
                <ProfileField label="Arrangement" value={ARRANGEMENT_LABELS[formData.driving_arrangement]} icon={Car} />
                <div className="pt-4 flex justify-end">
                  <button onClick={() => setEditModal("driving")} className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
                    <Pencil size={12} /> Edit Driving
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* RIGHT COLUMN: Emergency & Documents */}
          <div className="lg:col-span-5 space-y-6">
            <SectionCard title="Emergency Contact" icon={Phone}>
              <div className="flex flex-col">
                <ProfileField label="Name" value={clientData.next_of_kin_name} icon={UserIcon} />
                <ProfileField label="Phone" value={clientData.next_of_kin_phone} icon={Phone} isMono />
                <div className="pt-4 flex justify-end">
                  <span className="text-xs text-[var(--color-ink-subtle)] italic">Not editable yet</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Compliance Documents" icon={FileText}>
              
              {/* Empty State */}
              {!clientData.id_image_front && !clientData.id_image_back && !clientData.dl_image_front && !(clientData as any).selfie_with_id_image && !idFrontFile && !idBackFile && !dlFrontFile ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-dashed border-[var(--color-surface-border)] flex items-center justify-center mb-4">
                    <FileText size={24} className="text-[var(--color-ink-subtle)]" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">No Documents Uploaded</h3>
                  <p className="text-xs text-[var(--color-ink-muted)] max-w-xs mb-6">
                    This client hasn't submitted any compliance documents yet. Once they complete vetting, you'll be able to review them here.
                  </p>
                  {isPending && (
                    <button 
                      onClick={() => setReviewModalOpen(true)}
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
                      className={`relative aspect-[1.58/1] rounded-xl overflow-hidden border border-[var(--color-surface-border)] bg-[#1A1714] shadow-sm group ${activeSrc ? 'cursor-pointer' : ''}`}
                      onClick={() => openLightbox(activeSrc, activeDoc.label)}
                    >
                      {activeSrc ? (
                        <>
                          <SecureImage src={activeSrc} alt={activeDoc.label} className="w-full h-full object-contain" />
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
                                <input type="file" accept="image/*" onChange={(e) => activeDoc.setFile(e.target.files?.[0] || null)} className="hidden" />
                              </label>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-subtle)] border-2 border-dashed border-[var(--color-surface-border)] rounded-xl bg-[var(--color-surface-hover)]/30">
                          <div className="w-12 h-12 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center mb-3">
                            <Upload size={20} className="text-[var(--color-ink-muted)]" />
                          </div>
                          <span className="text-sm font-semibold text-[var(--color-ink)] mb-1">Not Uploaded</span>
                          <span className="text-xs text-[var(--color-ink-muted)] mb-4 text-center px-4">
                            {activeDoc.label} has not been provided yet
                          </span>
                          {activeDoc.id !== "selfie" && (
                            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold cursor-pointer shadow-sm hover:bg-[var(--color-primary-hover)] transition-all active:scale-95">
                              <Upload size={14} /> Upload Now
                              <input type="file" accept="image/*" onChange={(e) => activeDoc.setFile(e.target.files?.[0] || null)} className="hidden" />
                            </label>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {docConfig.map(doc => {
                        const src = doc.file ? URL.createObjectURL(doc.file) : doc.existing;
                        const isActive = activeDocTab === doc.id;
                        return (
                          <button
                            key={doc.id}
                            onClick={() => setActiveDocTab(doc.id)}
                            className={`relative aspect-[1.58/1] rounded-lg overflow-hidden border-2 transition-all bg-[#1A1714] ${
                              isActive ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20" : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            {src ? (
                              <SecureImage src={src} alt={doc.label} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-surface-hover)]">
                                <FileText size={14} className="text-[var(--color-ink-subtle)] mb-0.5" />
                                <span className="text-[8px] font-bold text-[var(--color-ink-subtle)] uppercase">Empty</span>
                              </div>
                            )}
                            {doc.file && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 border border-black/20" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* MOBILE VIEW */}
                  <div className="md:hidden -mx-4 px-4 pb-2 overflow-x-auto snap-x snap-mandatory flex gap-4 custom-scrollbar">
                    {docConfig.map(doc => {
                      const src = doc.file ? URL.createObjectURL(doc.file) : doc.existing;
                      return (
                        <div key={doc.id} className="snap-center shrink-0 w-[85%] space-y-2">
                          <div className="relative aspect-[1.58/1] rounded-xl overflow-hidden border border-[var(--color-surface-border)] bg-[#1A1714] shadow-sm">
                            {src ? (
                              <SecureImage src={src} alt={doc.label} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-subtle)] border-2 border-dashed border-[var(--color-surface-border)] m-1 rounded-lg">
                                <Upload size={20} className="mb-1" />
                                <span className="text-[10px] font-medium text-[var(--color-ink-muted)]">Not Uploaded</span>
                              </div>
                            )}
                            
                            <div className="absolute bottom-2 right-2 flex gap-2">
                              {src && (
                                <button 
                                  onClick={() => openLightbox(src, doc.label)}
                                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center shadow-lg active:scale-95"
                                >
                                  <Eye size={16} />
                                </button>
                              )}
                              {doc.id !== "selfie" && (
                                <label className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg cursor-pointer active:scale-95">
                                  <Upload size={16} />
                                  <input type="file" accept="image/*" onChange={(e) => doc.setFile(e.target.files?.[0] || null)} className="hidden" />
                                </label>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between px-1">
                            <p className="text-[11px] font-bold text-[var(--color-ink-muted)]">{doc.label}</p>
                            {doc.file && <span className="text-[9px] font-bold uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">Pending</span>}
                            {!src && <span className="text-[9px] font-bold uppercase text-[var(--color-ink-subtle)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded">Empty</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {(idFrontFile || idBackFile || dlFrontFile) && (
                <div className="mt-5 flex items-center justify-between bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl p-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                    <span className="text-xs font-bold text-[var(--color-primary)]">Unsaved documents</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setIdFrontFile(null); setIdBackFile(null); setDlFrontFile(null); }} 
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] transition-colors"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={handleUploadDocuments} 
                      disabled={loading} 
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-sm transition-all disabled:opacity-50"
                    >
                      {loading ? "Uploading..." : "Save Documents"}
                    </button>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

        </div>
      </ProfileLayout>

      {/* ── IDENTITY EDIT MODAL ────────────────────────────────────────── */}
      <Modal open={editModal === "identity"} onClose={closeModal} title="Edit Identity" subtitle="Update contact details and identification documents." size="md">
        <div className="space-y-5">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-[var(--color-surface-hover)] flex items-center justify-center overflow-hidden border border-[var(--color-surface-border)] shadow-sm">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : clientData.avatar_image ? (
                  <SecureImage src={clientData.avatar_image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={40} className="text-[var(--color-primary)]" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 border-2 border-[var(--color-surface)]">
                <Camera size={16} />
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
                }} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>First Name</label><input value={formData.first_name} onChange={(e) => updateField("first_name", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Last Name</label><input value={formData.last_name} onChange={(e) => updateField("last_name", e.target.value)} className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass}>Email Address</label><input value={formData.email} onChange={(e) => updateField("email", e.target.value)} type="email" className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass}>Phone Number</label><input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} type="tel" className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass}>ID Number</label><input value={formData.id_number} onChange={(e) => updateField("id_number", e.target.value)} className={inputClass} /></div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-[var(--color-surface-border)]">
            <button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all">Cancel</button>
            <button onClick={handleSaveModal} disabled={loading} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-md shadow-[var(--color-primary)]/20 transition-all active:scale-[0.98] disabled:opacity-50">{loading ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>
      </Modal>

      {/* ── DRIVING EDIT MODAL ────────────────────────────────────────── */}
      <Modal open={editModal === "driving"} onClose={closeModal} title="Edit Driving Details" subtitle="Update driver's license information." size="md">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className={labelClass}>License Number</label><input value={formData.dl_number} onChange={(e) => updateField("dl_number", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Expiry Date</label><input value={formData.dl_expiry} onChange={(e) => updateField("dl_expiry", e.target.value)} type="date" className={inputClass} /></div>
            <div className="relative">
              <label className={labelClass}>Arrangement</label>
              <div className="relative">
                <select value={formData.driving_arrangement} onChange={(e) => updateField("driving_arrangement", e.target.value)} className={`${inputClass} appearance-none cursor-pointer pr-10`}>
                  <option value="self_drive" className="bg-[var(--color-surface)] text-[var(--color-ink)]">Self Drive</option>
                  <option value="own_driver" className="bg-[var(--color-surface)] text-[var(--color-ink)]">Own Driver</option>
                  <option value="chauffeur" className="bg-[var(--color-surface)] text-[var(--color-ink)]">Chauffeur</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-[var(--color-surface-border)]">
            <button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all">Cancel</button>
            <button onClick={handleSaveModal} disabled={loading} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-md shadow-[var(--color-primary)]/20 transition-all active:scale-[0.98] disabled:opacity-50">{loading ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>
      </Modal>

      {/* ── REVIEW VERIFICATION MODAL ────────────────────────────────────────── */}
      <ReviewVerificationModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        personId={clientId}
        personType="client"
        onSuccess={() => {
          loadClient();
        }}
      />

      {/* ── SECURE LIGHTBOX ────────────────────────────────────────── */}
      <SecureLightbox
        url={lightbox?.src ?? null}
        title={lightbox?.label}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
