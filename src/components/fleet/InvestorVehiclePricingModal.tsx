"use client";

import { useState, useEffect } from "react";
import { Car, Loader2, X, DollarSign, StickyNote, Clock, FileText, Copy, Check, PenLine } from "lucide-react";
import apiClient from "@/lib/api-client";
import { investorContractsApi } from "@/lib/api/investorContracts";
import InvestorContractSignModal from "@/components/investor/InvestorContractSignModal";
import type { Vehicle, InvestorContract } from "@/lib/types";
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
  const [step, setStep] = useState<'pricing' | 'contract'>('pricing');
  const [generatedContract, setGeneratedContract] = useState<InvestorContract | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    client_daily_rate: "",
    investor_lease_rate: "",
    lease_rate_type: "monthly" as "daily" | "monthly",
    notes: "",
  });

  const [contractDuration, setContractDuration] = useState<number>(12);

  // ✅ Pre-fill form if vehicle already has rates set (Edit Lease Agreement state)
  useEffect(() => {
    if (vehicle) {
      setFormData({
        client_daily_rate: vehicle.daily_rate ? String(vehicle.daily_rate) : "",
        investor_lease_rate: vehicle.investor_lease_rate ? String(vehicle.investor_lease_rate) : "",
        lease_rate_type: (vehicle.lease_rate_type as "daily" | "monthly") || "monthly",
        notes: "",
      });
    }
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  const handleCopyLink = () => {
    if (generatedContract?.share_token) {
      const link = `${window.location.origin}/public/contract/${generatedContract.share_token}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Contract link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
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
      await apiClient.patch(`/investors/vehicles/${vehicle.id}`, {
        daily_rate: parseFloat(formData.client_daily_rate),
        investor_lease_rate: parseFloat(formData.investor_lease_rate),
        lease_rate_type: formData.lease_rate_type,
        lease_rate_locked: true,
        notes: formData.notes || null,
      });

      toast.success(vehicle.lease_rate_locked ? "Lease rate updated successfully!" : "Vehicle activated and lease rate locked!");
      setStep('contract'); // Move to contract generation step
    } catch (error: any) {
      console.error("❌ PRICING ERROR:", error);
      const errorMsg = error.response?.data?.detail || "Failed to update vehicle";
      toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContract = async () => {
    setLoading(true);
    try {
      const contract = await investorContractsApi.generate({
        vehicle_id: vehicle.id,
        duration_months: contractDuration,
      });
      setGeneratedContract(contract);
      toast.success("Contract generated successfully!");
    } catch (error: any) {
      console.error("❌ CONTRACT GENERATION ERROR:", error);
      const errorMsg = error.response?.data?.detail || "Failed to generate contract";
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
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              {step === 'pricing' ? <DollarSign size={20} /> : <FileText size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-ink)]">
                {step === 'pricing' ? (vehicle.lease_rate_locked ? 'Edit Lease Agreement' : 'Set Pricing & Activate') : 'Generate Lease Contract'}
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)]">{vehicle.make} {vehicle.model} ({vehicle.plate_number})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Pricing Form */}
        {step === 'pricing' && (
          <form onSubmit={handleActivate} className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-400 leading-relaxed">
                <strong>Agency Action:</strong> Set both the client rental rate and the agreed investor lease rate. Setting these will activate the vehicle and lock the lease terms.
              </p>
            </div>

            <div>
              <label className={labelClass}>Client Daily Rate (KES) <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                <input 
                  type="number" required min="1" step="0.01" className={`${inputClass} pl-10`}
                  value={formData.client_daily_rate} 
                  onChange={e => setFormData({...formData, client_daily_rate: e.target.value})}
                  placeholder="e.g., 5000" autoFocus
                />
              </div>
              <p className="text-[10px] text-[var(--color-ink-subtle)] mt-1">What your customers will pay per day.</p>
            </div>

            <div className="border-t border-[var(--color-surface-border)] my-2" />

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Investor Lease Rate (KES) <span className="text-[var(--color-danger)]">*</span></label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                  <input 
                    type="number" required min="1" step="0.01" className={`${inputClass} pl-10`}
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
onChange={e => setFormData({...formData, lease_rate_type: e.target.value as "daily" | "monthly"})}
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <Clock size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[var(--color-ink-subtle)] -mt-2">What you will pay the investor. This rate will be locked.</p>

            <div>
              <label className={labelClass}>Internal Notes (Optional)</label>
              <div className="relative">
                <StickyNote size={16} className="absolute left-3 top-3 text-[var(--color-ink-subtle)]" />
                <textarea 
                  className={`${inputClass} pl-10 resize-none`} rows={2}
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Contract terms, special conditions, etc..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all">
                Cancel
              </button>
              <button 
                type="submit" disabled={loading} 
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Car size={16} />}
                {loading ? "Processing..." : (vehicle.lease_rate_locked ? "Update & Lock Rate" : "Activate & Lock Rate")}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Contract Generation */}
        {step === 'contract' && !generatedContract && (
          <div className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                <strong>Success!</strong> The vehicle is now active and the lease rate is locked. You can now generate the official lease contract.
              </p>
            </div>

            <div>
              <label className={labelClass}>Contract Duration (Months) <span className="text-[var(--color-danger)]">*</span></label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {[1, 3, 6, 12].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setContractDuration(months)}
                    className={`px-2 py-2 rounded-lg text-sm font-semibold border transition-all ${
                      contractDuration === months
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                        : 'bg-[var(--color-surface-hover)] text-[var(--color-ink)] border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    {months} {months === 1 ? 'Mo' : 'Mos'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setStep('pricing')} 
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
              >
                Back
              </button>
              <button 
                type="button" 
                onClick={handleGenerateContract}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                {loading ? "Generating..." : "Generate Contract"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contract Generated */}
        {step === 'contract' && generatedContract && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <FileText size={32} className="mx-auto text-emerald-500 mb-2" />
              <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Contract Generated!</h4>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                Contract #{generatedContract.contract_number}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {/* ✅ NEW: Sign as Agency Button */}
              <button 
                type="button" 
                onClick={() => setIsSignModalOpen(true)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2"
              >
                <PenLine size={16} />
                Sign as Agency Representative
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-[var(--color-surface-border)]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-[var(--color-surface)] text-xs text-[var(--color-ink-muted)]">OR</span>
                </div>
              </div>

              <div>
                <label className={labelClass}>Shareable Signing Link</label>
                <div className="flex gap-2 mt-1">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${window.location.origin}/public/contract/${generatedContract.share_token}`}
                    className={`${inputClass} flex-1 text-xs font-mono truncate`}
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30 transition-all text-[var(--color-ink)] flex-shrink-0"
                    title="Copy link"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-[var(--color-ink-subtle)] mt-1">
                  Send this link to the investor if they need to sign remotely.
                </p>
              </div>

              <button 
                type="button" 
                onClick={() => { onSuccess(); onClose(); }} 
                className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all border border-[var(--color-surface-border)]"
              >
                Done
              </button>
            </div>

            {/* ✅ Render the modal here, scoped to this component */}
            <InvestorContractSignModal
              contract={generatedContract}
              isOpen={isSignModalOpen}
              onClose={() => setIsSignModalOpen(false)}
              defaultRole="agency"
              onSuccess={() => {
                toast.success("Agency signature applied!");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
