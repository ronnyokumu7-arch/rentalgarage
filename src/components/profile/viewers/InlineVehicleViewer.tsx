"use client";

import {
  FloppyDisk as Save, CircleNotch as Loader2, Car, Calendar, CurrencyDollar as DollarSign, Gauge,
  Shield, FileText, Upload, MagnifyingGlassPlus as ZoomIn, X, PencilSimple as Pencil,
  CheckCircle, Warning as AlertTriangle, ArrowCounterClockwise as RotateCcw
} from "@phosphor-icons/react/ssr";
import { useInlineVehicle } from "@/hooks/profile/useInlineVehicle";
import type { Vehicle, Task } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import TaskContextBar from "../TaskContextBar";
import OverlayPortal from "@/components/ui/OverlayPortal";

interface InlineVehicleViewerProps {
  vehicle: Vehicle;
  task?: Task;
  onRefresh: () => void;
}

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "danger" | "accent"> = {
  pending_activation: "warning",
  available: "success",
  rented: "accent",
  maintenance: "warning",
  retired: "danger",
};

export default function InlineVehicleViewer({ vehicle, task, onRefresh }: InlineVehicleViewerProps) {
  const {
    isEditing, setIsEditing, isSaving, isActionLoading,
    uploadingDoc, viewingImage, setViewingImage,
    formData, setFormData, isInsuranceExpired,
    insuranceRef, registrationRef, inspectionRef,
    handleSave, handleStatusAction, handleDocUpload,
  } = useInlineVehicle(vehicle);

  // ✅ BRAND TOKENS: Responsive form styling for mobile & desktop
  const inputClass = "w-full px-3 py-2 sm:py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-xs sm:text-sm";
  const labelClass = "text-[9px] sm:text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1 sm:mb-1.5 block";
  const valueClass = "text-xs sm:text-sm font-medium text-[var(--color-ink)] py-1 sm:py-2 flex items-center gap-2 truncate";

  const handleSaveWithRefresh = async () => { await handleSave(); onRefresh(); };
  const handleActionWithRefresh = async (action: "activate" | "maintenance" | "reactivate") => { await handleStatusAction(action); onRefresh(); };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar relative bg-[var(--color-surface)]">
      
      {/* 1. LIGHTBOX */}
      {viewingImage && (
        <OverlayPortal onClose={() => setViewingImage(null)}>
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button 
              onClick={() => setViewingImage(null)} 
              className="absolute top-2 right-2 sm:-top-12 sm:right-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <X size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
            </button>
            <img 
              src={viewingImage} 
              alt="Document Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl border border-white/10" 
            />
            <p className="text-white/60 text-[11px] sm:text-xs mt-3 sm:mt-4 font-medium text-center">
              Click outside or press X to close
            </p>
          </div>
        </div>
        </OverlayPortal>
      )}

      {/* 2. UNIFIED HEADER WITH STATUS & ACTIONS */}
      <div className="p-3.5 sm:p-6 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
              <Car size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-[var(--color-ink)] truncate">
                  {vehicle.make} {vehicle.model}
                </h2>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] text-[8px] sm:text-[10px] font-bold border border-[var(--color-surface-border)] shrink-0">
                  {vehicle.year}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Badge variant={STATUS_COLORS[vehicle.status] || "default"} size="sm">
                  {vehicle.status.replace("_", " ")}
                </Badge>
                <span className="text-[10px] sm:text-xs text-[var(--color-ink-subtle)] font-mono bg-[var(--color-surface-hover)] px-1 sm:px-1.5 py-0.5 rounded border border-[var(--color-surface-border)] shrink-0">
                  {vehicle.plate_number}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  title="Cancel Editing"
                >
                  <X size={16} aria-hidden="true" />
                </button>
                <button 
                  onClick={handleSaveWithRefresh} 
                  disabled={isSaving} 
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50 shadow-xs active:scale-95"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all"
                  title="Edit Details"
                >
                  <Pencil size={16} aria-hidden="true" />
                </button>
                
                {vehicle.status === "pending_activation" && (
                  <button 
                    onClick={() => handleActionWithRefresh("activate")} 
                    disabled={isActionLoading}
                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 transition-colors disabled:opacity-50"
                    title="Activate Vehicle"
                  >
                    {isActionLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <CheckCircle size={16} aria-hidden="true" />}
                  </button>
                )}
                {vehicle.status === "available" && (
                  <button 
                    onClick={() => handleActionWithRefresh("maintenance")} 
                    disabled={isActionLoading}
                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/5 transition-colors disabled:opacity-50"
                    title="Send to Maintenance"
                  >
                    <AlertTriangle size={16} aria-hidden="true" />
                  </button>
                )}
                {vehicle.status === "maintenance" && (
                  <button 
                    onClick={() => handleActionWithRefresh("reactivate")} 
                    disabled={isActionLoading}
                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-500/5 transition-colors disabled:opacity-50"
                    title="Reactivate Vehicle"
                  >
                    {isActionLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <RotateCcw size={16} aria-hidden="true" />}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. TASK CONTEXT BAR */}
      {task && <TaskContextBar task={task} />}

      {/* 4. MAIN CONTENT */}
      <div className="p-3.5 sm:p-6 space-y-5 sm:space-y-8">
        
        {/* VEHICLE SPECIFICATIONS */}
        <div>
          <h4 className="text-[9px] sm:text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-2.5 sm:mb-4">
            Vehicle Specifications
          </h4>
          
          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-3.5 sm:gap-y-5">
              {[
                { icon: Shield, label: "VIN (Chassis Number)", value: vehicle.vin || "Not provided" },
                { icon: DollarSign, label: "Daily Rate (KES)", value: Number(vehicle.daily_rate).toLocaleString() },
                { icon: Gauge, label: "Current Mileage", value: `${vehicle.current_mileage.toLocaleString()} km` },
                { icon: Gauge, label: "Next Service", value: vehicle.next_service_km ? `${vehicle.next_service_km.toLocaleString()} km` : "Not set" },
                { icon: Shield, label: "Insurance Policy", value: vehicle.insurance_number || "Not provided" },
                { 
                  icon: Calendar, 
                  label: "Insurance Expiry", 
                  value: formData.insurance_expiry ? new Date(formData.insurance_expiry).toLocaleDateString() : "Not set",
                  isWarning: isInsuranceExpired,
                  warningText: "(Expired)"
                },
              ].map((field, i) => (
                <div key={i} className="min-w-0">
                  <label className={labelClass}>{field.label}</label>
                  <div className={`${valueClass} ${field.isWarning ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                    <field.icon size={14} className={`shrink-0 ${field.isWarning ? 'text-rose-500' : 'text-[var(--color-ink-subtle)]'}`} aria-hidden="true" />
                    <span className="truncate">{field.value}</span>
                    {field.warningText && <span className="text-[9px] font-bold uppercase ml-1 shrink-0">{field.warningText}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-3 sm:gap-y-4">
              <div className="space-y-3 sm:space-y-4">
                {[
                  { key: 'make', label: 'Make', type: 'text' },
                  { key: 'model', label: 'Model', type: 'text' },
                  { key: 'plate_number', label: 'Plate Number', type: 'text' },
                  { key: 'vin', label: 'VIN (Chassis Number)', type: 'text' },
                  { key: 'year', label: 'Year', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className={labelClass}>{f.label}</label>
                    <input 
                      type={f.type} 
                      value={formData[f.key as keyof typeof formData]} 
                      onChange={e => setFormData({...formData, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value})} 
                      className={inputClass} 
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { key: 'daily_rate', label: 'Daily Rate (KES)', type: 'number', step: '0.01' },
                  { key: 'current_mileage', label: 'Current Mileage (km)', type: 'number' },
                  { key: 'next_service_km', label: 'Next Service (km)', type: 'number' },
                  { key: 'insurance_number', label: 'Insurance Policy Number', type: 'text' },
                  { key: 'insurance_expiry', label: 'Insurance Expiry Date', type: 'date' },
                ].map(f => (
                  <div key={f.key}>
                    <label className={labelClass}>{f.label}</label>
                    <input 
                      type={f.type} 
                      step={f.step}
                      value={formData[f.key as keyof typeof formData]} 
                      onChange={e => setFormData({...formData, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value})} 
                      className={`${inputClass} ${f.key === 'insurance_expiry' && isInsuranceExpired ? 'border-rose-500 focus:ring-rose-500/20' : ''}`} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="border-t border-[var(--color-surface-border)]" />

        {/* COMPLIANCE DOCUMENTS */}
        <div>
          <h4 className="text-[9px] sm:text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-2.5 sm:mb-4">
            Compliance Documents
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <DocumentCard title="Insurance" imageUrl={vehicle.insurance_doc} isUploading={uploadingDoc === 'insurance'} onUpload={() => insuranceRef.current?.click()} onView={() => vehicle.insurance_doc && setViewingImage(vehicle.insurance_doc)} />
            <input ref={insuranceRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload('insurance', e.target.files[0])} />
            
            <DocumentCard title="Registration" imageUrl={vehicle.registration_doc} isUploading={uploadingDoc === 'registration'} onUpload={() => registrationRef.current?.click()} onView={() => vehicle.registration_doc && setViewingImage(vehicle.registration_doc)} />
            <input ref={registrationRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload('registration', e.target.files[0])} />
            
            <DocumentCard title="Inspection" imageUrl={vehicle.inspection_doc} isUploading={uploadingDoc === 'inspection'} onUpload={() => inspectionRef.current?.click()} onView={() => vehicle.inspection_doc && setViewingImage(vehicle.inspection_doc)} />
            <input ref={inspectionRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload('inspection', e.target.files[0])} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ PREMIUM DOCUMENT CARD SUB-COMPONENT
function DocumentCard({ title, imageUrl, isUploading, onUpload, onView }: { 
  title: string; 
  imageUrl?: string | null; 
  isUploading: boolean; 
  onUpload: () => void; 
  onView: () => void 
}) {
  return (
    <div className="relative group rounded-xl sm:rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 overflow-hidden aspect-[16/10] sm:aspect-[4/3] flex flex-col cursor-pointer hover:border-[var(--color-surface-border)]/80 transition-all">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-ink-subtle)]">
          <FileText size={20} className="sm:w-6 sm:h-6 mb-1.5 sm:mb-2 opacity-50" aria-hidden="true" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">No Document</span>
        </div>
      )}
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-[2px]">
        {imageUrl && (
          <button 
            onClick={(e) => { e.stopPropagation(); onView(); }} 
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/40 text-white transition-colors" 
            title="View Document"
          >
            <ZoomIn size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onUpload(); }} 
          disabled={isUploading} 
          className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/40 text-white transition-colors disabled:opacity-50" 
          title="Upload New"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin sm:w-[18px] sm:h-[18px]" aria-hidden="true" /> : <Upload size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />}
        </button>
      </div>
      
      {/* Label Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 sm:p-3 pt-6 sm:pt-8 pointer-events-none">
        <p className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-widest">{title}</p>
      </div>
    </div>
  );
}
