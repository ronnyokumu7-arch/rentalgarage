"use client";

import { useState } from "react";
import { CalendarDots as CalendarDays, MapPin, CheckCircle, Clock, FileText, PaperPlaneTilt as Send, Compass, ShieldCheck } from "@phosphor-icons/react/ssr";

interface BookingTripDetailsProps {
  isEditing: boolean;
  formData: any;
  setFormData: (data: any) => void;
  contractStatus?: string;
}

// ✅ BRAND TOKENS: Responsive form styling for mobile & desktop
const inputClass = "w-full px-3 py-2 sm:py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-xs sm:text-sm";
const labelClass = "text-[9px] sm:text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1 sm:mb-1.5 block";
const valueClass = "text-xs sm:text-sm font-medium text-[var(--color-ink)] py-1 sm:py-2 flex items-center gap-2 truncate";

// ✅ PREMIUM CONTRACT LIFECYCLE TRACKER
const ContractLifecycleTracker = ({ status }: { status?: string }) => {
  const stages = [
    { key: "draft", label: "Draft Created", icon: FileText },
    { key: "sent", label: "Sent to Client", icon: Send },
    { key: "viewed", label: "Client Viewed", icon: Clock },
    { key: "signed", label: "Fully Executed", icon: CheckCircle },
  ];

  const getCurrentStageIndex = () => {
    if (!status) return -1;
    const index = stages.findIndex(s => s.key === status);
    return index === -1 ? -1 : index;
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative pl-1 sm:pl-2">
        {/* Vertical Track Line */}
        <div className="absolute left-[20px] sm:left-[27px] top-3 sm:top-4 bottom-3 sm:bottom-4 w-px bg-[var(--color-surface-border)]" />
        
        {/* Active Progress Line */}
        {currentIndex >= 0 && (
          <div 
            className="absolute left-[20px] sm:left-[27px] top-3 sm:top-4 w-px bg-emerald-500 transition-all duration-500 ease-out"
            style={{ 
              height: `${Math.min(100, (currentIndex / (stages.length - 1)) * 100)}%`,
              maxHeight: 'calc(100% - 1.75rem)'
            }}
          />
        )}

        {/* Stage Nodes */}
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          
          return (
            <div key={stage.key} className="relative flex items-start gap-3 sm:gap-4 py-2.5 sm:py-3 last:pb-0">
              {/* Node Circle */}
              <div className={`
                relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300
                ${isCompleted 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' 
                  : isCurrent 
                    ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20 text-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/10' 
                    : 'bg-[var(--color-surface-hover)] border-[var(--color-surface-border)] text-[var(--color-ink-subtle)]'}
              `}>
                <Icon size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
              </div>

              {/* Stage Info */}
              <div className="pt-1 sm:pt-2 min-w-0">
                <p className={`text-[11px] sm:text-xs font-bold truncate ${
                  isCompleted || isCurrent ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'
                }`}>
                  {stage.label}
                </p>
                {isCurrent && (
                  <p className="text-[9px] sm:text-[10px] text-[var(--color-primary)] font-semibold mt-0.5">
                    Current Stage
                  </p>
                )}
                {isFuture && (
                  <p className="text-[9px] sm:text-[10px] text-[var(--color-ink-subtle)] mt-0.5">
                    Pending
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function BookingTripDetails({ 
  isEditing, 
  formData, 
  setFormData, 
  contractStatus 
}: BookingTripDetailsProps) {
  const [activeTab, setActiveTab] = useState<"trip" | "contract">("trip");

  const tripFields = [
    { key: 'destination', label: 'Destination', icon: MapPin, type: 'text' },
    { key: 'pickup_location', label: 'Pickup Location', icon: MapPin, type: 'text' },
    { key: 'return_location', label: 'Return Location', icon: MapPin, type: 'text' },
    { key: 'start_date', label: 'Rental Start Date', icon: CalendarDays, type: 'date' },
    { key: 'end_date', label: 'Rental End Date', icon: CalendarDays, type: 'date' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* SEGMENTED TAB TOGGLE */}
      <div className="flex items-center p-1 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab("trip")}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 sm:py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === "trip"
              ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs border border-[var(--color-surface-border)]"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          <Compass size={14} className={activeTab === "trip" ? "text-[var(--color-primary)]" : "text-[var(--color-ink-subtle)]"} aria-hidden="true" />
          <span>Trip Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contract")}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 sm:py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === "contract"
              ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs border border-[var(--color-surface-border)]"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          <ShieldCheck size={14} className={activeTab === "contract" ? "text-[var(--color-primary)]" : "text-[var(--color-ink-subtle)]"} aria-hidden="true" />
          <span>Contract Lifecycle</span>
        </button>
      </div>

      {/* TAB CONTENT VIEWS */}
      {activeTab === "trip" ? (
        <div className="space-y-3.5 sm:space-y-5 animate-in fade-in duration-200">
          <div className="space-y-3 sm:space-y-4 max-w-2xl">
            {tripFields.map((field) => (
              <div key={field.key} className="min-w-0">
                <label className={labelClass}>{field.label}</label>
                {isEditing ? (
                  <input 
                    type={field.type} 
                    value={formData[field.key] || ''} 
                    onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                    className={inputClass} 
                  />
                ) : (
                  <div className={valueClass}>
                    <field.icon size={14} className="shrink-0 text-[var(--color-ink-subtle)]" aria-hidden="true" />
                    <span className="truncate">
                      {field.type === 'date' && formData[field.key] 
                        ? new Date(formData[field.key]).toLocaleDateString() 
                        : (formData[field.key] || "Not specified")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-200 max-w-xl">
          <ContractLifecycleTracker status={contractStatus} />
        </div>
      )}

    </div>
  );
}
