"use client";

import { useState, useEffect } from "react";
import { FileText, Upload, CheckCircle, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { vehiclesApi } from "@/lib/api/vehicles";
import { investorContractsApi } from "@/lib/api/investorContracts";
import InvestorContractSignModal from "@/components/investor/InvestorContractSignModal";
import type { Vehicle, InvestorContract } from "@/lib/types";
import toast from "react-hot-toast";

interface DocumentUploadCardProps {
  title: string;
  icon: React.ElementType;
  uploaded: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
  required: boolean;
}

export default function InvestorVehicleProfilePage({ params }: { params: { vehicleId: string } }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [activeContract, setActiveContract] = useState<InvestorContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  
  // ✅ State for the in-app signing modal
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  // ✅ Fetch vehicle details and active contract on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicleData, contractsData] = await Promise.all([
          vehiclesApi.get(Number(params.vehicleId)),
          investorContractsApi.list({ vehicle_id: Number(params.vehicleId) })
        ]);
        
        setVehicle(vehicleData);
        
        // Find the most recent non-terminated contract
        const active = contractsData.find((c: InvestorContract) => c.status !== 'terminated');
        setActiveContract(active || null);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load vehicle details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.vehicleId]);

  const handleUpload = async (docType: 'insurance' | 'registration' | 'inspection' | 'service_tag', file: File) => {
    setUploading(docType);
    try {
      if (docType === 'insurance') {
        await vehiclesApi.uploadInvestorInsuranceDoc(Number(params.vehicleId), file);
      } else if (docType === 'inspection') {
        await vehiclesApi.uploadInvestorInspectionDoc(Number(params.vehicleId), file);
      } else if (docType === 'service_tag' || docType === 'registration') {
        await vehiclesApi.uploadInvestorRegistrationDoc(Number(params.vehicleId), file);
      }
      
      const displayName = docType === 'service_tag' ? 'Service Tag' : docType;
      toast.success(`${displayName} uploaded successfully`);
      
      const updatedVehicle = await vehiclesApi.get(Number(params.vehicleId));
      setVehicle(updatedVehicle);
    } catch (error: any) {
      console.error(`Failed to upload ${docType}:`, error);
      toast.error(error.response?.data?.detail || `Failed to upload`);
    } finally {
      setUploading(null);
    }
  };

  // ✅ Helper to refresh contract data after signing
  const refreshContractData = async () => {
    try {
      const contractsData = await investorContractsApi.list({ vehicle_id: Number(params.vehicleId) });
      const active = contractsData.find((c: InvestorContract) => c.status !== 'terminated');
      setActiveContract(active || null);
    } catch (error) {
      console.error("Failed to refresh contract data:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-ink-muted)]">Vehicle not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">
          {vehicle.make} {vehicle.model} ({vehicle.plate_number})
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Manage your vehicle's compliance and lease information
        </p>
      </div>

      {/* Lease Agreement Card */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-6">
        <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4">Lease Agreement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase mb-1">Your Lease Rate</p>
            <p className="text-2xl font-bold text-[var(--color-primary)]">
              KES {vehicle.investor_lease_rate ? Number(vehicle.investor_lease_rate).toLocaleString() : 'Not set'}
            </p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              per {vehicle.lease_rate_type || 'day'} {vehicle.lease_rate_locked && '🔒'}
            </p>
          </div>
          
          <div>
            <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase mb-1">Contract Status</p>
            {activeContract ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {activeContract.status === 'signed' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle size={14} /> Signed & Active
                    </span>
                  ) : activeContract.status === 'pending_signature' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <AlertCircle size={14} /> Pending Your Signature
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
                      <FileText size={14} /> Draft
                    </span>
                  )}
                </div>
                {/* ✅ Replaced public link with in-app modal trigger */}
                <button 
                  onClick={() => setIsSignModalOpen(true)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)] hover:underline transition-colors"
                >
                  View & Sign Contract <ChevronRight size={12} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1 mt-1">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20 w-fit">
                  <AlertCircle size={14} /> No Contract Generated
                </span>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  The agency has not generated a contract for this vehicle yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance Documents */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-6">
        <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4">Required Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Insurance Policy (Required) */}
          <DocumentUploadCard
            title="Insurance Policy"
            icon={FileText}
            uploaded={!!vehicle.insurance_doc}
            uploading={uploading === 'insurance'}
            onUpload={(file) => handleUpload('insurance', file)}
            required={true}
          />
          
          {/* 2. Current Service Tag (Required) - Reuses registration_doc column */}
          <DocumentUploadCard
            title="Current Service Tag"
            icon={FileText}
            uploaded={!!vehicle.registration_doc}
            uploading={uploading === 'service_tag'}
            onUpload={(file) => handleUpload('service_tag', file)}
            required={true}
          />
          
          {/* 3. Inspection Report (Optional) */}
          <DocumentUploadCard
            title="Inspection Report"
            icon={FileText}
            uploaded={!!vehicle.inspection_doc}
            uploading={uploading === 'inspection'}
            onUpload={(file) => handleUpload('inspection', file)}
            required={false}
          />
        </div>
      </div>

      {/* ✅ In-App Signing Modal */}
      {activeContract && (
        <InvestorContractSignModal
          contract={activeContract}
          isOpen={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          onSuccess={refreshContractData}
        />
      )}
    </div>
  );
}

// ✅ Helper component with proper TypeScript types
function DocumentUploadCard({ title, icon: Icon, uploaded, uploading, onUpload, required }: DocumentUploadCardProps) {
  return (
    <div className={`p-4 rounded-xl border-2 border-dashed transition-all ${
      uploaded 
        ? 'border-emerald-500/30 bg-emerald-500/5' 
        : 'border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className={uploaded ? 'text-emerald-500' : 'text-[var(--color-ink-muted)]'} />
          <h3 className="text-sm font-bold text-[var(--color-ink)]">{title}</h3>
        </div>
        {required && <span className="text-xs text-red-500">*</span>}
      </div>
      
      {uploaded ? (
        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle size={14} />
          <span>Uploaded</span>
        </div>
      ) : (
        <label className="block cursor-pointer group">
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[var(--color-surface-hover)] group-hover:bg-[var(--color-primary)]/10 transition-colors">
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin text-[var(--color-primary)]" />
                <span className="text-xs text-[var(--color-ink-muted)]">Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={14} className="text-[var(--color-primary)]" />
                <span className="text-xs font-semibold text-[var(--color-primary)]">Upload File</span>
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
