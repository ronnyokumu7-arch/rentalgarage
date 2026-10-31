// src/components/client/form/types.ts
export interface DocSlotProps {
  label: string;
  icon: React.ElementType;
  file: File | null;
  setFile?: (f: File | null) => void;
  required?: boolean;
  existingUrl?: string | null;
  captureMode?: "user" | "environment" | "optional";
  error?: string;
  fieldId?: string;
}

export interface SectionProps {
  formData: Record<string, string>;
  updateField: (field: string, value: string) => void;
  fieldErrors: Record<string, string>;
  hasErr: (key: string) => boolean;
  inputCls: (key: string) => string;
  renderError: (key: string) => React.ReactNode;
  openLightbox: (url: string, title: string) => void;
}

export interface TenantBranding {
  name: string;
  logo?: string;
  phone?: string;
  email?: string;
}

export const formatDateToLocalYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
