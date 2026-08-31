// src/components/contracts/public/PublicContractActions.tsx
"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { brand } from "@/lib/brand";

interface Props {
  onSign: (signature: string) => Promise<boolean>;
  isSigning?: boolean;
  signed?: boolean;
}

export default function PublicContractActions({ 
  onSign, 
  isSigning = false, 
  signed = false 
}: Props) {
  return (
    <div 
      className="p-4 sm:px-8 sm:py-6 border-t"
      style={{ 
        backgroundColor: brand.colors.light.bgElevated,
        borderColor: brand.colors.light.surfaceBorder
      }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Simple English confirmation text */}
        <p 
          className="text-xs text-center sm:text-left max-w-md"
          style={{ color: brand.colors.ink.muted }}
        >
          By clicking sign, you confirm you have read and agree to all terms above.
        </p>
        
        {/* Sign button with loading state */}
        {!signed ? (
          <button
            onClick={() => onSign("")}
            disabled={isSigning}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                      text-sm font-bold shrink-0 group"
            style={{
              backgroundColor: brand.colors.info.main,
              color: '#FFFFFF',
              boxShadow: brand.colors.shadows.lg,
              transition: `all ${brand.easing.spring}`,
              transform: 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              if (!isSigning) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `${brand.colors.shadows.xl}, 0 0 0 3px ${brand.colors.info.border}`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSigning) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = brand.colors.shadows.lg;
              }
            }}
            onMouseDown={(e) => {
              if (!isSigning) {
                e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
              }
            }}
            onMouseUp={(e) => {
              if (!isSigning) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
              }
            }}
          >
            {isSigning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> 
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> 
                Sign Contract
              </>
            )}
          </button>
        ) : (
          /* Success state - contract already signed */
          <div 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                      text-sm font-bold border shrink-0"
            style={{
              backgroundColor: brand.colors.success.bg,
              color: brand.colors.success.text,
              borderColor: brand.colors.success.border,
              transition: `all ${brand.easing.smooth}`,
            }}
          >
            <CheckCircle2 size={16} style={{ color: brand.colors.success.main }} />
            Contract Signed
          </div>
        )}
      </div>
    </div>
  );
}
