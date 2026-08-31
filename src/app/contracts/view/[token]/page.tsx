"use client";

import { useParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { FileText, CheckCircle2, Download, Loader2 } from "lucide-react";
import { brand } from "@/lib/brand";

import { usePublicContract } from "@/components/contracts/public/hooks/usePublicContract";
import PublicContractCompanyHeader from "@/components/contracts/public/PublicContractCompanyHeader";
import PublicContractDetails from "@/components/contracts/public/PublicContractDetails";
import PublicContractTermsSection from "@/components/contracts/public/PublicContractTermsSection";
import PublicContractSignTab from "@/components/contracts/public/PublicContractSignTab";
import ContractLoadingState from "@/components/ui/ContractLoadingState";
import ContractErrorState from "@/components/ui/ContractErrorState";

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
      className="min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-8 force-light"
      style={{ backgroundColor: brand.colors.light.bg }}
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
            backgroundColor: brand.colors.light.surface,
            border: `1px solid ${brand.colors.light.surfaceBorder}`,
            boxShadow: brand.colors.shadows.xl,
          }}
        >
          
          <div 
            className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b"
            style={{
              backgroundColor: signed ? brand.colors.success.bg : brand.colors.info.bg,
              borderColor: signed ? brand.colors.success.border : brand.colors.info.border,
            }}
          >
            <div className="flex items-center gap-3">
              {signed ? (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: brand.colors.success.bg }}
                >
                  <CheckCircle2 className="h-5 w-5" style={{ color: brand.colors.success.main }} />
                </div>
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: brand.colors.info.bg }}
                >
                  <FileText className="h-5 w-5" style={{ color: brand.colors.info.main }} />
                </div>
              )}
              <div>
                <h3 
                  className="text-sm font-bold"
                  style={{ color: signed ? brand.colors.success.text : brand.colors.info.text }}
                >
                  {signed ? "Contract Signed & Executed" : "Pending Your Signature"}
                </h3>
                <p 
                  className="text-xs"
                  style={{ color: signed ? brand.colors.success.text : brand.colors.info.text }}
                >
                  {signed 
                    ? "This agreement is fully executed." 
                    : "Please review details and sign to proceed."}
                </p>
              </div>
            </div>
            
            <button
              onClick={downloadPdf}
              disabled={isDownloadingPdf}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                        text-xs font-semibold transition-all shrink-0 
                        disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: brand.colors.light.surface,
                border: `1px solid ${brand.colors.light.surfaceBorder}`,
                color: brand.colors.ink.muted,
                boxShadow: brand.colors.shadows.sm,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = brand.colors.light.surfaceHover;
                e.currentTarget.style.borderColor = brand.colors.light.surfaceBorderStrong;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = brand.colors.light.surface;
                e.currentTarget.style.borderColor = brand.colors.light.surfaceBorder;
              }}
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download size={14} /> Download PDF
                </>
              )}
            </button>
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
            style={{ color: brand.colors.ink.faint }}
          >
            Secured by Rental Garage • Contract generated on {formatDate(contract.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
