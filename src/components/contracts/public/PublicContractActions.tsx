// src/components/contracts/public/PublicContractActions.tsx
"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

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
      className="p-4 sm:px-8 sm:py-6"
      style={{
        background: '#FAF9F7',
        borderTop: '1px solid rgba(28, 25, 23, 0.10)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Simple English confirmation text */}
        <p 
          className="text-xs text-center sm:text-left max-w-md"
          style={{ color: '#57534E' }}
        >
          By clicking sign, you confirm you have read and agree to all terms above.
        </p>
        
        {/* Sign button with loading state */}
        {!signed ? (
          <button
            onClick={() => onSign("")} // Signature handled by parent via signature pad
            disabled={isSigning}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(109, 40, 217, 0.25)',
              cursor: isSigning ? 'not-allowed' : 'pointer',
              opacity: isSigning ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSigning) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(109, 40, 217, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(109, 40, 217, 0.25)';
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shrink-0"
            style={{
              background: 'rgba(4, 120, 87, 0.05)',
              color: '#047857',
              border: '1px solid rgba(4, 120, 87, 0.20)',
            }}
          >
            <CheckCircle2 size={16} style={{ color: '#047857' }} />
            Contract Signed
          </div>
        )}
      </div>
    </div>
  );
}
