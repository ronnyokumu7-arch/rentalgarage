// src/components/contracts/public/PublicContractSignTab.tsx
"use client";

import { useState, useRef } from "react";
import { CheckCircle2, FileText, Loader2, Eraser } from "lucide-react";
import SignaturePad, { SignaturePadRef } from "@/components/public-docs/SignaturePad";
import type { PublicContractView } from "@/lib/types";
import toast from "react-hot-toast";

interface Props {
  contract: PublicContractView;
  onSign: (signature: string) => Promise<boolean>; // Now returns boolean
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
        toast.success("Contract signed successfully!");
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
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Contract Signed</h3>
          <p className="text-sm text-slate-500 mt-2">
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
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText size={16} className="text-slate-600" />
            Electronic Signature
          </h4>
          <button
            type="button"
            onClick={handleClearSignature}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
            title="Clear signature and start over"
          >
            <Eraser size={12} />
            Clear Signature
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Please draw your signature in the box below. This will be attached to your contract.
        </p>
        
        {/* Signature Pad Container */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden relative group">
          <SignaturePad ref={signatureRef} />
        </div>
      </div>

      {/* Mandatory Terms Acceptance Checkbox */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <input
          type="checkbox"
          id="terms-accept"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer shrink-0"
        />
        <label 
          htmlFor="terms-accept" 
          className="text-xs text-blue-900 leading-relaxed cursor-pointer select-none"
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
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
          text-sm font-bold transition-all shadow-lg
          ${termsAccepted && !signing
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 cursor-pointer" 
            : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          }
        `}
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
      <p className="text-xs text-slate-400 text-center">
        Your signature is legally binding. A timestamped copy will be generated and available for download.
      </p>
    </div>
  );
}
