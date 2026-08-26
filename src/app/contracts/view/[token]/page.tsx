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
    <div className="min-h-screen bg-slate-50 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        
        <PublicContractCompanyHeader 
          tenant={tenant}
          bookingNumber={contract.booking_number || `BK-${contract.booking_id}`}
        />

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          <div className={`p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${
            signed ? "bg-emerald-50 border-emerald-100" : "bg-blue-50 border-blue-100"
          }`}>
            <div className="flex items-center gap-3">
              {signed ? (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div>
                <h3 className={`text-sm font-bold ${signed ? "text-emerald-900" : "text-blue-900"}`}>
                  {signed ? "Contract Signed & Executed" : "Pending Your Signature"}
                </h3>
                <p className={`text-xs ${signed ? "text-emerald-700" : "text-blue-700"}`}>
                  {signed 
                    ? "This agreement is fully executed." 
                    : "Please review details and sign to proceed."}
                </p>
              </div>
            </div>
            
<button
  onClick={downloadPdf}
  disabled={isDownloadingPdf}
  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm shrink-0 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 active:shadow-inner"
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
          <p className="text-xs text-slate-400">
            Secured by Rental Garage • Contract generated on {formatDate(contract.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
