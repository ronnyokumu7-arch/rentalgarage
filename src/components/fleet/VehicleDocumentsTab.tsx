"use client";

import { useRef } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, AlertCircle, Upload, Eye } from "lucide-react";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Vehicle } from "@/lib/types";

interface VehicleDocumentsTabProps {
  vehicle: Vehicle;
  onUploaded: () => void;
}

export default function VehicleDocumentsTab({ vehicle, onUploaded }: VehicleDocumentsTabProps) {
  const insuranceRef = useRef<HTMLInputElement>(null);
  const registrationRef = useRef<HTMLInputElement>(null);
  const inspectionRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (
    kind: "insurance" | "registration" | "inspection",
    file: File | undefined
  ) => {
    if (!file) return;
    try {
      if (kind === "insurance") await vehiclesApi.uploadInsuranceDoc(vehicle.id, file);
      if (kind === "registration") await vehiclesApi.uploadRegistrationDoc(vehicle.id, file);
      if (kind === "inspection") await vehiclesApi.uploadInspectionDoc(vehicle.id, file);
      toast.success(`${kind} uploaded`);
      onUploaded();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Upload failed");
    }
  };

  const docs = [
    {
      kind: "insurance" as const,
      ref: insuranceRef,
      label: "Insurance",
      hasFile: !!vehicle.insurance_doc,
      meta: vehicle.insurance_number ? `Policy ${vehicle.insurance_number}` : "No policy on file",
      expiry: vehicle.insurance_expiry,
    },
    {
      kind: "registration" as const,
      ref: registrationRef,
      label: "Registration",
      hasFile: !!vehicle.registration_doc,
      meta: "Vehicle registration certificate",
      expiry: null,
    },
    {
      kind: "inspection" as const,
      ref: inspectionRef,
      label: "Inspection",
      hasFile: !!vehicle.inspection_doc,
      meta: "Inspection report",
      expiry: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {docs.map((doc) => (
        <div
          key={doc.kind}
          className={`bg-[var(--color-surface)] rounded-2xl border p-4 ${
            doc.hasFile
              ? "border-[var(--color-surface-border)]"
              : "border-rose-500/30 bg-rose-500/5"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                doc.hasFile
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {doc.hasFile ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--color-ink)]">{doc.label}</p>
              <p className="text-[10px] text-[var(--color-ink-muted)] truncate">
                {doc.hasFile ? doc.meta : "Missing — upload required"}
              </p>
            </div>
          </div>

          {doc.expiry && (
            <p className="text-[10px] text-[var(--color-ink-muted)] mb-3">
              Expires {new Date(doc.expiry).toLocaleDateString()}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => doc.ref.current?.click()}
              className="flex-1 h-8 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[11px] font-bold text-[var(--color-ink)] transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload size={11} /> {doc.hasFile ? "Replace" : "Upload"}
            </button>
            {doc.hasFile && (
              <button
                onClick={() => toast("Preview coming soon", { icon: "📄" })}
                className="h-8 w-8 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center transition-colors"
                aria-label="Preview"
              >
                <Eye size={12} className="text-[var(--color-ink-muted)]" />
              </button>
            )}
          </div>

          <input
            ref={doc.ref}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => handleUpload(doc.kind, e.target.files?.[0])}
          />
        </div>
      ))}
    </div>
  );
}
