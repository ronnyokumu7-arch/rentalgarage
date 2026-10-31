// src/hooks/clients/useClientProfile.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { clientsApi } from "@/lib/api/clients";
import type { Client, DrivingArrangement } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────────────
   Form shape
   Extends the client's editable fields with the client-owned driver block.
────────────────────────────────────────────────────────────────────── */

export interface ClientProfileFormData {
  // Identity
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_type: "national_id" | "passport";
  id_number: string;

  // Client DL (self_drive only)
  dl_number: string;
  dl_expiry: string;
  dl_issued_date: string;

  // Arrangement
  driving_arrangement: DrivingArrangement;

  // ✅ Client-owned driver block (own_driver only)
  driver_full_name: string;
  driver_phone: string;
  driver_id_number: string;
  driver_dl_number: string;
  driver_dl_expiry: string;
  driver_dl_issued_date: string;
}

export type EditModalKind = "identity" | "driving" | null;

export type ClientStatusBucket = "active" | "suspended" | "pending";

/* ──────────────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────────────── */

const stripDate = (v?: string | null) => (v ? v.split("T")[0] : "");

const emptyForm: ClientProfileFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  id_type: "national_id",
  id_number: "",
  dl_number: "",
  dl_expiry: "",
  dl_issued_date: "",
  driving_arrangement: "self_drive",
  driver_full_name: "",
  driver_phone: "",
  driver_id_number: "",
  driver_dl_number: "",
  driver_dl_expiry: "",
  driver_dl_issued_date: "",
};

export const buildFormDataFromClient = (data: Client): ClientProfileFormData => ({
  first_name: data.first_name || "",
  last_name: data.last_name || "",
  email: data.email || "",
  phone: data.phone || "",
  id_type: data.id_type || "national_id",
  id_number: data.id_number || "",
  dl_number: data.dl_number || "",
  dl_expiry: stripDate(data.dl_expiry),
  dl_issued_date: stripDate(data.dl_issued_date),
  driving_arrangement: data.driving_arrangement || "self_drive",
  driver_full_name: data.driver?.full_name || "",
  driver_phone: data.driver?.phone || "",
  driver_id_number: data.driver?.id_number || "",
  driver_dl_number: data.driver?.dl_number || "",
  driver_dl_expiry: stripDate(data.driver?.dl_expiry),
  driver_dl_issued_date: stripDate(data.driver?.dl_issued_date),
});

const statusBucket = (status: string): ClientStatusBucket => {
  if (status === "active") return "active";
  if (status === "suspended") return "suspended";
  return "pending";
};

const statusLabel = (client: Client): string => {
  if (client.verification_status === "under_review") return "Under Review";
  return client.status.charAt(0).toUpperCase() + client.status.slice(1);
};

/* ──────────────────────────────────────────────────────────────────────
   Hook
────────────────────────────────────────────────────────────────────── */

export function useClientProfile(clientId: number) {
  const router = useRouter();

  // ── Remote data ──
  const [clientData, setClientData] = useState<Client | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  // ── Operation state ──
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Modal state ──
  const [editModal, setEditModal] = useState<EditModalKind>(null);

  // ── Form ──
  const [formData, setFormData] = useState<ClientProfileFormData>(emptyForm);

  // ── File state ──
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);

  // ✅ Client-owned driver document files
  const [driverIdFrontFile, setDriverIdFrontFile] = useState<File | null>(null);
  const [driverDlFrontFile, setDriverDlFrontFile] = useState<File | null>(null);

  /* ── Load ─────────────────────────────────────────────────────────── */

  const loadClient = useCallback(async () => {
    try {
      setIsFetching(true);
      const data = await clientsApi.get(clientId);
      setClientData(data);
      setFormData(buildFormDataFromClient(data));
    } catch {
      toast.error("Failed to load client data");
      router.push("/dashboard/clients");
    } finally {
      setIsFetching(false);
    }
  }, [clientId, router]);

  useEffect(() => {
    if (clientId && !isNaN(clientId)) loadClient();
  }, [clientId, loadClient]);

  /* ── Field updates ────────────────────────────────────────────────── */

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ── File resets ──────────────────────────────────────────────────── */

  const clearDocFiles = () => {
    setIdFrontFile(null);
    setIdBackFile(null);
    setDlFrontFile(null);
  };

  const clearAllFiles = () => {
    clearDocFiles();
    setAvatarFile(null);
    setAvatarPreview(null);
    setDriverIdFrontFile(null);
    setDriverDlFrontFile(null);
  };

  /* ── Modal close/reset ────────────────────────────────────────────── */

  const closeModal = () => {
    setEditModal(null);
    clearAllFiles();
    if (clientData) setFormData(buildFormDataFromClient(clientData));
  };

  /* ── Save (identity + driving modals) ─────────────────────────────── */

  const handleSaveModal = async () => {
    if (!clientData || !editModal) return;
    setLoading(true);

    try {
      const payload: Record<string, any> = {};

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
        const arrangement = formData.driving_arrangement;
        const isSelfDrive = arrangement === "self_drive";
        const isOwnDriver = arrangement === "own_driver";

        // ✅ Client DL only meaningful for self_drive.
        //    Backend accepts null and clears these fields
        //    (identity engine tolerates dl_number=None).
        Object.assign(payload, {
          driving_arrangement: arrangement,
          dl_number: isSelfDrive ? formData.dl_number || null : null,
          dl_expiry: isSelfDrive ? formData.dl_expiry || null : null,
          dl_issued_date: isSelfDrive ? formData.dl_issued_date || null : null,
        });

        // ✅ Driver block only when arrangement IS own_driver.
        //    Backend behavior (management.py::update_client):
        //      - `driver` is stripped from model_dump, then read from
        //        `updates.driver` and applied ONLY if next_arrangement
        //        == "own_driver".
        //      - When `driving_arrangement` is present in the payload and
        //        != "own_driver", the backend clears all driver_* columns
        //        AND deletes the driver document images.
        //    So sending `driver: null` is redundant — the clear is driven
        //    entirely by `driving_arrangement`. We simply omit `driver`
        //    when not in own_driver mode.
        if (isOwnDriver) {
          payload.driver = {
            full_name: formData.driver_full_name,
            phone: formData.driver_phone,
            id_number: formData.driver_id_number,
            dl_number: formData.driver_dl_number,
            dl_expiry: formData.driver_dl_expiry || null,
            dl_issued_date: formData.driver_dl_issued_date || null,
          };
        }
      }

      if (Object.keys(payload).length > 0) {
        await clientsApi.update(clientId, payload);
      }

      // ✅ Driver doc uploads — MUST run after update, because the backend
      //    guards these endpoints on client.driving_arrangement == "own_driver".
      //    If we uploaded before update on a self_drive → own_driver switch,
      //    the endpoints would 422.
      if (editModal === "driving" && formData.driving_arrangement === "own_driver") {
        const driverUploads: Promise<any>[] = [];
        if (driverIdFrontFile) {
          driverUploads.push(clientsApi.uploadDriverIdFront(clientId, driverIdFrontFile));
        }
        if (driverDlFrontFile) {
          driverUploads.push(clientsApi.uploadDriverDlFront(clientId, driverDlFrontFile));
        }
        if (driverUploads.length > 0) await Promise.all(driverUploads);
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

  /* ── Compliance document uploads (existing gallery) ──────────────── */

  const handleUploadDocuments = async () => {
    if (!idFrontFile && !idBackFile && !dlFrontFile) return;
    setLoading(true);

    try {
      const uploads: Promise<any>[] = [];
      if (idFrontFile) uploads.push(clientsApi.uploadIdFront(clientId, idFrontFile));
      if (idBackFile) uploads.push(clientsApi.uploadIdBack(clientId, idBackFile));
      if (dlFrontFile) uploads.push(clientsApi.uploadDlFront(clientId, dlFrontFile));

      await Promise.all(uploads);
      toast.success("Documents uploaded!");

      await loadClient();
      clearDocFiles();
    } catch {
      toast.error("Failed to upload documents");
    } finally {
      setLoading(false);
    }
  };

  /* ── Status transitions ───────────────────────────────────────────── */

  const handleStatusAction = async (action: "suspend" | "reactivate") => {
    if (!clientData) return;
    if (action === "suspend" && !confirm("Are you sure you want to suspend this client?")) {
      return;
    }

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
    if (!confirm("Are you sure you want to archive this client? This will remove them from your active list.")) {
      return;
    }
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

  /* ── Derived ──────────────────────────────────────────────────────── */

  const derivedStatus: ClientStatusBucket = clientData
    ? statusBucket(clientData.status)
    : "pending";

  const derivedStatusLabel = clientData ? statusLabel(clientData) : "Loading";

  return {
    // data
    clientData,
    isFetching,
    loading,
    actionLoading,
    clientStatus: derivedStatus,
    statusLabel: derivedStatusLabel,

    // form
    formData,
    updateField,
    editModal,
    setEditModal,

    // files
    avatarFile,
    setAvatarFile,
    avatarPreview,
    setAvatarPreview,
    idFrontFile,
    setIdFrontFile,
    idBackFile,
    setIdBackFile,
    dlFrontFile,
    setDlFrontFile,
    driverIdFrontFile,
    setDriverIdFrontFile,
    driverDlFrontFile,
    setDriverDlFrontFile,

    // actions
    loadClient,
    closeModal,
    clearDocFiles,
    handleSaveModal,
    handleUploadDocuments,
    handleStatusAction,
    handleArchive,
  };
}

export type UseClientProfileReturn = ReturnType<typeof useClientProfile>;
