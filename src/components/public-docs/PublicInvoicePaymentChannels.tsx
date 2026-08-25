"use client";

import { useState, useEffect, useMemo } from "react";
import { Smartphone, Store, Wallet, Send, Landmark, CreditCard, Info } from "lucide-react";
import type { PublicInvoiceView } from "@/lib/types";

interface PublicInvoicePaymentChannelsProps {
  invoice: PublicInvoiceView;
}

export default function PublicInvoicePaymentChannels({ invoice }: PublicInvoicePaymentChannelsProps) {
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  const pd = invoice?.payment_details ?? null;
  const tenantPhone = invoice?.tenant_phone ?? null;

  const mpesaMethod = pd?.method_type;
  const hasPaybill = mpesaMethod === "paybill" && !!pd?.business_shortcode;
  const hasTill = mpesaMethod === "till" && !!pd?.till_number;
  const hasPochi = mpesaMethod === "pochi" && !!pd?.till_number;
  const hasSendMoney = !!tenantPhone;
  const hasAirtel = !!pd?.airtel_number;
  const hasBank = !!(pd?.bank_name && pd?.bank_account_number);

  const availableChannels = useMemo(
    () =>
      [
        hasPaybill && { id: "paybill", label: "M-Pesa PayBill", icon: Smartphone, color: "emerald" },
        hasTill && { id: "till", label: "Buy Goods Till", icon: Store, color: "emerald" },
        hasPochi && { id: "pochi", label: "Pochi la Biashara", icon: Wallet, color: "emerald" },
        hasSendMoney && { id: "send_money", label: "Send Money", icon: Send, color: "emerald" },
        hasAirtel && { id: "airtel", label: "Airtel Money", icon: Smartphone, color: "red" },
        hasBank && { id: "bank", label: "Bank Transfer", icon: Landmark, color: "indigo" },
      ].filter(Boolean) as { id: string; label: string; icon: any; color: string }[],
    [hasPaybill, hasTill, hasPochi, hasSendMoney, hasAirtel, hasBank]
  );

  useEffect(() => {
    if (!activeChannel && availableChannels.length > 0) {
      setActiveChannel(availableChannels[0].id);
    } else if (activeChannel && !availableChannels.find((c) => c.id === activeChannel)) {
      setActiveChannel(availableChannels[0]?.id ?? null);
    }
  }, [availableChannels, activeChannel]);

  return (
    <div className="mt-6 sm:mt-10 p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-100">
      <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
        <CreditCard size={16} className="text-slate-600" /> How to Complete Payment
      </h4>
      <p className="text-xs text-slate-500 mb-4">
        {availableChannels.length > 0
          ? "Pay using your preferred channel, then record the transaction reference below."
          : "Payment instructions have not been configured for this agency."}
      </p>

      {availableChannels.length === 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-bold mb-1">Contact the agency to arrange payment</p>
            <p>
              Please call {invoice.tenant_phone || "the office"} or email {invoice.tenant_email || "the agency"} for
              payment details, or pay in cash at the office upon vehicle handover.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {availableChannels.map((ch) => {
              const Icon = ch.icon;
              const isActive = activeChannel === ch.id;
              const colorMap: Record<string, string> = {
                emerald: isActive ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-700 hover:border-slate-300",
                red: isActive ? "bg-red-50 border-red-300 ring-1 ring-red-300 text-red-700" : "bg-white border-slate-200 text-slate-700 hover:border-slate-300",
                indigo: isActive ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-700 hover:border-slate-300",
              };
              return (
                <button key={ch.id} type="button" onClick={() => setActiveChannel(ch.id)} className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${colorMap[ch.color]}`}>
                  <Icon size={13} /> {ch.label}
                </button>
              );
            })}
          </div>

          {activeChannel === "paybill" && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
              <p className="font-bold text-emerald-800 mb-2">M-Pesa PayBill Instructions:</p>
              <p>1. Go to M-Pesa → Lipa na M-Pesa → <span className="font-bold">PayBill</span></p>
              <p>2. Business Number: <span className="font-bold">{pd?.business_shortcode}</span></p>
              <p>3. Account Number: <span className="font-bold">{pd?.account_number || invoice.invoice_number}</span></p>
              <p>4. Enter the amount and your M-Pesa PIN, then send.</p>
            </div>
          )}
          {activeChannel === "till" && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
              <p className="font-bold text-emerald-800 mb-2">Buy Goods Till Instructions:</p>
              <p>1. Go to M-Pesa → Lipa na M-Pesa → <span className="font-bold">Buy Goods</span></p>
              <p>2. Till Number: <span className="font-bold">{pd?.till_number}</span></p>
              <p>3. Enter the amount and your M-Pesa PIN, then send.</p>
            </div>
          )}
          {activeChannel === "pochi" && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
              <p className="font-bold text-emerald-800 mb-2">Pochi la Biashara Instructions:</p>
              <p>1. Go to M-Pesa → <span className="font-bold">Pochi la Biashara</span></p>
              <p>2. Enter Number: <span className="font-bold">{pd?.till_number}</span></p>
              <p>3. Enter the amount and confirm.</p>
            </div>
          )}
          {activeChannel === "send_money" && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
              <p className="font-bold text-emerald-800 mb-2">Send Money Instructions:</p>
              <p>1. Go to M-Pesa → <span className="font-bold">Send Money</span></p>
              <p>2. Phone Number: <span className="font-bold">{invoice.tenant_phone}</span></p>
              <p>3. Enter the amount and your M-Pesa PIN, then send.</p>
            </div>
          )}
          {activeChannel === "airtel" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 space-y-1">
              <p className="font-bold text-red-800 mb-2">Airtel Money Instructions:</p>
              <p>1. Go to Airtel Money → <span className="font-bold">Send Money</span></p>
              <p>2. Phone Number: <span className="font-bold">{pd?.airtel_number}</span></p>
              <p>3. Enter the amount and your PIN, then send.</p>
            </div>
          )}
          {activeChannel === "bank" && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 space-y-1">
              <p className="font-bold text-indigo-800 mb-2">Bank Wire Transfer Details:</p>
              <p>Bank Name: <span className="font-bold">{pd?.bank_name}</span></p>
              <p>Account Name: <span className="font-bold">{pd?.bank_account_name || invoice.tenant_name}</span></p>
              <p>Account Number: <span className="font-bold">{pd?.bank_account_number}</span></p>
              {pd?.branch_code && <p>Branch Code: <span className="font-bold">{pd?.branch_code}</span></p>}
              {pd?.swift_code && <p>SWIFT Code: <span className="font-bold">{pd?.swift_code}</span></p>}
              <p>Payment Reference: <span className="font-bold">{invoice.invoice_number}</span></p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
