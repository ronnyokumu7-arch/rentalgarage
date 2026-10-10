// src/app/dashboard/clients/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Pencil, X, Check, Camera, UserCircle, FileText, Phone, Mail, Calendar, Car } from "lucide-react";
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
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
        toast.error("Failed to load client data");
        router.push("/dashboard/clients");
      } finally {
        setIsFetching(false);
      }
    };

    if (clientId && !isNaN(clientId)) loadClient();
  }, [clientId, router]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSection = async (section: EditSection) => {
    if (!clientData) return;
    setLoading(true);
    try {
      const payload: any = {};
      
      if (section === "identity") {
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
        const uploads = [];
        if (idFrontFile) uploads.push(clientsApi.uploadIdFront(clientId, idFrontFile));
        if (idBackFile) uploads.push(clientsApi.uploadIdBack(clientId, idBackFile));
        if (dlFrontFile) uploads.push(clientsApi.uploadDlFront(clientId, dlFrontFile));
        if (uploads.length) await Promise.all(uploads);
        toast.success("Documents uploaded!");
        const refreshed = await clientsApi.get(clientId);
        setClientData(refreshed);
        setEditSection(null);
        setLoading(false);
        return;
      }

      if (Object.keys(payload).length) {
        await clientsApi.update(clientId, payload);
      }

      const refreshed = await clientsApi.get(clientId);
      setClientData(refreshed);
      toast.success("Saved successfully!");
      setEditSection(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
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

  if (isFetching || !clientData) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-surface-border)] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
            <ArrowLeft size={20} className="text-[var(--color-ink)]" />
          </button>
          <h1 className="text-base font-bold text-[var(--color-ink)] truncate max-w-[200px]">
            {clientData.first_name} {clientData.last_name}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        
        {/* 1. IDENTITY SECTION */}
        <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-surface-border)] flex items-center justify-between bg-[var(--color-surface-hover)]/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <UserCircle size={18} className="text-purple-600" />
              </div>
              <h2 className="font-bold text-[var(--color-ink)]">Identity</h2>
            </div>
            {editSection !== "identity" ? (
              <button onClick={() => setEditSection("identity")} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
                <Pencil size={16} className="text-[var(--color-ink-muted)]" />
              </button>
            ) : (
              <div className="flex gap-1">
                <button onClick={handleCancelEdit} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)]"><X size={16} /></button>
                <button onClick={() => handleSaveSection("identity")} disabled={loading} className="p-2 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-50">
                  <Check size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="p-4">
            {editSection === "identity" ? (
              <div className="space-y-4">
                <div className="flex justify-center mb-2">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center overflow-hidden border border-[var(--color-surface-border)]">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : clientData.avatar_image ? (
                        <SecureImage src={clientData.avatar_image} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle size={40} className="text-purple-600" />
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-[var(--color-primary-hover)] transition-colors">
                      <Camera size={16} />
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
                      }} className="hidden" />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={formData.first_name} onChange={(e) => updateField("first_name", e.target.value)} placeholder="First Name" className="px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none" />
                  <input value={formData.last_name} onChange={(e) => updateField("last_name", e.target.value)} placeholder="Last Name" className="px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none" />
                  <input value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="Email Address" type="email" className="px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none sm:col-span-2" />
                  <input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="Phone Number" type="tel" className="px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none sm:col-span-2" />
                  
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase mb-1.5 block">ID Type</label>
                    <div className="flex gap-2">
                      {(["national_id", "passport"] as const).map((type) => (
                        <button key={type} onClick={() => updateField("id_type", type)} className={`flex-1 px-3 py-2 rounded-xl border text-xs font-semibold capitalize transition-all ${formData.id_type === type ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)]"}`}>
                          {type.replace("_", " ")}
                        </button>
                    ))}
                    </div>
                  </div>
                  <input value={formData.id_number} onChange={(e) => updateField("id_number", e.target.value)} placeholder="ID / Passport Number" className="px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none sm:col-span-2" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center flex-shrink-0 border border-[var(--color-surface-border)]">
                    {clientData.avatar_image ? (
                      <SecureImage src={clientData.avatar_image} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <UserCircle size={32} className="text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--color-ink)] text-lg">{clientData.first_name} {clientData.last_name}</p>
                    <div className="flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] mt-1">
                      <Phone size={14} />
                      <span>{clientData.phone}</span>
                    </div>
                    {clientData.email && (
                      <div className="flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] mt-1">
                        <Mail size={14} />
                        <span className="truncate">{clientData.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-3 border-t border-[var(--color-surface-border)] grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">ID Type</p>
                    <p className="text-sm font-medium text-[var(--color-ink)] mt-1 capitalize">{clientData.id_type?.replace("_", " ") || "National ID"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">ID Number</p>
                    <p className="text-sm font-mono text-[var(--color-ink)] mt-1">{clientData.id_number || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. EMERGENCY CONTACT */}
        <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-surface-border)] flex items-center justify-between bg-[var(--color-surface-hover)]/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <span className="text-xs font-bold text-amber-600">EC</span>
              </div>
              <h2 className="font-bold text-[var(--color-ink)]">Emergency Contact</h2>
            </div>
            {editSection !== "emergency" ? (
              <button onClick={() => setEditSection("emergency")} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
                <Pencil size={16} className="text-[var(--color-ink-muted)]" />
              </button>
            ) : (
              <div className="flex gap-1">
                <button onClick={handleCancelEdit} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)]"><X size={16} /></button>
                <button onClick={() => handleSaveSection("emergency")} disabled={loading} className="p-2 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-50"><Check size={16} /></button>
              </div>
            )}
          </div>
          <div className="p-4">
            {editSection === "emergency" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={formData.next_of_kin_name} onChange={(e) => updateField("next_of_kin_name", e.target.value)} placeholder="Next of Kin Name" className="px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none sm:col-span-2" />
                <input value={formData.next_of_kin_phone} onChange={(e) => updateField("next_of_kin_phone", e.target.value)} placeholder="Next of Kin Phone" type="tel" className="px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none sm:col-span-2" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Next of Kin</p>
                  <p className="text-sm font-medium text-[var(--color-ink)] mt-1">{clientData.next_of_kin_name || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Phone</p>
                  <p className="text-sm text-[var(--color-ink)] mt-1">{clientData.next_of_kin_phone || "—"}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 3. DRIVING ARRANGEMENT */}
        <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-surface-border)] flex items-center justify-between bg-[var(--color-surface-hover)]/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Car size={16} className="text-blue-600" />
              </div>
              <h2 className="font-bold text-[var(--color-ink)]">Driving</h2>
            </div>
            {editSection !== "driving" ? (
              <button onClick={() => setEditSection("driving")} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
                <Pencil size={16} className="text-[var(--color-ink-muted)]" />
              </button>
            ) : (
              <div className="flex gap-1">
                <button onClick={handleCancelEdit} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)]"><X size={16} /></button>
                <button onClick={() => handleSaveSection("driving")} disabled={loading} className="p-2 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-50"><Check size={16} /></button>
              </div>
            )}
          </div>
          <div className="p-4">
            {editSection === "driving" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase mb-2 block">Arrangement Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["self_drive", "own_driver", "chauffeur"] as const).map((arr) => (
                      <button key={arr} onClick={() => updateField("driving_arrangement", arr)} className={`p-3 rounded-xl border text-xs font-semibold capitalize transition-all ${formData.driving_arrangement === arr ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-primary)]/30"}`}>
                        {arr.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--color-surface-border)]">
                  <input value={formData.dl_number} onChange={(e) => updateField("dl_number", e.target.value)} placeholder="DL Number" className="px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none" />
                  <input value={formData.dl_expiry} onChange={(e) => updateField("dl_expiry", e.target.value)} type="date" className="px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none" />
                  <input value={formData.dl_issued_date} onChange={(e) => updateField("dl_issued_date", e.target.value)} type="date" className="px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none sm:col-span-2" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Arrangement</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-sm font-semibold mt-1 capitalize">
                    {(formData.driving_arrangement || "self_drive").replace("_", " ")}
                  </div>
                </div>
                {clientData.dl_number && (
                  <div className="pt-3 border-t border-[var(--color-surface-border)] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">License Number</p>
                      <p className="text-sm font-mono text-[var(--color-ink)] mt-1">{clientData.dl_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">DL Expiry</p>
                      <div className="flex items-center gap-1.5 text-sm text-[var(--color-ink)] mt-1">
                        <Calendar size={14} className="text-[var(--color-ink-muted)]" />
                        <span>{clientData.dl_expiry ? new Date(clientData.dl_expiry).toLocaleDateString() : "—"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 4. DOCUMENTS (Compact Grid) */}
        <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-surface-border)] flex items-center justify-between bg-[var(--color-surface-hover)]/30">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[var(--color-primary)]" />
              <h2 className="font-bold text-[var(--color-ink)]">Documents</h2>
            </div>
            {editSection !== "documents" ? (
              <button onClick={() => setEditSection("documents")} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
                <Pencil size={16} className="text-[var(--color-ink-muted)]" />
              </button>
            ) : (
              <div className="flex gap-1">
                <button onClick={handleCancelEdit} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)]"><X size={16} /></button>
                <button onClick={() => handleSaveSection("documents")} disabled={loading} className="p-2 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-50"><Check size={16} /></button>
              </div>
            )}
          </div>
          <div className="p-4">
            {editSection === "documents" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: "idFront", label: "ID Front", file: idFrontFile, setFile: setIdFrontFile, existing: clientData.id_image_front },
                  { key: "idBack", label: "ID Back", file: idBackFile, setFile: setIdBackFile, existing: clientData.id_image_back },
                  { key: "dlFront", label: "DL Front", file: dlFrontFile, setFile: setDlFrontFile, existing: clientData.dl_image_front },
                ].map((doc) => (
                  <div key={doc.key} className="space-y-1.5">
                    <div className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-surface-border)] overflow-hidden bg-[var(--color-surface-hover)] relative group cursor-pointer hover:border-[var(--color-primary)]/50 transition-colors">
                      {doc.file ? (
                        <img src={URL.createObjectURL(doc.file)} alt={doc.label} className="w-full h-full object-cover" />
                      ) : doc.existing ? (
                        <SecureImage src={doc.existing} alt={doc.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-subtle)]">
                          <Camera size={20} className="mb-1" />
                          <span className="text-[10px]">Upload</span>
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera size={20} className="text-white" />
                        <input type="file" accept="image/*" onChange={(e) => doc.setFile(e.target.files?.[0] || null)} className="hidden" />
                      </label>
                    </div>
                    <p className="text-[10px] font-medium text-center text-[var(--color-ink-muted)]">{doc.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {clientData.id_image_front && (
                  <div className="space-y-1.5">
                    <div className="aspect-square rounded-xl overflow-hidden border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]">
                      <SecureImage src={clientData.id_image_front} alt="ID Front" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] font-medium text-center text-[var(--color-ink-muted)]">ID Front</p>
                  </div>
                )}
                {clientData.id_image_back && (
                  <div className="space-y-1.5">
                    <div className="aspect-square rounded-xl overflow-hidden border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]">
                      <SecureImage src={clientData.id_image_back} alt="ID Back" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] font-medium text-center text-[var(--color-ink-muted)]">ID Back</p>
                  </div>
                )}
                {clientData.dl_image_front && (
                  <div className="space-y-1.5">
                    <div className="aspect-square rounded-xl overflow-hidden border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]">
                      <SecureImage src={clientData.dl_image_front} alt="DL" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] font-medium text-center text-[var(--color-ink-muted)]">DL Front</p>
                  </div>
                )}
                {!clientData.id_image_front && !clientData.id_image_back && !clientData.dl_image_front && (
                  <div className="col-span-2 sm:col-span-3 py-8 text-center">
                    <FileText size={24} className="mx-auto text-[var(--color-ink-subtle)] mb-2" />
                    <p className="text-sm text-[var(--color-ink-muted)]">No documents uploaded yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
