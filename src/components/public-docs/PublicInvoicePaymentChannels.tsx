// src/components/public-docs/PublicInvoicePaymentChannels.tsx
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

  const containerStyle: React.CSSProperties = {
    marginTop: '1.5rem',
    padding: '1.5rem',
    background: '#FAF9F7',
    borderRadius: '0.75rem',
    border: '1px solid rgba(28, 25, 23, 0.06)',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#1C1917',
    marginBottom: '0.25rem',
  };

  const sectionSubtitleStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#57534E',
    marginBottom: '1rem',
  };

  const activeTabStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderColor: '#6D28D9',
    boxShadow: '0 0 0 3px rgba(109, 40, 217, 0.10)',
    color: '#6D28D9',
  };

  const inactiveTabStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderColor: 'rgba(28, 25, 23, 0.10)',
    color: '#44403C',
  };

  const instructionBoxStyle: React.CSSProperties = {
    padding: '1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    lineHeight: '1.5',
  };

  const channelColors: Record<string, { bg: string; border: string; text: string; heading: string }> = {
    emerald: {
      bg: 'rgba(4, 120, 87, 0.05)',
      border: 'rgba(4, 120, 87, 0.20)',
      text: '#047857',
      heading: '#047857',
    },
    red: {
      bg: 'rgba(185, 28, 28, 0.05)',
      border: 'rgba(185, 28, 28, 0.20)',
      text: '#B91C1C',
      heading: '#B91C1C',
    },
    indigo: {
      bg: 'rgba(29, 78, 216, 0.05)',
      border: 'rgba(29, 78, 216, 0.20)',
      text: '#1D4ED8',
      heading: '#1D4ED8',
    },
  };

  return (
    <div style={containerStyle}>
      <h4 className="flex items-center gap-2" style={sectionTitleStyle}>
        <CreditCard size={16} style={{ color: '#57534E' }} /> How to Complete Payment
      </h4>
      <p style={sectionSubtitleStyle}>
        {availableChannels.length > 0
          ? "Pay using your preferred channel, then record the transaction reference below."
          : "Payment instructions have not been configured for this agency."}
      </p>

      {availableChannels.length === 0 ? (
        <div 
          className="flex items-start gap-3"
          style={{
            padding: '1rem',
            background: 'rgba(180, 83, 9, 0.05)',
            border: '1px solid rgba(180, 83, 9, 0.20)',
            borderRadius: '0.5rem',
          }}
        >
          <Info size={16} style={{ color: '#B45309', flexShrink: 0, marginTop: '0.125rem' }} />
          <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
            <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Contact the agency to arrange payment</p>
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
              return (
                <button 
                  key={ch.id} 
                  type="button" 
                  onClick={() => setActiveChannel(ch.id)} 
                  className="px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors"
                  style={isActive ? activeTabStyle : inactiveTabStyle}
                >
                  <Icon size={13} /> {ch.label}
                </button>
              );
            })}
          </div>

          {activeChannel === "paybill" && (
            <div style={{ ...instructionBoxStyle, ...channelColors.emerald }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: channelColors.emerald.heading }}>M-Pesa PayBill Instructions:</p>
              <p>1. Go to M-Pesa → Lipa na M-Pesa → <span style={{ fontWeight: 700 }}>PayBill</span></p>
              <p>2. Business Number: <span style={{ fontWeight: 700 }}>{pd?.business_shortcode}</span></p>
              <p>3. Account Number: <span style={{ fontWeight: 700 }}>{pd?.account_number || invoice.invoice_number}</span></p>
              <p>4. Enter the amount and your M-Pesa PIN, then send.</p>
            </div>
          )}
          {activeChannel === "till" && (
            <div style={{ ...instructionBoxStyle, ...channelColors.emerald }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: channelColors.emerald.heading }}>Buy Goods Till Instructions:</p>
              <p>1. Go to M-Pesa → Lipa na M-Pesa → <span style={{ fontWeight: 700 }}>Buy Goods</span></p>
              <p>2. Till Number: <span style={{ fontWeight: 700 }}>{pd?.till_number}</span></p>
              <p>3. Enter the amount and your M-Pesa PIN, then send.</p>
            </div>
          )}
          {activeChannel === "pochi" && (
            <div style={{ ...instructionBoxStyle, ...channelColors.emerald }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: channelColors.emerald.heading }}>Pochi la Biashara Instructions:</p>
              <p>1. Go to M-Pesa → <span style={{ fontWeight: 700 }}>Pochi la Biashara</span></p>
              <p>2. Enter Number: <span style={{ fontWeight: 700 }}>{pd?.till_number}</span></p>
              <p>3. Enter the amount and confirm.</p>
            </div>
          )}
          {activeChannel === "send_money" && (
            <div style={{ ...instructionBoxStyle, ...channelColors.emerald }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: channelColors.emerald.heading }}>Send Money Instructions:</p>
              <p>1. Go to M-Pesa → <span style={{ fontWeight: 700 }}>Send Money</span></p>
              <p>2. Phone Number: <span style={{ fontWeight: 700 }}>{invoice.tenant_phone}</span></p>
              <p>3. Enter the amount and your M-Pesa PIN, then send.</p>
            </div>
          )}
          {activeChannel === "airtel" && (
            <div style={{ ...instructionBoxStyle, ...channelColors.red }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: channelColors.red.heading }}>Airtel Money Instructions:</p>
              <p>1. Go to Airtel Money → <span style={{ fontWeight: 700 }}>Send Money</span></p>
              <p>2. Phone Number: <span style={{ fontWeight: 700 }}>{pd?.airtel_number}</span></p>
              <p>3. Enter the amount and your PIN, then send.</p>
            </div>
          )}
          {activeChannel === "bank" && (
            <div style={{ ...instructionBoxStyle, ...channelColors.indigo }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: channelColors.indigo.heading }}>Bank Wire Transfer Details:</p>
              <p>Bank Name: <span style={{ fontWeight: 700 }}>{pd?.bank_name}</span></p>
              <p>Account Name: <span style={{ fontWeight: 700 }}>{pd?.bank_account_name || invoice.tenant_name}</span></p>
              <p>Account Number: <span style={{ fontWeight: 700 }}>{pd?.bank_account_number}</span></p>
              {pd?.branch_code && <p>Branch Code: <span style={{ fontWeight: 700 }}>{pd?.branch_code}</span></p>}
              {pd?.swift_code && <p>SWIFT Code: <span style={{ fontWeight: 700 }}>{pd?.swift_code}</span></p>}
              <p>Payment Reference: <span style={{ fontWeight: 700 }}>{invoice.invoice_number}</span></p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
