"use client";

import { useState } from "react";
import { MapPin, House as Home, Briefcase, PencilSimple as Pencil, FloppyDisk as Save, X } from "@phosphor-icons/react/ssr";
import SectionCard from "@/components/ui/SectionCard";
import type { Client } from "@/lib/types";

interface AddressCardProps {
  client: Client;
  onSave: (data: Partial<Client>) => void;
}

export default function AddressCard({ client, onSave }: AddressCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"residential" | "work">("residential");
  const [formData, setFormData] = useState({
    residential_address: client.residential_address || "",
    work_address: client.work_address || "",
  });

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const currentAddress = activeTab === "residential" ? formData.residential_address : formData.work_address;
  const Icon = activeTab === "residential" ? Home : Briefcase;

  return (
    <SectionCard className="!p-0 overflow-hidden shadow-2xs border-[var(--color-surface-border)] rounded-xl">
      
      {/* Sleek Minimal Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/10">
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-[var(--color-primary)]" aria-hidden="true" />
          <h3 className="text-[10px] font-mono font-bold text-[var(--color-ink)] uppercase tracking-widest">
            Location Details
          </h3>
        </div>

        {/* Clear Segmented Toggle */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
          <button
            onClick={() => setActiveTab("residential")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
              activeTab === "residential" 
                ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-xs border border-[var(--color-surface-border)]" 
                : "text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]"
            }`}
          >
            <Home size={11} aria-hidden="true" />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab("work")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
              activeTab === "work" 
                ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-xs border border-[var(--color-surface-border)]" 
                : "text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]"
            }`}
          >
            <Briefcase size={11} aria-hidden="true" />
            <span>Work</span>
          </button>
        </div>
      </div>

      {/* Unboxed Content Area */}
      <div className="p-3.5">
        {isEditing ? (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--color-ink-muted)] flex items-center gap-1.5">
                <Icon size={11} className="text-[var(--color-primary)]" aria-hidden="true" />
                Editing {activeTab === "residential" ? "Home" : "Work"} Address
              </span>
            </div>

            <textarea
              value={currentAddress}
              onChange={(e) => setFormData({ ...formData, [`${activeTab === "residential" ? "residential" : "work"}_address`]: e.target.value })}
              className="w-full p-2.5 text-xs font-mono border border-[var(--color-surface-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none h-20 resize-none transition-all shadow-2xs"
              placeholder={`Enter ${activeTab === "residential" ? "home" : "work"} address...`}
              autoFocus
            />
            
            <div className="flex justify-end gap-1.5">
              <button 
                onClick={() => setIsEditing(false)} 
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <X size={11} aria-hidden="true" />
                <span>Cancel</span>
              </button>
              <button 
                onClick={handleSave} 
                className="flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
              >
                <Save size={11} aria-hidden="true" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="group relative pl-3 border-l-2 border-transparent hover:border-[var(--color-primary)]/40 transition-all duration-200">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--color-ink-muted)] flex items-center gap-1.5">
                <Icon size={11} className="text-[var(--color-ink-subtle)]" aria-hidden="true" />
                {activeTab === "residential" ? "Home Address" : "Work Place / Business"}
              </span>

              {/* Hover Edit Action */}
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded opacity-0 group-hover:opacity-100 text-[var(--color-ink-subtle)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] transition-all"
                title="Edit Address"
              >
                <Pencil size={11} aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs font-mono text-[var(--color-ink)] leading-relaxed break-words pr-2">
              {currentAddress || (
                <span className="text-[var(--color-ink-subtle)] italic font-sans text-[11px]">
                  No {activeTab === "residential" ? "home" : "work"} address on record
                </span>
              )}
            </p>
          </div>
        )}
      </div>

    </SectionCard>
  );
}
