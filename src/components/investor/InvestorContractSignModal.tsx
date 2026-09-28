"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { CheckCircle, AlertCircle, Loader2, PenLine, RotateCcw, X, Download } from "lucide-react";
import { investorContractsApi } from "@/lib/api/investorContracts";
import type { InvestorContract } from "@/lib/types";
import toast from "react-hot-toast";

interface InvestorContractSignModalProps {
  contract: InvestorContract;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultRole?: "agency" | "investor";
}

export default function InvestorContractSignModal({
  contract,
  isOpen,
  onClose,
  onSuccess,
  defaultRole = "investor",
}: InvestorContractSignModalProps) {
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isSigning, setIsSigning] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isAgreed, setIsAgreed] = useState(false);
  const signerRole = defaultRole;
  
  // ✅ FIX: Dynamically match canvas resolution to container size to prevent mobile offset
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 200 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasSize({ width: containerRef.current.offsetWidth, height: 200 });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!isOpen) return null;

  const handleClear = () => {
    sigCanvasRef.current?.clear();
    setIsEmpty(true);
  };

  const handleSign = async () => {
    if (isEmpty || !isAgreed) {
      toast.error("Please draw your signature and agree to the terms.");
      return;
    }

    setIsSigning(true);
    try {
      const signatureDataUrl = sigCanvasRef.current?.toDataURL("image/png");
      if (!signatureDataUrl) throw new Error("Failed to capture signature");

      await investorContractsApi.sign(contract.id, {
        signature: signatureDataUrl,
        signer_role: signerRole,
      });

      toast.success("Contract signed successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to sign contract.");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-y-auto animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <PenLine size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-ink)]">
                {signerRole === "agency" ? "Sign as Agency Representative" : "Sign Lease Agreement"}
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)]">Contract #{contract.contract_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contract Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
            <div>
              <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase mb-1">Vehicle</p>
              <p className="text-sm font-medium text-[var(--color-ink)]">{contract.vehicle_plate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase mb-1">Lease Rate</p>
              <p className="text-sm font-medium text-[var(--color-ink)]">KES {Number(contract.lease_rate).toLocaleString()} / {contract.lease_rate_type}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase mb-1">Duration</p>
              <p className="text-sm font-medium text-[var(--color-ink)]">{contract.duration_months ? `${contract.duration_months} Month(s)` : 'Per Active Rental Day'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase mb-1">
                {signerRole === "agency" ? "Investor Status" : "Agency Status"}
              </p>
              <div className="flex items-center gap-1.5">
                {signerRole === "agency" ? (
                  contract.signed_by_investor ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle size={12} /> Signed by Investor</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400"><AlertCircle size={12} /> Pending Investor</span>
                  )
                ) : (
                  contract.signed_by_agency ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle size={12} /> Signed by Agency</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400"><AlertCircle size={12} /> Pending Agency</span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* ✅ View PDF Button */}
          <a 
            href={`${process.env.NEXT_PUBLIC_API_URL}/investor-contracts/${contract.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 transition-all border border-[var(--color-primary)]/20"
          >
            <Download size={16} /> View / Download Contract PDF
          </a>

          {/* Signature Pad */}
          <div>
            <h4 className="text-sm font-bold text-[var(--color-ink)] mb-3 flex items-center gap-2">
              <PenLine size={16} className="text-[var(--color-primary)]" />
              {signerRole === "agency" ? "Agency Representative Signature" : "Your Electronic Signature"}
            </h4>
            
            {/* ✅ FIX: Container ref for dynamic sizing */}
            <div ref={containerRef} className="w-full h-[200px] relative mb-2">
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor="#0f172a"
                minWidth={0.5}
                maxWidth={2.5}
                dotSize={1} 
                throttle={0}
                velocityFilterWeight={0.1}
                canvasProps={{
                  width: canvasSize.width,
                  height: canvasSize.height,
                  className: "w-full h-full border-2 border-dashed border-[var(--color-surface-border)] rounded-xl bg-white cursor-crosshair",
                  style: { touchAction: "none" } // ✅ CRITICAL: Prevents page scroll while drawing on mobile
                }}
                onBegin={() => setIsEmpty(false)}
                onEnd={() => {
                  if (sigCanvasRef.current?.isEmpty()) setIsEmpty(true);
                }}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-[var(--color-surface-hover)] hover:bg-red-500/10 text-[var(--color-ink-muted)] hover:text-red-500 transition-colors"
                title="Clear signature"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {isEmpty && (
              <p className="text-xs text-[var(--color-ink-subtle)] text-center -mt-2">
                Please draw your signature in the box above.
              </p>
            )}
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] cursor-pointer">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[var(--color-surface-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
            />
            <span className="text-xs text-[var(--color-ink)] leading-relaxed">
              {signerRole === "agency" 
                ? "By checking this box and signing above, I confirm that I am an authorized representative of the agency and legally bind the agency to the terms of this lease agreement."
                : "By checking this box and signing above, I acknowledge that I have read, understood, and agree to be legally bound by the terms of this lease agreement."}
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all">
              Cancel
            </button>
            <button
              onClick={handleSign}
              disabled={isSigning || isEmpty || !isAgreed}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigning ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              {isSigning ? "Securing Signature..." : "Sign Contract"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
