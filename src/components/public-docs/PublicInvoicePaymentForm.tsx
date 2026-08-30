// src/components/public-docs/PublicInvoicePaymentForm.tsx
"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { PublicInvoiceView } from "@/lib/types";

interface PublicInvoicePaymentFormProps {
  invoice: PublicInvoiceView;
  isPaying: boolean;
  onRecordPayment: (amount: number, method: "mpesa" | "manual", reference: string) => void;
}

export default function PublicInvoicePaymentForm({ invoice, isPaying, onRecordPayment }: PublicInvoicePaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"mpesa" | "manual">("mpesa");
  const [reference, setReference] = useState("");

  const isPaid = invoice.status === "paid";
  const remaining = invoice.remaining_balance ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!reference && method === "mpesa") {
      toast.error("M-Pesa reference is required");
      return;
    }
    onRecordPayment(parseFloat(amount), method, reference);
  };

  const containerStyle: React.CSSProperties = {
    marginTop: '1.5rem',
    padding: '1.5rem',
    background: '#FAF9F7',
    borderRadius: '0.75rem',
    border: '1px solid rgba(28, 25, 23, 0.06)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#1C1917',
    marginBottom: '1rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#57534E',
    marginBottom: '0.375rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(28, 25, 23, 0.15)',
    fontSize: '0.875rem',
    color: '#1C1917',
    background: '#FFFFFF',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#6D28D9';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(109, 40, 217, 0.15)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'rgba(28, 25, 23, 0.15)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={containerStyle}>
      <h4 className="flex items-center gap-2" style={titleStyle}>
        <CreditCard size={16} style={{ color: '#57534E' }} /> Record Offline Payment
      </h4>
      {isPaid ? (
        <div className="text-center py-4">
          <p 
            className="text-sm font-medium"
            style={{ color: '#047857' }}
          >
            This invoice has been fully paid.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div 
            className="flex items-center justify-between"
            style={{
              padding: '0.75rem',
              background: 'rgba(180, 83, 9, 0.05)',
              border: '1px solid rgba(180, 83, 9, 0.20)',
              borderRadius: '0.5rem',
            }}
          >
            <span 
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#B45309',
              }}
            >
              Remaining Balance:
            </span>
            <span 
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#B45309',
              }}
            >
              {invoice.currency_code} {remaining.toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label style={labelStyle}>Amount ({invoice.currency_code}) *</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                max={remaining} 
                step="0.01" 
                style={inputStyle}
                placeholder="e.g., 5000" 
                required 
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <label style={labelStyle}>Payment Method *</label>
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value as "mpesa" | "manual")} 
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="mpesa">M-Pesa</option>
                <option value="manual">Bank Transfer / Cash / Airtel</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>
              {method === "mpesa" ? "M-Pesa Transaction Code *" : "Reference / Receipt Number"}
            </label>
            <input 
              type="text" 
              value={reference} 
              onChange={(e) => setReference(e.target.value)} 
              style={inputStyle}
              placeholder={method === "mpesa" ? "e.g., QFG34HJ8L" : "Optional"} 
              required={method === "mpesa"} 
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <button 
            type="submit" 
            disabled={isPaying} 
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(109, 40, 217, 0.25)',
              cursor: isPaying ? 'not-allowed' : 'pointer',
              opacity: isPaying ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isPaying) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(109, 40, 217, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(109, 40, 217, 0.25)';
            }}
          >
            {isPaying ? (<><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>) : (<><CreditCard size={16} /> Confirm Payment</>)}
          </button>
        </form>
      )}
    </div>
  );
}
