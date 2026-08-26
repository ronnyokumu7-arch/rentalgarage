// src/app/dashboard/clients/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { clientsApi } from "@/lib/api/clients";
import type { Client } from "@/lib/types";
import NewClientForm from "@/components/client/NewClientForm";

export default function ClientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = parseInt(params.id as string);
  
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [clientData, setClientData] = useState<Client | null>(null); // ✅ RENAMED from _clientData
  
  // File states for uploads
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    id_number: "",
    dl_number: "",
    dl_expiry: "",
    residential_address: "",
    work_address: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
  });

// Load existing client data
useEffect(() => {
  const loadClient = async () => {
    try {
      setIsFetching(true);
      // ✅ FIXED: Use .get() not .getById()
      const data = await clientsApi.get(clientId);
      
      setClientData(data);
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        id_number: data.id_number || "",
        dl_number: data.dl_number || "",
        // ✅ Handle both possible field names from backend
        dl_expiry: data.dl_expiry || data.dl_expiry || "",
        residential_address: data.residential_address || "",
        work_address: data.work_address || "",
        next_of_kin_name: data.next_of_kin_name || "",
        next_of_kin_phone: data.next_of_kin_phone || "",
      });
    } catch (error) {
      console.error("Failed to load client:", error);
      toast.error("Failed to load client data");
      router.push("/dashboard/clients");
    } finally {
      setIsFetching(false);
    }
  };

  if (clientId && !isNaN(clientId)) {
    loadClient();
  }
}, [clientId, router]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.full_name || !formData.phone) {
    toast.error("Full Name and Phone are required");
    return;
  }

  setLoading(true);
  try {
    const payload = {
      full_name: formData.full_name,
      email: formData.email || null,
      phone: formData.phone,
      id_number: formData.id_number || null,
      dl_number: formData.dl_number || null,
      dl_expiry: formData.dl_expiry || null,
      residential_address: formData.residential_address || null,
      work_address: formData.work_address || null,
      next_of_kin_name: formData.next_of_kin_name || null,
      next_of_kin_phone: formData.next_of_kin_phone || null,
    };

    await clientsApi.update(clientId, payload);

    // Handle file uploads if new files are selected
    const uploadPromises = [];
    if (avatarFile) uploadPromises.push(clientsApi.uploadAvatar(clientId, avatarFile));
    if (idFrontFile) uploadPromises.push(clientsApi.uploadIdFront(clientId, idFrontFile));
    if (idBackFile) uploadPromises.push(clientsApi.uploadIdBack(clientId, idBackFile));
    if (dlFrontFile) uploadPromises.push(clientsApi.uploadDlFront(clientId, dlFrontFile));

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }

    // ✅ REFRESH: Reload client data so avatar/docs update in the preview
    const refreshedData = await clientsApi.get(clientId);
    setClientData(refreshedData);
    
    // Clear file states since they're now uploaded
    setAvatarFile(null);
    setIdFrontFile(null);
    setIdBackFile(null);
    setDlFrontFile(null);

    toast.success("Client updated successfully!");
  } catch (error: any) {
    toast.error(error.response?.data?.detail || "Failed to update client");
  } finally {
    setLoading(false);
  }
};

  if (isFetching) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-[var(--color-bg)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-surface-border)] px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/dashboard/clients")} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-base font-bold text-[var(--color-ink)]">Update Client</h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Form */}
      <NewClientForm 
        mode="edit"
        loading={loading}
        formData={formData}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
        idFrontFile={idFrontFile}
        setIdFrontFile={setIdFrontFile}
        idBackFile={idBackFile}
        setIdBackFile={setIdBackFile}
        dlFrontFile={dlFrontFile}
        setDlFrontFile={setDlFrontFile}
        updateField={updateField}
        handleSubmit={handleSubmit}
        // ✅ NEW: Pass existing document URLs (thumbnails will render)
        existingAvatar={clientData?.avatar_image || null}
        existingIdFront={clientData?.id_image_front || null}
        existingIdBack={clientData?.id_image_back || null}
        existingDlFront={clientData?.dl_image_front || null}
      />
    </div>
  );
}
