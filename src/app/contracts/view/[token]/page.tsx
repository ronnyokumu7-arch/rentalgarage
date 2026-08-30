// src/app/(public)/contract/[token]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { FileText, CheckCircle2, Download, Loader2 } from "lucide-react";

import { usePublicContract } from "@/components/contracts/public/hooks/usePublicContract";
import PublicContractCompanyHeader from "@/components/contracts/public/PublicContractCompanyHeader";
import PublicContractDetails from "@/components/contracts/public/PublicContractDetails";
import PublicContractTermsSection from "@/components/contracts/public/PublicContractTermsSection";
import PublicContractSignTab from "@/components/contracts/public/PublicContractSignTab";
import ContractLoadingState from "@/components/ui/ContractLoadingState";
import ContractErrorState from "@/components/ui/ContractErrorState";
import "@/app/public.css";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/ /g, ", ");
};

export default function PublicContractViewPage() {
  const params = useParams();
  const token = params.token as string;
  
  const { 
    contract, 
    loading: contractLoading, 
    error, 
    signed, 
    signContract, 
    downloadPdf,
    isDownloadingPdf
  } = usePublicContract(token);

  if (contractLoading) return <ContractLoadingState message="Loading contract..." />;
  if (error || !contract) return <ContractErrorState message={error || "Contract not found"} />;

  const tenant = {
    company_name: contract.tenant_name || "Rental Company",
    logo_url: contract.tenant_logo_url || "",
    business_location: contract.tenant_address || "",
    phone: contract.tenant_phone || "",
    email: contract.tenant_email || "",
    website: "",
    kra_pin: "",
    contract_terms: "",
  };

  return (
    <div 
      className="public-root min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#FAF9F7' }}
    >
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        
        <PublicContractCompanyHeader 
          tenant={tenant}
          bookingNumber={contract.booking_number || `BK-${contract.booking_id}`}
        />

        <div 
          className="rounded-xl sm:rounded-2xl overflow-hidden"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 12px 24px -4px rgba(28, 25, 23, 0.10)',
            border: '1px solid rgba(28, 25, 23, 0.10)',
          }}
        >
          
          {/* Status Banner - Clean split layout */}
          <div 
            className="p-4 sm:p-5"
            style={{
              borderBottom: '1px solid rgba(28, 25, 23, 0.08)',
              background: signed 
                ? 'rgba(4, 120, 87, 0.05)'
                : 'rgba(109, 40, 217, 0.05)',
            }}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Left: Status icon + text */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ 
                    backgroundColor: signed 
                      ? 'rgba(4, 120, 87, 0.10)'
                      : 'rgba(109, 40, 217, 0.10)'
                  }}
                >
                  {signed ? (
                    <CheckCircle2 className="h-5 w-5" style={{ color: '#047857' }} />
                  ) : (
                    <FileText className="h-5 w-5" style={{ color: '#6D28D9' }} />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 
                    className="text-sm font-bold truncate"
                    style={{ color: signed ? '#047857' : '#6D28D9' }}
                  >
                    {signed ? "Contract Signed & Executed" : "Pending Your Signature"}
                  </h3>
                  <p 
                    className="text-xs truncate"
                    style={{ color: signed ? '#047857' : '#6D28D9', opacity: 0.85 }}
                  >
                    {signed 
                      ? "This agreement is fully executed." 
                      : "Please review details and sign to proceed."}
                  </p>
                </div>
              </div>
              
              {/* Right: Download button - compact on all screens */}
              <button
                onClick={downloadPdf}
                disabled={isDownloadingPdf}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(28, 25, 23, 0.10)',
                  color: '#44403C',
                  boxShadow: '0 1px 2px rgba(28, 25, 23, 0.06)',
                  cursor: isDownloadingPdf ? 'not-allowed' : 'pointer',
                  opacity: isDownloadingPdf ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isDownloadingPdf) {
                    e.currentTarget.style.background = '#F5F3F0';
                    e.currentTarget.style.borderColor = 'rgba(28, 25, 23, 0.18)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = 'rgba(28, 25, 23, 0.10)';
                }}
                onMouseDown={(e) => {
                  if (!isDownloadingPdf) {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }
                }}
                onMouseUp={(e) => {
                  if (!isDownloadingPdf) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> 
                    <span className="hidden sm:inline">Generating...</span>
                    <span className="sm:hidden">Loading...</span>
                  </>
                ) : (
                  <>
                    <Download size={13} /> 
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <PublicContractDetails contract={contract} />
          
          <PublicContractTermsSection tenantName={tenant.company_name} />
          
          {!signed && (
            <PublicContractSignTab 
              contract={contract}
              onSign={signContract}
              isSigned={signed}
            />
          )}
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p 
            className="text-xs"
            style={{ color: '#78716C' }}
          >
            Secured by Rental Garage • Contract generated on {formatDate(contract.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
