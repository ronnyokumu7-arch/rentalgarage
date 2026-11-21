// src/components/contracts/public/PublicContractTermsSection.tsx
"use client";

import { useState } from "react";
import { 
  Shield, Scales as Scale, WarningCircle as AlertCircle, FileText, CheckCircle as CheckCircle2, 
  CaretDown, FilePdf 
} from "@phosphor-icons/react/ssr";
import { brand } from "@/lib/brand";
import { MarkdownLitePreview } from "@/lib/markdownLite";

interface PolicyClause {
  category: string;
  clause_key?: string | null;
  title: string;
  content: string;
  display_order: number;
}

interface Props {
  tenantName: string;
  contractTerms?: string | null;
  contractFooter?: string | null;
  effectivePolicies?: PolicyClause[] | null;
  onDownloadPdf?: () => void;
}

const TABS = [
  { id: "summary", label: "Summary", icon: Shield },
  { id: "terms", label: "Terms & Rules", icon: Scale },
  { id: "policies", label: "Agency Policies", icon: AlertCircle },
];

const CURATED_POLICIES = [
  { 
    key: "General Rental Terms", 
    fallback: "The renter must be at least 23 years of age and hold a valid driver's license. The vehicle must be used only for lawful purposes and within the agreed geographical limits." 
  },
  { 
    key: "Fuel Policy", 
    fallback: "The rental vehicle is provided as-is. Please return it with the same fuel level (or slightly higher if possible). Any fuel shortfall will be billed separately at a premium rate." 
  },
  { 
    key: "Damage Policy", 
    fallback: "The renter is liable for all damage, loss, or theft occurring during the rental period. Pre-existing damage will be noted on the vehicle condition report at handover." 
  },
  { 
    key: "Cancellation Policy", 
    fallback: "Cancellations made more than 24 hours before the rental start time are eligible for a full refund. Cancellations within 24 hours will incur a standard administrative charge." 
  },
  { 
    key: "Car Wash Policy", 
    fallback: "The vehicle is provided in a professionally washed and cleaned condition. A standard car wash fee is included. You may return the vehicle as-is after normal use, but excessive mud or dirt may incur a cleaning fee." 
  },
];

export default function PublicContractTermsSection({ 
  tenantName, 
  contractTerms, 
  contractFooter, 
  effectivePolicies,
  onDownloadPdf 
}: Props) {
  const [activeTab, setActiveTab] = useState("summary");

  const hasCustomTerms = !!contractTerms && contractTerms.trim().length > 0;

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: brand.colors.ink.primary }}>
          <FileText size={18} style={{ color: brand.colors.info.light }} aria-hidden="true" />
          Terms & Conditions
        </h3>
        <p className="text-xs mt-1" style={{ color: brand.colors.ink.muted }}>
          Review the contract terms before signing.
        </p>
      </div>

      <div className="mb-6 border-b" style={{ borderColor: brand.colors.light.surfaceBorder }}>
        <nav className="flex gap-1 -mb-px overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 text-xs font-semibold 
                  whitespace-nowrap transition-colors border-b-2 focus:outline-none
                `}
                style={{
                  borderColor: isActive ? brand.colors.info.light : 'transparent',
                  color: isActive ? brand.colors.info.text : brand.colors.ink.muted,
                  backgroundColor: isActive ? brand.colors.info.bg : 'transparent',
                }}
              >
                <Icon size={14} aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="min-h-[300px]">
        {activeTab === "summary" && (
          <SummaryTab tenantName={tenantName} contractFooter={contractFooter} />
        )}
        {activeTab === "terms" && (
          <TermsTab hasCustomTerms={hasCustomTerms} customTerms={contractTerms} />
        )}
        {activeTab === "policies" && (
          <PoliciesTab 
            effectivePolicies={effectivePolicies}
            onDownloadPdf={onDownloadPdf}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Tab 1: Summary
// ============================================================================
function SummaryTab({ tenantName, contractFooter }: { tenantName: string; contractFooter?: string | null }) {
  return (
    <div className="space-y-4">
      <div 
        className="p-4 rounded-xl border"
        style={{ backgroundColor: brand.colors.info.bg, borderColor: brand.colors.info.border }}
      >
        <h4 className="text-sm font-bold mb-3" style={{ color: brand.colors.info.text }}>
          Your Declaration
        </h4>
        <p className="text-xs mb-3" style={{ color: brand.colors.info.text }}>
          By signing, you confirm:
        </p>
        <ul className="space-y-2">
          {[
            "I will use this car for legal purposes only",
            "I am between 23 and 70 years old",
            "I am physically fit to drive safely",
            "My Driver's license is valid and held for 2+ years",
            "I have no serious driving offenses in the last 5 years"
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={14} style={{ color: brand.colors.info.light }} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-xs" style={{ color: brand.colors.info.text }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div 
        className="p-4 rounded-xl border"
        style={{ backgroundColor: brand.colors.light.surfaceWarm, borderColor: brand.colors.light.surfaceBorder }}
      >
        <p className="text-xs leading-relaxed" style={{ color: brand.colors.ink.muted }}>
          By signing this document, you agree to all rental terms and conditions provided by {tenantName}. 
          The full legal agreement is available in the PDF download.
        </p>

        {contractFooter && contractFooter.trim() && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: brand.colors.light.surfaceBorder }}>
            <p className="text-xs font-semibold mb-2" style={{ color: brand.colors.ink.primary }}>
              Additional Notes from {tenantName}:
            </p>
            <MarkdownLitePreview raw={contractFooter} variant="contract" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Tab 2: General Terms
// ============================================================================
function TermsTab({ hasCustomTerms, customTerms }: { hasCustomTerms: boolean; customTerms?: string | null }) {
  if (hasCustomTerms && customTerms) {
    return (
      <div 
        className="p-4 rounded-xl border"
        style={{ 
          backgroundColor: brand.colors.light.surface,
          borderColor: brand.colors.light.surfaceBorder,
        }}
      >
        <MarkdownLitePreview raw={customTerms} variant="contract" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ArticleItem number={1} title="Who Can Drive" content="Only you or drivers we approve can drive this car. You cannot: use it for paid passenger transport, tow other vehicles, drive under the influence, carry illegal goods, or overload the car." />
      <ArticleItem number={2} title="Car Condition" content="You received the car in good condition. If tires are damaged (not normal wear), you replace them. Do not tamper with the trip recorder. If it fails, you pay for 500 KM per day." />
      <ArticleItem number={3} title="Extending Your Rental" content="Want to keep the car longer? Ask us first and pay the extra cost before the original return time. Late returns without approval may be treated as unauthorized use." />
      <ArticleItem number={4} title="Payments & Fines" content="Pay on time. Late payments get 2% monthly interest. You're responsible for traffic fines, parking tickets, and tolls during your rental." />
      <ArticleItem number={5} title="Insurance & Accidents" content="Report any accident, theft, or damage to us within 24 hours AND to police if there's injury or theft. Get a police report. Do not admit fault or settle with others without us." />
    </div>
  );
}

// ============================================================================
// Tab 3: Agency Policies (Curated Preview + Accordion)
// ============================================================================
function PoliciesTab({ 
  effectivePolicies,
  onDownloadPdf 
}: { 
  effectivePolicies?: PolicyClause[] | null;
  onDownloadPdf?: () => void;
}) {
  
  const findPolicy = (key: string) => 
    effectivePolicies?.find(p => p.title.toLowerCase().includes(key.toLowerCase()));

  return (
    <div className="space-y-6">
      <div 
        className="rounded-2xl border p-5 sm:p-6 space-y-4"
        style={{ 
          backgroundColor: brand.colors.warning.bg, 
          borderColor: brand.colors.warning.border 
        }}
      >
        <div className="flex items-start gap-3 mb-2">
          <div 
            className="p-2 rounded-lg shrink-0"
            style={{ backgroundColor: brand.colors.warning.border }}
          >
            <AlertCircle size={20} style={{ color: brand.colors.warning.text }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: brand.colors.warning.text }}>
              Key Rental Policies
            </h3>
            <p className="text-xs mt-0.5" style={{ color: brand.colors.warning.text }}>
              Important terms you must agree to. Tap any item to read the full details.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {CURATED_POLICIES.map((config) => {
            const livePolicy = findPolicy(config.key);
            const title = livePolicy?.title || config.key;
            const content = livePolicy?.content || config.fallback;
            
            return (
              <PolicyAccordionItem 
                key={config.key} 
                title={title} 
                content={content} 
              />
            );
          })}
        </div>

        {onDownloadPdf && (
          <div className="pt-4 mt-4 border-t" style={{ borderColor: brand.colors.warning.border }}>
            <button
              onClick={onDownloadPdf}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
              style={{ 
                backgroundColor: brand.colors.warning.text,
                color: brand.colors.warning.bg,
              }}
            >
              <FilePdf size={16} weight="bold" />
              Download Full Contract & All Terms (PDF)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Micro-Component: Single Accordion Row
// ============================================================================
function PolicyAccordionItem({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="rounded-xl border overflow-hidden transition-all duration-200"
      style={{ 
        backgroundColor: brand.colors.light.surface,
        borderColor: isOpen ? brand.colors.warning.border : 'transparent',
        boxShadow: isOpen ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none'
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--color-surface-hover)]/50 transition-colors"
      >
        <span className="text-sm font-bold" style={{ color: brand.colors.ink.primary }}>
          {title}
        </span>
        <CaretDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: brand.colors.ink.muted }}
        />
      </button>

      {isOpen && (
        <div 
          className="px-4 pb-4 pt-0 border-t"
          style={{ borderColor: brand.colors.light.surfaceBorder }}
        >
          <div className="pt-3">
            <MarkdownLitePreview raw={content} variant="contract" />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Reusable Components (Used by TermsTab)
// ============================================================================
function ArticleItem({ number, title, content }: { number: number; title: string; content: string }) {
  return (
    <div className="flex gap-3">
      <div 
        className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
        style={{ backgroundColor: brand.colors.light.surfaceWarm, color: brand.colors.ink.secondary }}
      >
        {number}
      </div>
      <div>
        <h5 className="text-xs font-bold mb-1" style={{ color: brand.colors.ink.primary }}>{title}</h5>
        <p className="text-xs leading-relaxed" style={{ color: brand.colors.ink.muted }}>{content}</p>
      </div>
    </div>
  );
}
