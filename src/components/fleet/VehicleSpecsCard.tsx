// src/components/fleet/VehicleSpecsCard.tsx
"use client";

import { useState, useEffect } from "react";
import { Gauge, CurrencyDollar as DollarSign, Shield, Calendar, Pulse as Activity } from "@phosphor-icons/react/ssr";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import type { Vehicle, VehicleUpdate } from "@/lib/types";

interface VehicleSpecsCardProps {
  vehicle: Vehicle;
  isEditing: boolean;
  onSave: (data: VehicleUpdate) => void;
  onCancel: () => void;
  actionLoading: string | null;
}

const labelClass = "text-[9px] sm:text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1 block truncate";
const valueClass = "text-xs sm:text-sm font-bold text-[var(--color-ink)] flex items-center gap-1.5 truncate";
const inputClass = "w-full px-3 py-2 sm:py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-xs sm:text-sm";

const formatDateToLocalYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function VehicleSpecsCard({ vehicle, isEditing, onSave, onCancel, actionLoading }: VehicleSpecsCardProps) {
  const isInsuranceExpired = vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry) < new Date() : false;

  const [formData, setFormData] = useState({
    current_mileage: vehicle.current_mileage.toString(),
    next_service_km: vehicle.next_service_km ? vehicle.next_service_km.toString() : "",
    insurance_number: vehicle.insurance_number || "",
    insurance_expiry: vehicle.insurance_expiry ? formatDateToLocalYYYYMMDD(new Date(vehicle.insurance_expiry)) : "",
  });

  useEffect(() => {
    setFormData({
      current_mileage: vehicle.current_mileage.toString(),
      next_service_km: vehicle.next_service_km ? vehicle.next_service_km.toString() : "",
      insurance_number: vehicle.insurance_number || "",
      insurance_expiry: vehicle.insurance_expiry ? formatDateToLocalYYYYMMDD(new Date(vehicle.insurance_expiry)) : "",
    });
  }, [vehicle, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      current_mileage: parseInt(formData.current_mileage, 10) || vehicle.current_mileage,
      next_service_km: formData.next_service_km ? parseInt(formData.next_service_km, 10) : null,
      insurance_number: formData.insurance_number || null,
      insurance_expiry: formData.insurance_expiry ? new Date(formData.insurance_expiry + 'T00:00:00').toISOString() : null,
    });
  };

  if (isEditing) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-card)] space-y-4 sm:space-y-6">
        <h3 className="text-xs sm:text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
          <Activity size={16} className="text-[var(--color-primary)] flex-shrink-0" aria-hidden="true" /> Edit Telemetry & Compliance
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6">
          <div>
            <label className={labelClass}>Current Mileage (KM)</label>
            <input 
              type="number" 
              value={formData.current_mileage}
              onChange={(e) => setFormData({ ...formData, current_mileage: e.target.value })}
              className={`${inputClass} font-mono`} 
            />
          </div>
          <div>
            <label className={labelClass}>Next Service Target (KM)</label>
            <input 
              type="number" 
              value={formData.next_service_km}
              onChange={(e) => setFormData({ ...formData, next_service_km: e.target.value })}
              className={`${inputClass} font-mono placeholder-[var(--color-ink-subtle)]`} 
              placeholder="e.g., 15000" 
            />
          </div>
          <div>
            <label className={labelClass}>Insurance Policy Number</label>
            <input 
              type="text" 
              value={formData.insurance_number}
              onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
              className={inputClass} 
              placeholder="Policy ID" 
            />
          </div>
          
          <div>
            <label className={labelClass}>Insurance Expiry Date</label>
            <div className="relative group">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] group-focus-within:text-[var(--color-primary)] transition-colors pointer-events-none z-10" aria-hidden="true" />
              <Flatpickr
                value={formData.insurance_expiry}
                onChange={(dates) => {
                  if (dates[0]) {
                    const localDateStr = formatDateToLocalYYYYMMDD(dates[0]);
                    setFormData({ ...formData, insurance_expiry: localDateStr });
                  } else {
                    setFormData({ ...formData, insurance_expiry: "" });
                  }
                }}
                options={{
                  dateFormat: "Y-m-d",
                  disableMobile: true,
                }}
                className={`${inputClass} pl-9`}
                placeholder="Select expiry date..."
              />
            </div>
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2.5 pt-3 border-t border-[var(--color-surface-border)]">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={actionLoading === "update"} 
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 disabled:opacity-50"
            >
              {actionLoading === "update" ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-card)] space-y-3.5 sm:space-y-4">
      <h3 className="text-xs sm:text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
        <Activity size={16} className="text-[var(--color-primary)] flex-shrink-0" aria-hidden="true" /> Telemetry & Compliance
      </h3>
      
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {/* 1. Current Mileage */}
        <div className="bg-[var(--color-bg)]/60 border border-[var(--color-surface-border)] rounded-xl p-3 sm:p-4 flex flex-col justify-between space-y-1">
          <span className={labelClass}>Current Mileage</span>
          <p className={valueClass}>
            <Gauge size={14} className="text-[var(--color-ink-subtle)] flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{vehicle.current_mileage.toLocaleString()} KM</span>
          </p>
        </div>

        {/* 2. Next Service Target */}
        <div className="bg-[var(--color-bg)]/60 border border-[var(--color-surface-border)] rounded-xl p-3 sm:p-4 flex flex-col justify-between space-y-1">
          <span className={labelClass}>Next Service</span>
          <p className={valueClass}>
            <Activity size={14} className="text-[var(--color-ink-subtle)] flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{vehicle.next_service_km ? `${vehicle.next_service_km.toLocaleString()} KM` : "Not set"}</span>
          </p>
        </div>

        {/* 3. Daily Rental Rate */}
        <div className="bg-[var(--color-bg)]/60 border border-[var(--color-surface-border)] rounded-xl p-3 sm:p-4 flex flex-col justify-between space-y-1">
          <span className={labelClass}>Daily Rate</span>
          <p className={valueClass}>
            <DollarSign size={14} className="text-[var(--color-ink-subtle)] flex-shrink-0" aria-hidden="true" />
            <span className="truncate">KES {Number(vehicle.daily_rate).toLocaleString()}</span>
          </p>
        </div>

        {/* 4. Insurance Policy */}
        <div className="bg-[var(--color-bg)]/60 border border-[var(--color-surface-border)] rounded-xl p-3 sm:p-4 flex flex-col justify-between space-y-1">
          <span className={labelClass}>Insurance Policy</span>
          <p className={valueClass}>
            <Shield size={14} className="text-[var(--color-ink-subtle)] flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{vehicle.insurance_number || "Not provided"}</span>
          </p>
        </div>

        {/* 5. Insurance Expiry (Spans 2 columns on mobile grid) */}
        <div className="col-span-2 bg-[var(--color-bg)]/60 border border-[var(--color-surface-border)] rounded-xl p-3 sm:p-4 flex flex-row items-center justify-between gap-2">
          <div className="min-w-0">
            <span className={labelClass}>Insurance Expiry</span>
            <p className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${isInsuranceExpired ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--color-ink)]'}`}>
              <Calendar size={14} className={isInsuranceExpired ? 'text-rose-500 flex-shrink-0' : 'text-[var(--color-ink-subtle)] flex-shrink-0'} aria-hidden="true" />
              <span className="truncate">{vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry).toLocaleDateString() : "Not set"}</span>
            </p>
          </div>
          {isInsuranceExpired && (
            <span className="text-[9px] font-bold uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-rose-600 dark:text-rose-400 flex-shrink-0">
              Expired
            </span>
          )}
        </div>
      </div>
    </div>
  );
}