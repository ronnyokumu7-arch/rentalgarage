// src/components/quotations/QuotationFormUI.tsx
"use client";

import { ArrowLeft, Save, User, MapPin, DollarSign, FileText, X, Loader2 } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import FloatingActionBar from "@/components/ui/FloatingActionBar";
import type { Client, Vehicle } from "@/lib/types";

interface QuotationFormUIProps {
  formData: any;
  updateField: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  clients: Client[];
  vehicles: Vehicle[];
  calculations: { days: number; daily_rate: number; total_amount: number };
  onBack: () => void;
}

export default function QuotationFormUI({
  formData, updateField, handleSubmit, loading, clients, vehicles, calculations, onBack
}: QuotationFormUIProps) {
  
  // Calculate today's date for the min attribute (prevents past dates)
  const today = new Date().toISOString().split('T')[0];

  return (
    // ✅ Increased pb-32 to ensure content isn't hidden behind the floating bar
    <form onSubmit={handleSubmit} className="space-y-6 pb-32">
      
      {/* ── Top Navigation ── */}
      <div className="flex items-center">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={16} /> Back to Quotations
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column: Parties & Trip Details ── */}
        <div className="lg:col-span-2 space-y-6">
          
          <SectionCard title="Client & Vehicle" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Client *</label>
                <select value={formData.client_id} onChange={(e) => updateField("client_id", e.target.value)} className="input" required>
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Vehicle *</label>
                <select value={formData.vehicle_id} onChange={(e) => updateField("vehicle_id", e.target.value)} className="input" required>
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.plate_number})</option>)}
                </select>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Trip Details" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Start Date *</label>
                <input type="date" min={today} value={formData.start_date} onChange={(e) => updateField("start_date", e.target.value)} className="input" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">End Date *</label>
                <input type="date" min={formData.start_date || today} value={formData.end_date} onChange={(e) => updateField("end_date", e.target.value)} className="input" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Pickup Location *</label>
                <input type="text" placeholder="e.g. JKIA Terminal 1" value={formData.pickup_location} onChange={(e) => updateField("pickup_location", e.target.value)} className="input" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Return Location *</label>
                <input type="text" placeholder="e.g. JKIA Terminal 1" value={formData.return_location} onChange={(e) => updateField("return_location", e.target.value)} className="input" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Destination (Optional)</label>
                <input type="text" placeholder="e.g. Maasai Mara, Diani Beach" value={formData.destination} onChange={(e) => updateField("destination", e.target.value)} className="input" />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Right Column: Financials & Terms ── */}
        <div className="space-y-6">
          <SectionCard title="Pricing" icon={DollarSign}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Daily Rate (KES) *</label>
                <input type="number" min="0" step="0.01" value={formData.daily_rate} onChange={(e) => updateField("daily_rate", e.target.value)} className="input" required />
              </div>
              
              <div className="bg-surface-bg rounded-lg p-4 space-y-2 border border-surface-border">
                <div className="flex justify-between text-sm text-ink-muted">
                  <span>Duration</span>
                  <span className="font-medium text-ink">{calculations.days} Days</span>
                </div>
                <div className="flex justify-between text-sm text-ink-muted">
                  <span>Daily Rate</span>
                  <span className="font-medium text-ink">KES {calculations.daily_rate.toLocaleString()}</span>
                </div>
                <div className="border-t border-surface-border pt-2 flex justify-between">
                  <span className="font-bold text-ink">Total Amount</span>
                  <span className="font-bold text-accent-dark text-lg">KES {calculations.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Terms & Notes" icon={FileText}>
            <textarea 
              rows={4} 
              value={formData.terms_and_conditions} 
              onChange={(e) => updateField("terms_and_conditions", e.target.value)} 
              className="input resize-none" 
              placeholder="Standard rental terms..."
            />
          </SectionCard>
        </div>
      </div>

      {/* ── FLOATING ACTION BAR ── */}
      <FloatingActionBar>
        {/* Left Side: Cancel */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-danger-text hover:bg-danger-bg transition-colors"
        >
          <X size={14} /> Cancel
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-surface-border" />

        {/* Right Side: Primary Action (Vibrant, Glowing & Alive) */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {loading ? "Generating..." : "Generate Quotation"}
        </button>
      </FloatingActionBar>
    </form>
  );
}
