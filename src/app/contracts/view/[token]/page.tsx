"use client";

import { useParams } from "next/navigation";
import { FileText, CheckCircle as CheckCircle2, Download, CircleNotch as Loader2 } from "@phosphor-icons/react/ssr";
import { brand } from "@/lib/brand";

import { usePublicContract } from "@/components/contracts/public/hooks/usePublicContract";
import PublicContractCompanyHeader from "@/components/contracts/public/PublicContractCompanyHeader";
import PublicContractDetails from "@/components/contracts/public/PublicContractDetails";
import PublicContractTermsSection from "@/components/contracts/public/PublicContractTermsSection";
import PublicContractSignTab from "@/components/contracts/public/PublicContractSignTab";
import PublicContractHandoverTab from "@/components/contracts/public/PublicContractHandoverTab";
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
    submitHandover,
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
  };

  // ✅ NEW: 3-State Execution Logic
  const isHandoverSigned = !!contract.handover_signed_at;
  const requiresHandover = !!(contract.handover_items && contract.handover_items.length > 0);
  const showHandoverTab = signed && requiresHandover;
  
  const fullyExecuted = signed && (!requiresHandover || isHandoverSigned);
  const pendingHandover = signed && requiresHandover && !isHandoverSigned;

  return (
    <div 
      className="min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-8 force-light"
      style={{ backgroundColor: brand.colors.light.bg }}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* ✅ Main document card */}
        <div 
          className="rounded-xl sm:rounded-2xl overflow-hidden"
          style={{
            backgroundColor: brand.colors.light.surface,
            border: `1px solid ${brand.colors.light.surfaceBorder}`,
            boxShadow: brand.colors.shadows.xl,
          }}
        >
          {/* ✅ Letterhead is now the top of the document */}
          <PublicContractCompanyHeader 
            tenant={tenant}
            contractNumber={contract.contract_number}
          />

          {/* ✅ Status Banner: 3 States (Green = Fully Executed, Amber = Pending Handover, Blue = Pending Terms) */}
          <div 
            className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b"
            style={{
              backgroundColor: fullyExecuted ? brand.colors.success.bg : pendingHandover ? brand.colors.warning.bg : brand.colors.info.bg,
              borderColor: fullyExecuted ? brand.colors.success.border : pendingHandover ? brand.colors.warning.border : brand.colors.info.border,
            }}
          >
            <div className="flex items-center gap-3">
              {fullyExecuted ? (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: brand.colors.success.bg }}
                >
                  <CheckCircle2 className="h-5 w-5" style={{ color: brand.colors.success.main }} aria-hidden="true" />
                </div>
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: pendingHandover ? brand.colors.warning.bg : brand.colors.info.bg }}
                >
                  <FileText className="h-5 w-5" style={{ color: pendingHandover ? brand.colors.warning.main : brand.colors.info.main }} aria-hidden="true" />
                </div>
              )}
              <div>
                <h3 
                  className="text-sm font-bold"
                  style={{ color: fullyExecuted ? brand.colors.success.text : pendingHandover ? brand.colors.warning.text : brand.colors.info.text }}
                >
                  {fullyExecuted ? "Contract Fully Executed" 
                   : pendingHandover ? "Pending Handover Signature" 
                   : "Pending Your Signature"}
                </h3>
                <p 
                  className="text-xs"
                  style={{ color: fullyExecuted ? brand.colors.success.text : pendingHandover ? brand.colors.warning.text : brand.colors.info.text }}
                >
                  {fullyExecuted ? "All required signatures are complete." 
                   : pendingHandover ? "Terms signed — please confirm the vehicle handover checklist below." 
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
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download size={14} aria-hidden="true" /> Download PDF
                </>
              )}
            </button>
          </div>

          <PublicContractDetails contract={contract} />
          
          {/* ✅ WIRED: Pass all dynamic terms and policies from the backend */}
          <PublicContractTermsSection 
            tenantName={tenant.company_name} 
            contractTerms={contract.contract_terms}
            contractFooter={contract.contract_footer}
            effectivePolicies={contract.effective_policies}
          />
          
          {!signed && (
            <PublicContractSignTab 
              contract={contract}
              onSign={signContract}
              isSigned={signed}
            />
          )}

          {/* ✅ NEW: Handover Checklist (appears after signing, if vehicle has features) */}
          {showHandoverTab && (
            <PublicContractHandoverTab
              handoverItems={contract.handover_items ?? []}
              initialChecklist={contract.handover_checklist}
              isHandoverSigned={isHandoverSigned}
              onSubmitHandover={submitHandover}
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
