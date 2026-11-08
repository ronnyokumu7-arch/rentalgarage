// src/app/contract/[token]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import {
  FileSignature,
  Download,
  CheckCircle2,
  Eraser,
  Loader2,
  CalendarDays,
  Car,
  MapPin,
} from "lucide-react";
import Image from "next/image";

// Logical Layer
import { usePublicContract } from "@/hooks/public-docs/usePublicContract";

// Reusable UI Kit
import PublicDocLayout from "@/components/public-docs/PublicDocLayout";
import PublicDocHeader from "@/components/public-docs/PublicDocHeader";
import PublicDocParties from "@/components/public-docs/PublicDocParties";
import PublicDocDetails from "@/components/public-docs/PublicDocDetails";
import PublicDocFinancials from "@/components/public-docs/PublicDocFinancials";
import PublicDocActions from "@/components/public-docs/PublicDocActions";
import SignaturePad, { SignaturePadRef } from "@/components/public-docs/SignaturePad";

export default function PublicContractPage() {
  const params = useParams();
  const token = params.token as string;
  const signatureRef = useRef<SignaturePadRef>(null);
  const [hasAttemptedSign, setHasAttemptedSign] = useState(false);

  const { contract, loading, error, isSigning, handleSign } = usePublicContract(token);

  const handleSignClick = () => {
    setHasAttemptedSign(true);
    const signatureData = signatureRef.current?.getSignature();
    if (!signatureData) {
      return; // The UI will show the error state below
    }
    handleSign(signatureData);
  };

  // 1. Loading & Error States
  if (loading) {
    return (
      <PublicDocLayout>
        <div className="p-12 text-center text-ink-muted animate-pulse">Loading Contract...</div>
      </PublicDocLayout>
    );
  }

  if (error || !contract) {
    return (
      <PublicDocLayout>
        <div className="p-12 text-center">
          <p className="text-danger-text font-semibold">{error || "Contract not found."}</p>
        </div>
      </PublicDocLayout>
    );
  }

  // 2. Map Data to UI Props
  const isSigned = contract.signed_by_client;

  const headerProps = {
    companyName: contract.tenant_name,
    documentNumber: contract.contract_number,
    docType: "contract" as const,
    status: isSigned ? ("signed" as const) : ("sent" as const),
  };

  const partiesProps = {
    issuerName: contract.tenant_name,
    recipientName: contract.client_name,
    recipientDetails: ["Primary Renter"],
  };

  const detailsProps = {
    title: "Rental Details",
    items: [
      { label: "Issue Date", value: new Date(contract.created_at).toLocaleDateString(), icon: CalendarDays },
      { label: "Return Date", value: new Date(contract.end_date).toLocaleDateString(), icon: CalendarDays },
      { label: "Vehicle", value: `${contract.vehicle_make} ${contract.vehicle_model}`, icon: Car },
      { label: "Plate Number", value: contract.vehicle_plate, icon: Car },
      { label: "Pickup Date", value: new Date(contract.start_date).toLocaleDateString(), icon: MapPin },
    ],
  };

  const financialsProps = {
    currency: contract.currency_code || "KES",
    rows: [
      {
        label: "Total Rental Agreement",
        value: `${contract.currency_code || "KES"} ${Number(contract.total_amount).toLocaleString()}`,
        isTotal: true,
      },
    ],
  };

  // 3. Render
  return (
    <PublicDocLayout>
      <PublicDocHeader {...headerProps} />
      <PublicDocParties {...partiesProps} />
      <PublicDocDetails {...detailsProps} />
      <PublicDocFinancials {...financialsProps} />

      {/* ── SIGNATURE SECTION ──────────────────────────────────────────── */}
      <div className="mt-8 pt-8 border-t border-surface-border">
        <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <FileSignature size={20} className="text-accent-dark" />
          Authorization & Signature
        </h3>
        
        <p className="text-sm text-ink-muted mb-4">
          By signing below, you agree to the terms and conditions of this rental agreement, 
          including liability for the vehicle and adherence to the return date.
        </p>

        {isSigned ? (
          /* ── ALREADY SIGNED STATE ── */
          <div className="bg-success-bg border border-success-border rounded-xl p-6 text-center">
            <CheckCircle2 size={48} className="mx-auto text-success mb-3" />
            <h4 className="text-lg font-bold text-success-text mb-1">Contract Executed</h4>
            <p className="text-sm text-success-text/80 mb-4">
              This contract was signed on {contract.signed_at ? new Date(contract.signed_at).toLocaleString() : 'the issue date'}.
            </p>
            {contract.signature_data && (
              <div className="inline-block bg-surface-card border border-surface-border rounded-lg p-4 mt-2">
                <Image
                  src={contract.signature_data}
                  alt="Client Signature"
                  width={320}
                  height={64}
                  unoptimized
                  className="h-16 w-auto mx-auto"
                />
                <p className="text-xs text-ink-subtle mt-2 font-medium">{contract.client_name}</p>
              </div>
            )}
          </div>
        ) : (
          /* ── PENDING SIGNATURE STATE ── */
          <div className="space-y-4">
            <SignaturePad ref={signatureRef} />
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => signatureRef.current?.clear()}
                className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors"
              >
                <Eraser size={16} /> Clear Signature
              </button>
              
              {hasAttemptedSign && !signatureRef.current?.getSignature() && (
                <span className="text-xs text-danger-text font-medium animate-pulse">
                  Please draw your signature above
                </span>
              )}
            </div>

            <button
              onClick={handleSignClick}
              disabled={isSigning}
              className="w-full btn btn-primary flex items-center justify-center gap-2 py-3.5 text-base shadow-lg shadow-accent-dark/10"
            >
              {isSigning ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <FileSignature size={18} /> Sign & Execute Contract
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER ACTIONS ─────────────────────────────────────────────── */}
      <div className="mt-8 pt-6 border-t border-surface-border">
        <PublicDocActions
          actions={[{
            label: "Download Signed PDF",
            icon: <Download size={16} />,
            onClick: () => {
              window.open(`/api/contracts/public/${token}/pdf`, "_blank");
            },
            disabled: !isSigned, // Only allow download if signed (or adjust if you allow downloading drafts)
            variant: "primary",
          }]}
        />
      </div>
    </PublicDocLayout>
  );
}
