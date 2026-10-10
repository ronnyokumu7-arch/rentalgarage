// src/app/dashboard/clients/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Pencil, X, Check, Camera, UserCircle, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { clientsApi } from "@/lib/api/clients";
import type { Client } from "@/lib/types";
import SecureImage from "@/components/ui/SecureImage";

type EditSection = "identity" | "emergency" | "driving" | "documents" | null;

export default function ClientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = parseInt(params.id as string);
  
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [editSection, setEditSection] = useState<EditSection>(null);
  
  // File states for uploads
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    id_type: "national_id" as "national_id" | "passport",
    id_number: "",
    dl_number: "",
    dl_expiry: "",
    dl_issued_date: "",
    residential_address: "",
    work_address: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
    driving_arrangement: "self_drive" as "self_drive" | "own_driver" | "chauffeur",
  });

  // Load existing client data
  useEffect(() => {
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
          residential_address: data.residential_address || "",
          work_address: data.work_address || "",
          next_of_kin_name: data.next_of_kin_name || "",
          next_of_kin_phone: data.next_of_kin_phone || "",
          driving_arrangement: (data as any).driving_arrangement || "self_drive",
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveSection = async (section: EditSection) => {
    if (!clientData) return;

    setLoading(true);
    try {
      const payload: any = {};

      // Build payload based on section
      if (section === "identity") {
        if (!formData.first_name || !formData.last_name || !formData.phone) {
          toast.error("First Name, Last Name, and Phone are required");
          setLoading(false);
          return;
        }
        Object.assign(payload, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || undefined,
          phone: formData.phone,
          id_type: formData.id_type,
          id_number: formData.id_number || undefined,
        });
      } else if (section === "emergency") {
        Object.assign(payload, {
          next_of_kin_name: formData.next_of_kin_name || undefined,
          next_of_kin_phone: formData.next_of_kin_phone || undefined,
        });
      } else if (section === "driving") {
        Object.assign(payload, {
          dl_number: formData.dl_number || undefined,
          dl_expiry: formData.dl_expiry || undefined,
          dl_issued_date: formData.dl_issued_date || undefined,
          driving_arrangement: formData.driving_arrangement,
        });
      } else if (section === "documents") {
        // Handle file uploads for documents
        const uploadPromises = [];
        if (idFrontFile) uploadPromises.push(clientsApi.uploadIdFront(clientId, idFrontFile));
        if (idBackFile) uploadPromises.push(clientsApi.uploadIdBack(clientId, idBackFile));
        if (dlFrontFile) uploadPromises.push(clientsApi.uploadDlFront(clientId, dlFrontFile));
        
        if (uploadPromises.length > 0) {
          await Promise.all(uploadPromises);
          toast.success("Documents uploaded successfully!");
          const refreshedData = await clientsApi.get(clientId);
          setClientData(refreshedData);
          setIdFrontFile(null);
          setIdBackFile(null);
          setDlFrontFile(null);
          setEditSection(null);
          setLoading(false);
          return;
        }
      }

      // Handle avatar upload separately
      if (avatarFile && section === "identity") {
        await clientsApi.uploadAvatar(clientId, avatarFile);
        setAvatarFile(null);
        setAvatarPreview(null);
      }

      // Update client data if there are field changes
      if (Object.keys(payload).length > 0) {
        await clientsApi.update(clientId, payload);
      }

      // Refresh client data
      const refreshedData = await clientsApi.get(clientId);
      setClientData(refreshedData);
      
      toast.success("Changes saved successfully!");
      setEditSection(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to current client data
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
        residential_address: clientData.residential_address || "",
        work_address: clientData.work_address || "",
        next_of_kin_name: clientData.next_of_kin_name || "",
        next_of_kin_phone: clientData.next_of_kin_phone || "",
        driving_arrangement: (clientData as any).driving_arrangement || "self_drive",
      });
    }
    setEditSection(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    setIdFrontFile(null);
    setIdBackFile(null);
    setDlFrontFile(null);
  };

  if (isFetching) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-[var(--color-ink-muted)]">Client not found</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-[var(--color-bg)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-surface-border)] px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push("/dashboard/clients")} 
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <ArrowLeft size={16} /> Back to Clients
          </button>
          <h1 className="text-base font-bold text-[var(--color-ink)]">
            {clientData.first_name} {clientData.last_name}
          </h1>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Client Identity Section */}
        <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-surface-border)] flex items-center justify-between bg-[var(--color-surface-hover)]/30">
            <div className="flex items-center gap-3">
              <UserCircle size={20} className="text-[var(--color-primary)]" />
              <h2 className="text-sm font-bold text-[var(--color-ink)]">Client Identity</h2>
            </div>
            {editSection !== "identity" ? (
              <button
                onClick={() => setEditSection("identity")}
                className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all"
              >
                <Pencil size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => handleSaveSection("identity")}
                  disabled={loading}
                  className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50"
                >
                  <Check size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {editSection === "identity" ? (
              /* EDIT MODE */
              <div className="space-y-4">
                <div className="flex items-start gap-6">
                  {/* Avatar Upload */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border-2 border-[var(--color-primary)]/20 flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                        ) : clientData.avatar_image ? (
                          <SecureImage
                            src={clientData.avatar_image}
                            alt="Client avatar"
                            className="w-full h-full object-cover"
                            fallback={<UserCircle size={40} className="text-[var(--color-primary)]" />}
                          />
                        ) : (
                          <UserCircle size={40} className="text-[var(--color-primary)]" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center cursor-pointer hover:bg-[var(--color-primary-hover)] transition-colors shadow-lg">
                        <Camera size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {avatarFile && (
                      <p className="text-[10px] text-[var(--color-ink-muted)] mt-2 text-center">
                        {avatarFile.name}
                      </p>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                        First Name <span className="text-[var(--color-danger)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => updateField("first_name", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                        placeholder="e.g. Rebecca"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                        Last Name <span className="text-[var(--color-danger)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => updateField("last_name", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                        placeholder="e.g. Molly"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                        Phone Number <span className="text-[var(--color-danger)]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                        placeholder="+254 700 000 000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                        Identity Document <span className="text-[var(--color-danger)]">*</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateField("id_type", "national_id")}
                          className={`flex-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                            formData.id_type === "national_id"
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                              : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)]"
                          }`}
                        >
                          National ID
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField("id_type", "passport")}
                          className={`flex-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                            formData.id_type === "passport"
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                              : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)]"
                          }`}
                        >
                          Passport
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                        ID/Passport Number <span className="text-[var(--color-danger)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.id_number}
                        onChange={(e) => updateField("id_number", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                        placeholder="ID Number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* VIEW MODE */
              <div className="space-y-4">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center overflow-hidden">
                      {clientData.avatar_image ? (
                        <SecureImage
                          src={clientData.avatar_image}
                          alt="Client avatar"
                          className="w-full h-full object-cover"
                          fallback={<UserCircle size={40} className="text-[var(--color-primary)]" />}
                        />
                      ) : (
                        <UserCircle size={40} className="text-[var(--color-primary)]" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">First Name</p>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{clientData.first_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Last Name</p>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{clientData.last_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Email</p>
                      <p className="text-sm text-[var(--color-ink)]">{clientData.email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Phone</p>
                      <p className="text-sm text-[var(--color-ink)]">{clientData.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Identity Document</p>
                      <p className="text-sm text-[var(--color-ink)]">
                        {clientData.id_type === "passport" ? "Passport" : "National ID"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">ID/Passport Number</p>
                      <p className="text-sm font-mono text-[var(--color-ink)]">{clientData.id_number || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Emergency Contact Section */}
        <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-surface-border)] flex items-center justify-between bg-[var(--color-surface-hover)]/30">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <span className="text-amber-500 text-xs font-bold">EC</span>
              </div>
              <h2 className="text-sm font-bold text-[var(--color-ink)]">Emergency Contact</h2>
            </div>
            {editSection !== "emergency" ? (
              <button
                onClick={() => setEditSection("emergency")}
                className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all"
              >
                <Pencil size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => handleSaveSection("emergency")}
                  disabled={loading}
                  className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50"
                >
                  <Check size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {editSection === "emergency" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                    Next of Kin Name
                  </label>
                  <input
                    type="text"
                    value={formData.next_of_kin_name}
                    onChange={(e) => updateField("next_of_kin_name", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                    Next of Kin Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.next_of_kin_phone}
                    onChange={(e) => updateField("next_of_kin_phone", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Next of Kin Name</p>
                  <p className="text-sm text-[var(--color-ink)]">{clientData.next_of_kin_name || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Next of Kin Phone</p>
                  <p className="text-sm text-[var(--color-ink)]">{clientData.next_of_kin_phone || "—"}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Driving Arrangement Section */}
        <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-surface-border)] flex items-center justify-between bg-[var(--color-surface-hover)]/30">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="text-blue-500 text-xs">🚗</span>
              </div>
              <h2 className="text-sm font-bold text-[var(--color-ink)]">Driving Arrangement</h2>
            </div>
            {editSection !== "driving" ? (
              <button
                onClick={() => setEditSection("driving")}
                className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all"
              >
                <Pencil size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => handleSaveSection("driving")}
                  disabled={loading}
                  className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50"
                >
                  <Check size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {editSection === "driving" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => updateField("driving_arrangement", "self_drive")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.driving_arrangement === "self_drive"
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30"
                    }`}
                  >
                    <div className="text-2xl mb-2"></div>
                    <p className="text-sm font-bold text-[var(--color-ink)]">Self Drive</p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] mt-1">I'll drive myself</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("driving_arrangement", "own_driver")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.driving_arrangement === "own_driver"
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30"
                    }`}
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <p className="text-sm font-bold text-[var(--color-ink)]">My Driver</p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] mt-1">I have my own driver</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("driving_arrangement", "chauffeur")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.driving_arrangement === "chauffeur"
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30"
                    }`}
                  >
                    <div className="text-2xl mb-2">️</div>
                    <p className="text-sm font-bold text-[var(--color-ink)]">Chauffeur</p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] mt-1">Assign agency driver</p>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--color-surface-border)]">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                      Driving License Number
                    </label>
                    <input
                      type="text"
                      value={formData.dl_number}
                      onChange={(e) => updateField("dl_number", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                      placeholder="DL Number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                      DL Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.dl_expiry}
                      onChange={(e) => updateField("dl_expiry", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                      DL Issue Date
                    </label>
                    <input
                      type="date"
                      value={formData.dl_issued_date}
                      onChange={(e) => updateField("dl_issued_date", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">Arrangement Type</p>
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-semibold">
                    <span>
                      {(formData.driving_arrangement === "self_drive" && "🚗 Self Drive") ||
                       (formData.driving_arrangement === "own_driver" && "👤 Own Driver") ||
                       (formData.driving_arrangement === "chauffeur" && "🛡️ Chauffeur")}
                    </span>
                  </div>
                </div>
                {clientData.dl_number && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--color-surface-border)]">
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">License Number</p>
                      <p className="text-sm font-mono text-[var(--color-ink)]">{clientData.dl_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">DL Expiry</p>
                      <p className="text-sm text-[var(--color-ink)]">
                        {clientData.dl_expiry ? new Date(clientData.dl_expiry).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Compliance & Documents Section */}
        <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-surface-border)] flex items-center justify-between bg-[var(--color-surface-hover)]/30">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-[var(--color-primary)]" />
              <h2 className="text-sm font-bold text-[var(--color-ink)]">Compliance & Documents</h2>
            </div>
            {editSection !== "documents" ? (
              <button
                onClick={() => setEditSection("documents")}
                className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all"
              >
                <Pencil size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => handleSaveSection("documents")}
                  disabled={loading}
                  className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50"
                >
                  <Check size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {editSection === "documents" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* ID Front */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--color-ink-muted)]">ID Front</label>
                  <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50 transition-colors overflow-hidden bg-[var(--color-surface-hover)]">
                    {idFrontFile ? (
                      <img src={URL.createObjectURL(idFrontFile)} alt="ID Front preview" className="w-full h-full object-cover" />
                    ) : clientData.id_image_front ? (
                      <SecureImage src={clientData.id_image_front} alt="ID Front" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-ink-subtle)]">
                        <span className="text-[10px]">No image</span>
                      </div>
                    )}
                  </div>
                  <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-ink)] cursor-pointer hover:bg-[var(--color-surface)] transition-colors">
                    <Camera size={14} />
                    {idFrontFile ? "Change Image" : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setIdFrontFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* ID Back */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--color-ink-muted)]">ID Back</label>
                  <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50 transition-colors overflow-hidden bg-[var(--color-surface-hover)]">
                    {idBackFile ? (
                      <img src={URL.createObjectURL(idBackFile)} alt="ID Back preview" className="w-full h-full object-cover" />
                    ) : clientData.id_image_back ? (
                      <SecureImage src={clientData.id_image_back} alt="ID Back" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-ink-subtle)]">
                        <span className="text-[10px]">No image</span>
                      </div>
                    )}
                  </div>
                  <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-ink)] cursor-pointer hover:bg-[var(--color-surface)] transition-colors">
                    <Camera size={14} />
                    {idBackFile ? "Change Image" : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setIdBackFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* DL Front */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--color-ink-muted)]">Driving License</label>
                  <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50 transition-colors overflow-hidden bg-[var(--color-surface-hover)]">
                    {dlFrontFile ? (
                      <img src={URL.createObjectURL(dlFrontFile)} alt="DL preview" className="w-full h-full object-cover" />
                    ) : clientData.dl_image_front ? (
                      <SecureImage src={clientData.dl_image_front} alt="DL Front" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-ink-subtle)]">
                        <span className="text-[10px]">No image</span>
                      </div>
                    )}
                  </div>
                  <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-ink)] cursor-pointer hover:bg-[var(--color-surface)] transition-colors">
                    <Camera size={14} />
                    {dlFrontFile ? "Change Image" : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDlFrontFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {clientData.id_image_front && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-[var(--color-ink-muted)]">ID Front</p>
                    <div className="aspect-[3/4] rounded-xl overflow-hidden border border-[var(--color-surface-border)]">
                      <SecureImage src={clientData.id_image_front} alt="ID Front" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                {clientData.id_image_back && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-[var(--color-ink-muted)]">ID Back</p>
                    <div className="aspect-[3/4] rounded-xl overflow-hidden border border-[var(--color-surface-border)]">
                      <SecureImage src={clientData.id_image_back} alt="ID Back" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                {clientData.dl_image_front && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-[var(--color-ink-muted)]">Driving License</p>
                    <div className="aspect-[3/4] rounded-xl overflow-hidden border border-[var(--color-surface-border)]">
                      <SecureImage src={clientData.dl_image_front} alt="DL Front" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                {!clientData.id_image_front && !clientData.id_image_back && !clientData.dl_image_front && (
                  <p className="text-sm text-[var(--color-ink-muted)] col-span-3 text-center py-8">
                    No documents uploaded yet
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
