"use client";

import { useState, useEffect } from "react";
import { Car, Loader2, X, Hash, Calendar, Gauge, DollarSign, Info } from "lucide-react";
import { vehiclesApi } from "@/lib/api/vehicles";
import toast from "react-hot-toast";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess }: AddVehicleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    plate_number: "",
    year: new Date().getFullYear(),
    expected_lease_rate: "",
    current_mileage: "",
    next_service_km: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        make: "", model: "", plate_number: "", year: new Date().getFullYear(),
        expected_lease_rate: "", current_mileage: "", next_service_km: "",
      });
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vehiclesApi.createInvestorVehicle({
        make: formData.make,
        model: formData.model,
        plate_number: formData.plate_number.toUpperCase(),
        year: parseInt(formData.year.toString()) || new Date().getFullYear(),
        expected_lease_rate: formData.expected_lease_rate ? parseFloat(formData.expected_lease_rate) : null,
        current_mileage: formData.current_mileage ? parseInt(formData.current_mileage) : 0,
        next_service_km: formData.next_service_km ? parseInt(formData.next_service_km) : null,
      });

      toast.success("Vehicle submitted for agency approval!");
      onSuccess();
      onClose();
    } catch (error: any) {
      // ✅ CRITICAL: This will print the exact error to the browser console
      console.error("❌ VEHICLE SUBMISSION ERROR:", error); 
      
      const errorMsg = error.response?.data?.detail || error.message || "Failed to submit vehicle";
      toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all";
  const labelClass = "block text-xs font-semibold text-[var(--color-ink-muted)] mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <Car size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-ink)]">Submit Vehicle</h3>
              <p className="text-xs text-[var(--color-ink-muted)]">Provide basic details. Agency will set final rates upon approval.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-400 leading-relaxed">
              <strong>Note:</strong> The rate you enter below is your <em>expected</em> lease rate. The agency will review your vehicle and set the final client rental price and confirm your payout rate before activation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Plate Number <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                <input type="text" required className={`${inputClass} pl-10 uppercase`} value={formData.plate_number} onChange={e => setFormData({...formData, plate_number: e.target.value})} placeholder="KBA 123X" />
              </div>
            </div>
            
            <div>
              <label className={labelClass}>Make <span className="text-[var(--color-danger)]">*</span></label>
              <input type="text" required className={inputClass} value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} placeholder="Toyota" />
            </div>
            <div>
              <label className={labelClass}>Model <span className="text-[var(--color-danger)]">*</span></label>
              <input type="text" required className={inputClass} value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Axio" />
            </div>

            <div>
              <label className={labelClass}>Year (YOM) <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                <input type="number" required min="1990" max={new Date().getFullYear() + 1} className={`${inputClass} pl-10`} value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            
            <div>
              <label className={labelClass}>Expected Lease Rate (KES)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                <input type="number" min="0" step="0.01" className={`${inputClass} pl-10`} value={formData.expected_lease_rate} onChange={e => setFormData({...formData, expected_lease_rate: e.target.value})} placeholder="e.g., 3000" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Current Mileage (km)</label>
              <div className="relative">
                <Gauge size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                <input type="number" className={`${inputClass} pl-10`} value={formData.current_mileage} onChange={e => setFormData({...formData, current_mileage: e.target.value})} placeholder="0" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Next Service (km)</label>
              <input type="number" className={inputClass} value={formData.next_service_km} onChange={e => setFormData({...formData, next_service_km: e.target.value})} placeholder="10000" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading || !formData.make || !formData.model || !formData.plate_number} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Car size={16} />}
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
