"use client";

import { useState } from "react";
import { Car, FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api-client";
import toast from "react-hot-toast";

export default function InvestorVehicleProfilePage({ params }: { params: { vehicleId: string } }) {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (docType: 'insurance' | 'registration' | 'inspection', file: File) => {
    setUploading(docType);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await apiClient.post(`/investors/vehicles/${params.vehicleId}/upload-${docType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success(`${docType} document uploaded successfully`);
      // Refresh page or update state
    } catch (error) {
      toast.error(`Failed to upload ${docType}`);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Vehicle Details</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">Manage your vehicle's compliance and lease information</p>
      </div>

      {/* Lease Agreement Card */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-6">
        <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4">Lease Agreement</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase">Your Lease Rate</p>
            <p className="text-2xl font-bold text-[var(--color-primary)]">
              KES {vehicle.investor_lease_rate?.toLocaleString() || 'Not set'}
            </p>
            <p className="text-xs text-[var(--color-ink-muted)]">
              per {vehicle.lease_rate_type || 'day'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase">Contract Status</p>
            <div className="flex items-center gap-2 mt-1">
              {vehicle.lease_rate_locked ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                  <CheckCircle size={12} /> Active Contract
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">
                  <AlertCircle size={12} /> Pending Approval
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Documents */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-6">
        <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4">Required Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Insurance */}
          <DocumentUploadCard
            title="Insurance Policy"
            icon={FileText}
            uploaded={!!vehicle.insurance_doc}
            uploading={uploading === 'insurance'}
            onUpload={(file) => handleUpload('insurance', file)}
            required
          />
          
          {/* Registration */}
          <DocumentUploadCard
            title="Vehicle Registration"
            icon={FileText}
            uploaded={!!vehicle.registration_doc}
            uploading={uploading === 'registration'}
            onUpload={(file) => handleUpload('registration', file)}
            required
          />
          
          {/* Inspection */}
          <DocumentUploadCard
            title="Inspection Report"
            icon={FileText}
            uploaded={!!vehicle.inspection_doc}
            uploading={uploading === 'inspection'}
            onUpload={(file) => handleUpload('inspection', file)}
            required
          />
        </div>
      </div>
    </div>
  );
}

// Helper component
function DocumentUploadCard({ title, icon: Icon, uploaded, uploading, onUpload, required }: any) {
  return (
    <div className={`p-4 rounded-xl border-2 border-dashed ${
      uploaded ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[var(--color-surface-border)]'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className={uploaded ? 'text-emerald-500' : 'text-[var(--color-ink-muted)]'} />
          <h3 className="text-sm font-bold text-[var(--color-ink)]">{title}</h3>
        </div>
        {required && <span className="text-xs text-red-500">*</span>}
      </div>
      
      {uploaded ? (
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <CheckCircle size={12} />
          <span>Uploaded</span>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-colors">
            {uploading ? (
              <span className="text-xs text-[var(--color-ink-muted)]">Uploading...</span>
            ) : (
              <>
                <Upload size={14} className="text-[var(--color-primary)]" />
                <span className="text-xs font-semibold text-[var(--color-primary)]">Upload</span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            disabled={!!uploading}
          />
        </label>
      )}
    </div>
  );
}
