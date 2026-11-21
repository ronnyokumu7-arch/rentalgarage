import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api-client";
import { tenantProfileApi, TenantProfilePayload } from "@/lib/api/tenant-profile";
import { tenantsApi } from "@/lib/api/tenants";
import { usersApi } from "@/lib/api/users";
import { useAuth } from "@/context/auth-context";
import type { Tenant, User } from "@/lib/types";

export interface BusinessFormValues {
  company_name: string;
  email: string;
  phone: string;
  website: string;
  business_location: string;
  kra_pin: string;
  contract_terms: string;
  contract_footer: string;
  company_signature_path: string; // ✅ NEW: Agency default contract signature
}

export interface AdminFormValues {
  full_name: string;
  email: string;
  phone_number: string;
}

// ✅ Client-side logo compression → compact data-URL (keeps payloads small)
function fileToDataUrl(file: File, maxDim = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unsupported"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Invalid image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function useBusinessSettings() {
  const { refresh, refreshTenant } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLogoDirty, setIsLogoDirty] = useState(false);
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const businessRef = useRef<BusinessFormValues | null>(null);
  const adminRef = useRef<AdminFormValues | null>(null);
  const savedLogoRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue, // ✅ NEW: Exposed for manual signature pad updates
    formState: { errors, isDirty },
  } = useForm<BusinessFormValues>({
    defaultValues: {
      company_name: "",
      email: "",
      phone: "",
      website: "",
      business_location: "",
      kra_pin: "",
      contract_terms: "",
      contract_footer: "",
      company_signature_path: "", // ✅ NEW
    },
  });

  const {
    register: registerAdmin,
    handleSubmit: handleSubmitAdmin,
    reset: resetAdmin,
    watch: watchAdmin,
    formState: { errors: adminErrors, isDirty: isAdminDirty },
  } = useForm<AdminFormValues>({
    defaultValues: { full_name: "", email: "", phone_number: "" },
  });

  const businessData = watch();
  const adminData = watchAdmin();

  const applyBusiness = useCallback(
    (vals: BusinessFormValues) => {
      businessRef.current = vals;
      reset(vals);
    },
    [reset]
  );

  const applyAdmin = useCallback(
    (vals: AdminFormValues) => {
      adminRef.current = vals;
      resetAdmin(vals);
    },
    [resetAdmin]
  );

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profile, userRes] = await Promise.all([
        tenantProfileApi.get().catch(() => null),
        apiClient.get<User>("/auth/me").catch(() => null),
      ]);

      let tenant = null;
      if (userRes?.data?.tenant_id) {
        tenant = await tenantsApi.getById(userRes.data.tenant_id).catch(() => null);
      }

      if (profile) {
        applyBusiness({
          company_name: profile.company_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          website: profile.website || "",
          business_location: profile.address || "",
          kra_pin: profile.tax_number || "",
          contract_terms: profile.contract_terms || "",
          contract_footer: profile.contract_footer || "",
          company_signature_path: profile.company_signature_path || "", // ✅ NEW
        });
        const logo = profile.logo_url || null;
        savedLogoRef.current = logo;
        setLogoPreview(logo);
        setIsLogoDirty(false);
      }

      if (tenant) {
        setActiveTenant(tenant);
        applyAdmin({
          full_name: tenant.admin_name || tenant.name || "",
          email: tenant.admin_email || tenant.email || "",
          phone_number: tenant.admin_phone || tenant.phone_number || "",
        });
      }

      setHasLoaded(true);
    } catch (error) {
      console.error("Failed to load business settings:", error);
      toast.error("Failed to load business settings");
    } finally {
      setIsLoading(false);
    }
  }, [applyBusiness, applyAdmin]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setLogoPreview(dataUrl);
      setIsLogoDirty(true);
    } catch (error) {
      console.error("Failed to process logo:", error);
      toast.error("Could not process that image");
    }
  };

  const onSubmit = async (data: BusinessFormValues) => {
    setIsSaving(true);
    try {
      const payload: TenantProfilePayload = {
        company_name: data.company_name,
        email: data.email,
        phone: data.phone,
        website: data.website,
        business_location: data.business_location,
        kra_pin: data.kra_pin,
        contract_terms: data.contract_terms,
        contract_footer: data.contract_footer,
        company_signature_path: data.company_signature_path || undefined, // ✅ NEW
        ...(logoPreview ? { logo_url: logoPreview } : {}),
      };

      const updatedProfile = await tenantProfileApi.update(payload);

      applyBusiness({
        company_name: updatedProfile.company_name || "",
        email: updatedProfile.email || "",
        phone: updatedProfile.phone || "",
        website: updatedProfile.website || "",
        business_location: updatedProfile.address || "",
        kra_pin: updatedProfile.tax_number || "",
        contract_terms: updatedProfile.contract_terms || "",
        contract_footer: updatedProfile.contract_footer || "",
        company_signature_path: updatedProfile.company_signature_path || "", // ✅ NEW
      });

      savedLogoRef.current = updatedProfile.logo_url || null;
      setLogoPreview(updatedProfile.logo_url || null);
      setIsLogoDirty(false);

      await refreshTenant();

      toast.success("Company profile updated successfully");
    } catch (error: any) {
      console.error("Failed to update company settings:", error);
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to update company settings");
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitAdmin = async (data: AdminFormValues) => {
    if (!activeTenant?.owner_id) {
      toast.error("Unable to identify administrator account");
      return;
    }

    setIsSavingAdmin(true);
    try {
      const updatedUser = await usersApi.update(activeTenant.owner_id, {
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
      });

      applyAdmin({
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        phone_number: updatedUser.phone_number || "",
      });

      await refresh();
      toast.success("Administrator details updated successfully");
    } catch (error: any) {
      console.error("Failed to update admin account:", error);
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to update admin account");
    } finally {
      setIsSavingAdmin(false);
    }
  };

  const discardChanges = useCallback(() => {
    if (businessRef.current) reset(businessRef.current);
    if (adminRef.current) resetAdmin(adminRef.current);
    setLogoPreview(savedLogoRef.current);
    setIsLogoDirty(false);
  }, [reset, resetAdmin]);

  return {
    isLoading,
    isSaving,
    isSavingAdmin,
    logoPreview,
    isLogoDirty,
    adminUser: activeTenant,
    businessData,
    adminData,
    hasLoaded,
    register,
    handleSubmit,
    reset,
    setValue, // ✅ NEW: Exposed for signature pad
    errors,
    isDirty,
    registerAdmin,
    handleSubmitAdmin,
    resetAdmin,
    adminErrors,
    isAdminDirty,
    handleLogoChange,
    onSubmit,
    onSubmitAdmin,
    discardChanges,
  };
}

export type UseBusinessSettingsReturn = ReturnType<typeof useBusinessSettings>;
