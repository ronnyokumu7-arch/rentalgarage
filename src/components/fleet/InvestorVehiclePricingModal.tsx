"use client";

import { useState } from "react";
import { Car, Loader2, X, DollarSign, StickyNote, Clock } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Vehicle } from "@/lib/types";
import toast from "react-hot-toast";

interface InvestorVehiclePricingModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InvestorVehiclePricingModal({
  vehicle,
  isOpen,
  onClose,
  onSuccess,
}: InvestorVehiclePricingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_daily_rate: "",
    investor_lease_rate: "",
    lease_rate_type: "daily", // 'daily' or 'monthly'
    notes: "",
  });

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_daily_rate || parseFloat(formData.client_daily_rate) <= 0) {
      toast.error("Please enter a valid Client Daily Rate greater than 0.");
      return;
    }
    if (!formData.investor_lease_rate || parseFloat(formData.investor_lease_rate) <= 0) {
      toast.error("Please enter a valid Investor Lease Rate greater than 0.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Calls our bridge endpoint with BOTH rates
      await apiClient.patch(`/investors/vehicles/${vehicle.id}`, {
        daily_rate: parseFloat(formData.client_daily_rate),
        investor_lease_rate: parseFloat(formData.investor_lease_rate),
        lease_rate_type: formData.lease_rate_type,
        lease_rate_locked: true, // ✅ Locks the rate for the contract period
        notes: formData.notes || null,
      });

      toast.success("Vehicle activated and lease agreement set successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("❌ PRICING ERROR:", error);
      const errorMsg = error.response?.data?.detail || "Failed to activate vehicle";
      toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all";
  const labelClass = "block text-xs font-semibold text-[var(--color-ink-muted)] mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-ink)]">Set Pricing & Activate</h3>
              <p className="text-xs text-[var(--color-ink-muted)]">{vehicle.make} {vehicle.model} ({vehicle.plate_number})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-400 leading-relaxed">
              <strong>Agency Action:</strong> Set both the client rental rate and the agreed investor lease rate. Setting these will activate the vehicle and lock the lease terms for the contract period.
            </p>
          </div>

          {/* Client Rate */}
          <div>
            <label className={labelClass}>Client Daily Rate (KES) <span className="text-[var(--color-danger)]">*</span></label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
              <input 
                type="number"
                required
                min="1"
                step="0.01"
                className={`${inputClass} pl-10`}
                value={formData.client_daily_rate} 
                onChange={e => setFormData({...formData, client_daily_rate: e.target.value})}
                placeholder="e.g., 5000"
                autoFocus
              />
            </div>
            <p className="text-[10px] text-[var(--color-ink-subtle)] mt-1">What your customers will pay per day.</p>
          </div>

          <div className="border-t border-[var(--color-surface-border)] my-2" />

          {/* Investor Lease Rate */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelClass}>Investor Lease Rate (KES) <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                <input 
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  className={`${inputClass} pl-10`}
                  value={formData.investor_lease_rate} 
                  onChange={e => setFormData({...formData, investor_lease_rate: e.target.value})}
                  placeholder="e.g., 3000"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Frequency</label>
              <div className="relative">
                <select
                  className={`${inputClass} pr-8 appearance-none`}
                  value={formData.lease_rate_type}
                  onChange={e => setFormData({...formData, lease_rate_type: e.target.value})}
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                </select>
                <Clock size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[var(--color-ink-subtle)] -mt-2">What you will pay the investor. This rate will be locked.</p>

          {/* Internal Notes */}
          <div>
            <label className={labelClass}>Internal Notes (Optional)</label>
            <div className="relative">
              <StickyNote size={16} className="absolute left-3 top-3 text-[var(--color-ink-subtle)]" />
              <textarea 
                className={`${inputClass} pl-10 resize-none`}
                rows={2}
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Contract terms, special conditions, etc..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Car size={16} />}
              {loading ? "Activating..." : "Activate & Lock Rate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
