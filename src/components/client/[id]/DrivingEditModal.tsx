// src/components/client/[id]/DrivingEditModal.tsx
"use client";

import { ChevronDown, Upload, X, UserCheck, AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Client } from "@/lib/types";
import type { ClientProfileFormData } from "@/hooks/clients/useClientProfile";

interface DrivingEditModalProps {
  open: boolean;
  client: Client;
  formData: ClientProfileFormData;
  updateField: (field: string, value: string) => void;
  driverIdFrontFile: File | null;
  setDriverIdFrontFile: (f: File | null) => void;
  driverDlFrontFile: File | null;
  setDriverDlFrontFile: (f: File | null) => void;
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all placeholder:text-[var(--color-ink-subtle)]";
const labelClass =
  "block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1.5";

export default function DrivingEditModal({
  open,
  client,
  formData,
  updateField,
  driverIdFrontFile,
  setDriverIdFrontFile,
  driverDlFrontFile,
  setDriverDlFrontFile,
  loading,
  onClose,
  onSave,
}: DrivingEditModalProps) {
  const arrangement = formData.driving_arrangement;
  const isSelfDrive = arrangement === "self_drive";
  const isOwnDriver = arrangement === "own_driver";
  const isChauffeur = arrangement === "chauffeur";

  // ✅ Driver identity swap detection.
  //    Backend clears driver_id_image_front + driver_dl_image_front
  //    whenever the driver's ID or DL number changes
  //    (management.py::update_client → driver_identity_changed).
  //    Surface that to the user so they re-upload in the same save.
  const savedDriverId = client.driver?.id_number ?? "";
  const savedDriverDl = client.driver?.dl_number ?? "";
  const driverIdChanged =
    isOwnDriver && formData.driver_id_number !== savedDriverId;
  const driverDlChanged =
    isOwnDriver && formData.driver_dl_number !== savedDriverDl;
  const driverIdentityChanged = driverIdChanged || driverDlChanged;

  const driverDocSlots = [
    {
      label: "Driver ID Front",
      file: driverIdFrontFile,
      setFile: setDriverIdFrontFile,
      // Suppress stale preview when the backend will clear this image
      existing: driverIdentityChanged
        ? null
        : client.driver?.id_image_front ?? null,
    },
    {
      label: "Driver DL Front",
      file: driverDlFrontFile,
      setFile: setDriverDlFrontFile,
      existing: driverIdentityChanged
        ? null
        : client.driver?.dl_image_front ?? null,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Driving Details"
      subtitle="Update driver's license and arrangement."
      size="md"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Driving Arrangement</label>
            <div className="relative">
              <select
                value={arrangement}
                onChange={(e) => updateField("driving_arrangement", e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer pr-10`}
              >
                <option value="self_drive">Self Drive</option>
                <option value="own_driver">Own Driver</option>
                <option value="chauffeur">Chauffeur</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none"
              />
            </div>
          </div>

          {isSelfDrive && (
            <>
              <div className="sm:col-span-2">
                <label className={labelClass}>License Number</label>
                <input
                  value={formData.dl_number}
                  onChange={(e) => updateField("dl_number", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Expiry Date</label>
                <input
                  value={formData.dl_expiry}
                  onChange={(e) => updateField("dl_expiry", e.target.value)}
                  type="date"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Issue Date</label>
                <input
                  value={formData.dl_issued_date}
                  onChange={(e) => updateField("dl_issued_date", e.target.value)}
                  type="date"
                  className={inputClass}
                />
              </div>
            </>
          )}

          {isChauffeur && (
            <div className="sm:col-span-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
              The agency will assign and manage a driver. No client license or
              driver details are required.
            </div>
          )}

          {isOwnDriver && (
            <div className="sm:col-span-2 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-4">
              <div className="flex items-center gap-2">
                <UserCheck size={14} className="text-blue-500" />
                <h4 className="text-xs font-bold text-[var(--color-ink)]">
                  Driver Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    value={formData.driver_full_name}
                    onChange={(e) => updateField("driver_full_name", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    value={formData.driver_phone}
                    onChange={(e) => updateField("driver_phone", e.target.value)}
                    type="tel"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>ID Number</label>
                  <input
                    value={formData.driver_id_number}
                    onChange={(e) => updateField("driver_id_number", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>DL Number</label>
                  <input
                    value={formData.driver_dl_number}
                    onChange={(e) => updateField("driver_dl_number", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>DL Expiry</label>
                  <input
                    value={formData.driver_dl_expiry}
                    onChange={(e) => updateField("driver_dl_expiry", e.target.value)}
                    type="date"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>DL Issue Date</label>
                  <input
                    value={formData.driver_dl_issued_date}
                    onChange={(e) =>
                      updateField("driver_dl_issued_date", e.target.value)
                    }
                    type="date"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* ✅ Identity-swap warning */}
              {driverIdentityChanged && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle
                    size={14}
                    className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                  />
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    Changing the driver's ID or license number will remove the
                    existing driver document images. Please upload replacements
                    before saving.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {driverDocSlots.map((slot) => {
                  const preview = slot.file
                    ? URL.createObjectURL(slot.file)
                    : slot.existing;
                  const needsReupload =
                    driverIdentityChanged && !slot.file && !slot.existing;
                  return (
                    <div key={slot.label} className="space-y-1.5">
                      <label
                        className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed bg-[var(--color-surface)] cursor-pointer min-h-[80px] ${
                          needsReupload
                            ? "border-amber-500/50 hover:border-amber-500"
                            : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) =>
                            slot.setFile(e.target.files?.[0] || null)
                          }
                        />
                        {preview ? (
                          <img
                            src={preview}
                            alt={slot.label}
                            className="w-full h-16 object-cover rounded-md mb-1"
                          />
                        ) : (
                          <Upload
                            size={16}
                            className={`mb-1 ${
                              needsReupload
                                ? "text-amber-500"
                                : "text-[var(--color-ink-muted)]"
                            }`}
                          />
                        )}
                        <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] text-center">
                          {slot.label}
                        </p>
                      </label>
                      {slot.file && (
                        <button
                          type="button"
                          onClick={() => slot.setFile(null)}
                          className="flex items-center gap-1 text-[10px] text-rose-500 font-semibold"
                        >
                          <X size={10} /> Clear
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 border-t border-[var(--color-surface-border)]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-md shadow-[var(--color-primary)]/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
