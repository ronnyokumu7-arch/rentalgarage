// src/components/contracts/public/PublicContractSignTab.tsx
"use client";

import { useState, useRef } from "react";
import { CheckCircle2, FileText, Loader2, Eraser } from "lucide-react";
import { brand } from "@/lib/brand";
import SignaturePad, { SignaturePadRef } from "@/components/public-docs/SignaturePad";
import type { PublicContractView } from "@/lib/types";
import toast from "react-hot-toast";

interface Props {
  contract: PublicContractView;
  onSign: (signature: string) => Promise<boolean>;
  isSigned: boolean;
}

export default function PublicContractSignTab({ contract, onSign, isSigned }: Props) {
  const signatureRef = useRef<SignaturePadRef>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(isSigned);

  const handleClearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSign = async () => {
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions to proceed.");
      return;
    }

    const signature = signatureRef.current?.getSignature();
    if (!signature) {
      toast.error("Please draw your signature in the box above.");
      return;
    }

    setSigning(true);
    
    try {
      const success = await onSign(signature);
      
      if (success) {
        setSigned(true);
      } else {
        toast.error("Failed to sign contract. Please try again.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  // Success State
  if (signed) {
    return (
      <div className="p-8 text-center space-y-4">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: brand.colors.success.bg }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: brand.colors.success.main }} />
        </div>
        <div>
          <h3 
            className="text-lg font-bold"
            style={{ color: brand.colors.ink.primary }}
          >
            Contract Signed
          </h3>
          <p 
            className="text-sm mt-2"
            style={{ color: brand.colors.ink.muted }}
          >
            Thank you, {contract.client_name}. Your rental agreement is complete and legally binding.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Signature Pad Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 
            className="text-sm font-bold flex items-center gap-2"
            style={{ color: brand.colors.ink.primary }}
          >
            <FileText size={16} style={{ color: brand.colors.ink.muted }} />
            Electronic Signature
          </h4>
          <button
            type="button"
            onClick={handleClearSignature}
            className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-colors active:scale-95"
            style={{ 
              color: brand.colors.ink.muted,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = brand.colors.danger.main;
              e.currentTarget.style.backgroundColor = brand.colors.danger.bg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = brand.colors.ink.muted;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Clear signature and start over"
          >
            <Eraser size={12} />
            Clear Signature
          </button>
        </div>

        <p 
          className="text-xs mb-3"
          style={{ color: brand.colors.ink.muted }}
        >
          Please draw your signature in the box below. This will be attached to your contract.
        </p>
        
        {/* Signature Pad Container */}
        <div 
          className="border-2 border-dashed rounded-xl overflow-hidden relative group"
          style={{ 
            borderColor: brand.colors.light.surfaceBorderStrong,
            backgroundColor: brand.colors.light.surface
          }}
        >
          <SignaturePad ref={signatureRef} />
        </div>
      </div>

      {/* Mandatory Terms Acceptance Checkbox */}
      <div 
        className="flex items-start gap-3 p-4 rounded-xl border"
        style={{ 
          backgroundColor: brand.colors.info.bg,
          borderColor: brand.colors.info.border
        }}
      >
        <input
          type="checkbox"
          id="terms-accept"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded focus:ring-2 cursor-pointer shrink-0"
          style={{ 
            borderColor: brand.colors.light.surfaceBorderStrong,
            color: brand.colors.info.main,
            accentColor: brand.colors.info.main
          }}
        />
        <label 
          htmlFor="terms-accept" 
          className="text-xs leading-relaxed cursor-pointer select-none"
          style={{ color: brand.colors.info.text }}
        >
          <span className="font-semibold">I have read and agree to the Terms & Conditions and Agency Policies.</span>
          <br />
          By checking this box, I confirm I understand all rules, fees, liabilities, and insurance terms outlined above and in the full PDF contract.
        </label>
      </div>

      {/* Sign Button */}
      <button
        onClick={handleSign}
        disabled={!termsAccepted || signing}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-[0.98] active:shadow-inner"
        style={{
          backgroundColor: termsAccepted && !signing ? brand.colors.info.main : brand.colors.light.surfaceActive,
          color: termsAccepted && !signing ? '#FFFFFF' : brand.colors.ink.faint,
          boxShadow: termsAccepted && !signing ? `0 4px 12px ${brand.colors.info.border}` : 'none',
          cursor: termsAccepted && !signing ? 'pointer' : 'not-allowed',
        }}
      >
        {signing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <CheckCircle2 size={16} /> Sign Contract
          </>
        )}
      </button>

      {/* Legal Footer Note */}
      <p 
        className="text-xs text-center"
        style={{ color: brand.colors.ink.faint }}
      >
        Your signature is legally binding. A timestamped copy will be generated and available for download.
      </p>
    </div>
  );
}
