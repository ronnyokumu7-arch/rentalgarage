"use client";

import React from "react";
import { Upload, User, CreditCard, Car, CheckCircle2 } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import type { Client } from "@/lib/types";

type UploadType = "avatar" | "id_front" | "dl_front";

interface DocumentUploadCardProps {
  client: Client;
  onUpload: (type: UploadType, file: File) => void;
}

export default function DocumentUploadCard({ 
  client, 
  onUpload 
}: DocumentUploadCardProps) {
  
  const handleFileChange = (type: UploadType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(type, e.target.files[0]);
      // Reset input value to allow re-uploading same file if needed
      e.target.value = '';
    }
  };

  const UploadSlot = ({ 
    type, 
    label, 
    sublabel,
    icon: Icon, 
    hasFile 
  }: { 
    type: UploadType; 
    label: string; 
    sublabel: string;
    icon: React.ElementType; 
    hasFile: boolean; 
  }) => (
    <label className={`relative flex items-center justify-between min-h-[48px] sm:min-h-0 p-3 sm:p-2.5 rounded-lg border transition-all duration-150 cursor-pointer active:scale-[0.99] select-none group ${
      hasFile 
        ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 active:bg-emerald-500/15" 
        : "border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 active:bg-[var(--color-primary)]/10"
    }`}>
      <input
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={(e) => handleFileChange(type, e)}
      />
      
      {/* Left side: Icon + Text */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`p-2 sm:p-1.5 rounded-md transition-colors shrink-0 ${
          hasFile
            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            : "bg-[var(--color-surface)] text-[var(--color-ink-subtle)] border border-[var(--color-surface-border)] group-hover:text-[var(--color-primary)] group-hover:border-[var(--color-primary)]/20"
        }`}>
          <Icon size={16} className="sm:w-3.5 sm:h-3.5" />
        </div>
        
        <div className="min-w-0">
          <span className={`block text-xs font-bold truncate leading-tight ${
            hasFile ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--color-ink)] group-hover:text-[var(--color-primary)]'
          }`}>
            {label}
          </span>
          <span className={`block text-[10px] font-mono truncate leading-tight mt-0.5 ${
            hasFile ? 'text-emerald-500/70 font-semibold' : 'text-[var(--color-ink-muted)]'
          }`}>
            {hasFile ? "Uploaded ✓" : sublabel}
          </span>
        </div>
      </div>

      {/* Right side: Action / Indicator */}
      <div className="shrink-0 ml-2">
        {hasFile ? (
          <CheckCircle2 size={16} className="text-emerald-500 sm:w-3.5 sm:h-3.5" />
        ) : (
          <div className="p-1.5 sm:p-1 rounded-md text-[var(--color-ink-subtle)] group-hover:text-[var(--color-primary)] group-hover:bg-[var(--color-surface)] transition-all">
            <Upload size={14} className="sm:w-3.5 sm:h-3.5" />
          </div>
        )}
      </div>
    </label>
  );

  return (
    <SectionCard className="!p-0 overflow-hidden shadow-2xs border-[var(--color-surface-border)] rounded-xl">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="flex items-center gap-2 min-w-0">
          <Upload size={14} className="text-[var(--color-primary)] shrink-0" />
          <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider truncate">
            Document Verification
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--color-ink-muted)] shrink-0 ml-2">
          PDF or Image format
        </span>
      </div>

      {/* Compact Grid */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-2">
        <UploadSlot 
          type="avatar" 
          label="Avatar Photo" 
          sublabel="Profile picture"
          icon={User} 
          hasFile={!!client.avatar_image} 
        />
        
        <UploadSlot 
          type="id_front" 
          label="ID Front" 
          sublabel="Government ID"
          icon={CreditCard} 
          hasFile={!!client.id_image_front} 
        />
        <UploadSlot 
          type="dl_front" 
          label="DL Front" 
          sublabel="Driver's license"
          icon={Car} 
          hasFile={!!client.dl_image_front} 
        />
      </div>
    </SectionCard>
  );
}
