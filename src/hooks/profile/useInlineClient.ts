import { confirmAction } from "@/lib/utils/confirmAction";
// src/hooks/profile/useInlineClient.ts
import { useState, useEffect, useRef } from "react";
import { clientsApi } from "@/lib/api/clients";
import type { Client } from "@/lib/types";
import toast from "react-hot-toast";

export function useInlineClient(client: Client, _taskId: number) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: client.full_name,
    email: client.email || "",
    phone: client.phone || "",
    id_number: client.id_number || "",
    dl_number: client.dl_number || "",
    dl_expiry: client.dl_expiry ? client.dl_expiry.split("T")[0] : "",
  });

  // Refs for hidden file inputs
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const dlFrontRef = useRef<HTMLInputElement>(null);

  // Reset form data if the client prop changes (e.g., switching tasks)
  useEffect(() => {
    setFormData({
      full_name: client.full_name,
      email: client.email || "",
      phone: client.phone || "",
      id_number: client.id_number || "",
      dl_number: client.dl_number || "",
      dl_expiry: client.dl_expiry ? client.dl_expiry.split("T")[0] : "",
    });
    setIsEditing(false);
  }, [client.id]);

  const isExpired = formData.dl_expiry && new Date(formData.dl_expiry) < new Date();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await clientsApi.update(client.id, {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        id_number: formData.id_number,
        dl_number: formData.dl_number,
        dl_expiry: formData.dl_expiry ? new Date(formData.dl_expiry).toISOString() : null,
      });
      toast.success("Client details updated successfully!");
      setIsEditing(false);
      
      // ✅ AUTO-REFRESH: notify clients list to refetch (cross-context update)
      window.dispatchEvent(new CustomEvent('client:updated', { detail: { clientId: client.id } }));
    } catch {
      toast.error("Failed to update client details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusAction = async (action: "activate" | "suspend" | "reactivate") => {
    if (!confirmAction(`Are you sure you want to ${action} this client?`)) return;
    setIsActionLoading(true);
    try {
      if (action === "activate") await clientsApi.activate(client.id);
      else if (action === "suspend") await clientsApi.suspend(client.id, "Suspended via Operations Center");
      else if (action === "reactivate") await clientsApi.reactivate(client.id);
      toast.success(`Client ${action}d successfully!`);
      
      // ✅ AUTO-REFRESH: notify clients list to refetch (cross-context status change)
      window.dispatchEvent(new CustomEvent('client:created'));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${action} client.`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDocUpload = async (docType: "id_front" | "id_back" | "dl_front", file: File) => {
    setUploadingDoc(docType);
    try {
      if (docType === "id_front") await clientsApi.uploadIdFront(client.id, file);
      else if (docType === "id_back") await clientsApi.uploadIdBack(client.id, file);
      else if (docType === "dl_front") await clientsApi.uploadDlFront(client.id, file);
      toast.success(`${docType.replace("_", " ").toUpperCase()} uploaded successfully!`);
    } catch {
      toast.error(`Failed to upload ${docType.replace("_", " ")}.`);
    } finally {
      setUploadingDoc(null);
    }
  };

  return {
    isEditing, setIsEditing,
    isSaving, isActionLoading,
    uploadingDoc, viewingImage, setViewingImage,
    formData, setFormData,
    isExpired,
    idFrontRef, idBackRef, dlFrontRef,
    handleSave, handleStatusAction, handleDocUpload,
  };
}
