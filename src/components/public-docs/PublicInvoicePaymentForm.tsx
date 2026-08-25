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

  return (
    <div className="mt-6 p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-100">
      <h4 className="text-sm font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
        <CreditCard size={16} className="text-slate-600" /> Record Offline Payment
      </h4>
      {isPaid ? (
        <div className="text-center py-4">
          <p className="text-sm text-emerald-700 font-medium">This invoice has been fully paid.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Remaining Balance:</span>
            <span className="text-sm font-bold text-amber-900">{invoice.currency_code} {remaining.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount ({invoice.currency_code}) *</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                max={remaining} 
                step="0.01" 
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                placeholder="e.g., 5000" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Method *</label>
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value as "mpesa" | "manual")} 
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="mpesa">M-Pesa</option>
                <option value="manual">Bank Transfer / Cash / Airtel</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {method === "mpesa" ? "M-Pesa Transaction Code *" : "Reference / Receipt Number"}
            </label>
            <input 
              type="text" 
              value={reference} 
              onChange={(e) => setReference(e.target.value)} 
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              placeholder={method === "mpesa" ? "e.g., QFG34HJ8L" : "Optional"} 
              required={method === "mpesa"} 
            />
          </div>
          <button 
            type="submit" 
            disabled={isPaying} 
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPaying ? (<><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>) : (<><CreditCard size={16} /> Confirm Payment</>)}
          </button>
        </form>
      )}
    </div>
  );
}
