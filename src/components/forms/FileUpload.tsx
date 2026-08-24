"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, X, FileImage, AlertCircle } from "lucide-react";

interface FileUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  shape?: "square" | "circle";
}

// ✅ MILESTONE: Smartphone/scanner-friendly accept list.
// iPhone HEIC/HEIF, Android AVIF, scanners (BMP/TIFF), plus standard web formats + PDF.
const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif,image/bmp,image/tiff,application/pdf";

export default function FileUpload({
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 25,   // ✅ MILESTONE: 25 MB raw (server compresses to ≤4 MB stored)
  preview = true,
  label = "Upload file",
  hint,
  error,
  disabled = false,
  className = "",
  shape = "square",
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayError = error || localError;

  // Generate preview URL when file changes
  React.useEffect(() => {
    if (value && preview) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
    return undefined;
  }, [value, preview]);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size is ${maxSizeMB}MB.`;
    }
    if (accept !== "*" && accept !== "*/*") {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith("/*")) {
          const base = type.split("/")[0];
          return file.type.startsWith(base + "/");
        }
        return file.type === type;
      });
      if (!isAccepted) return `File type not accepted. Try a JPG, PNG, or PDF.`;
    }
    return null;
  };

  const handleFile = (file: File | null) => {
    setLocalError(null);
    if (!file) {
      onChange(null);
      return;
    }
    const validationError = validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    onChange(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl";

  // Preview mode with image
  if (preview && previewUrl) {
    return (
      <div className={className}>
        {label && <label className="label">{label}</label>}
        <div className="relative group inline-block">
          <div
            className={`${shapeClass} overflow-hidden border-2 border-surface-border
              bg-surface-hover ${
                shape === "circle" ? "w-24 h-24" : "w-32 h-32"
              }`}
          >
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full
                bg-danger text-white flex items-center justify-center
                shadow-md hover:bg-danger/90 transition-colors
                opacity-0 group-hover:opacity-100"
              aria-label="Remove file"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          )}
          {!disabled && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center
                bg-black/40 text-white opacity-0 group-hover:opacity-100
                transition-opacity text-xs font-medium"
            >
              Change
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        {displayError && (
          <p className="flex items-center gap-1.5 mt-2 text-xs text-danger font-medium">
            <AlertCircle size={13} strokeWidth={2} />
            {displayError}
          </p>
        )}
        {!displayError && hint && (
          <p className="mt-2 text-xs text-ink-subtle">{hint}</p>
        )}
      </div>
    );
  }

  // Drop zone mode
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2
          px-6 py-8 rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-150
          ${
            dragOver
              ? "border-accent bg-accent-bg"
              : displayError
              ? "border-danger bg-danger-bg/30"
              : "border-surface-border bg-surface hover:border-accent hover:bg-accent-bg/30"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center
            ${dragOver ? "bg-accent text-white" : "bg-accent-bg text-accent-dark"}`}
        >
          {value ? (
            <FileImage size={20} strokeWidth={1.8} />
          ) : (
            <Upload size={20} strokeWidth={1.8} />
          )}
        </div>

        {value ? (
          <div className="text-center">
            <p className="text-sm font-medium text-ink truncate max-w-[200px]">
              {value.name}
            </p>
            <p className="text-xs text-ink-muted mt-0.5">
              {(value.size / 1024).toFixed(1)} KB · Click to replace
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-ink">
              <span className="text-accent-dark">Click to upload</span> or drag
              and drop
            </p>
            <p className="text-xs text-ink-muted mt-0.5">
              {hint || `Up to ${maxSizeMB}MB — JPG, PNG, HEIC, PDF accepted. We compress automatically.`}
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {displayError && (
        <p className="flex items-center gap-1.5 mt-2 text-xs text-danger font-medium">
          <AlertCircle size={13} strokeWidth={2} />
          {displayError}
        </p>
      )}
    </div>
  );
}
