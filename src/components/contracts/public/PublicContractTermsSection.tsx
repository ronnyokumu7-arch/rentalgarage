// src/components/contracts/public/PublicContractTermsSection.tsx
"use client";

import { useState } from "react";
import { Shield, Scale, AlertCircle, FileText, CheckCircle2, Fuel, MapPin, Clock } from "lucide-react";
import { brand } from "@/lib/brand";

interface Props {
  tenantName: string;
}

const TABS = [
  { id: "summary", label: "Summary", icon: Shield },
  { id: "terms", label: "Terms & Rules", icon: Scale },
  { id: "policies", label: "Agency Policies", icon: AlertCircle },
];

export default function PublicContractTermsSection({ tenantName }: Props) {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="p-4 sm:p-8">
      
      {/* Section Header */}
      <div className="mb-6">
        <h3 
          className="text-sm font-bold flex items-center gap-2"
          style={{ color: brand.colors.ink.primary }}
        >
          <FileText size={18} style={{ color: brand.colors.info.light }} />
          Terms & Conditions
        </h3>
        <p 
          className="text-xs mt-1"
          style={{ color: brand.colors.ink.muted }}
        >
          Review the contract terms before signing.
        </p>
      </div>

      {/* Clean Tab Navigation */}
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
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === "summary" && <SummaryTab tenantName={tenantName} />}
        {activeTab === "terms" && <TermsTab />}
        {activeTab === "policies" && <PoliciesTab tenantName={tenantName} />}
      </div>
    </div>
  );
}

// Tab 1: Summary (Simple English declaration)
function SummaryTab({ tenantName }: { tenantName: string }) {
  return (
    <div className="space-y-4">
      <div 
        className="p-4 rounded-xl border"
        style={{ 
          backgroundColor: brand.colors.info.bg,
          borderColor: brand.colors.info.border
        }}
      >
        <h4 
          className="text-sm font-bold mb-3"
          style={{ color: brand.colors.info.text }}
        >
          Your Declaration
        </h4>
        <p 
          className="text-xs mb-3"
          style={{ color: brand.colors.info.text }}
        >
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
              <CheckCircle2 size={14} style={{ color: brand.colors.info.light }} className="flex-shrink-0 mt-0.5" />
              <span 
                className="text-xs"
                style={{ color: brand.colors.info.text }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div 
        className="p-4 rounded-xl border"
        style={{ 
          backgroundColor: brand.colors.light.surfaceWarm,
          borderColor: brand.colors.light.surfaceBorder
        }}
      >
        <p 
          className="text-xs leading-relaxed"
          style={{ color: brand.colors.ink.muted }}
        >
          By signing this document, you agree to all rental terms and conditions provided by {tenantName}. 
          The full legal agreement is available in the PDF download.
        </p>
      </div>
    </div>
  );
}

// Tab 2: General Terms (12 Articles simplified)
function TermsTab() {
  return (
    <div className="space-y-4">
      <ArticleItem 
        number={1}
        title="Who Can Drive"
        content="Only you or drivers we approve can drive this car. You cannot: use it for paid passenger transport, tow other vehicles, drive under the influence, carry illegal goods, or overload the car."
      />
      <ArticleItem 
        number={2}
        title="Car Condition"
        content="You received the car in good condition. If tires are damaged (not normal wear), you replace them. Do not tamper with the trip recorder. If it fails, you pay for 500 KM per day."
      />
      <ArticleItem 
        number={3}
        title="Extending Your Rental"
        content="Want to keep the car longer? Ask us first and pay the extra cost before the original return time. Late returns without approval may be treated as unauthorized use."
      />
      <ArticleItem 
        number={4}
        title="Payments & Fines"
        content="Pay on time. Late payments get 2% monthly interest. You're responsible for traffic fines, parking tickets, and tolls during your rental."
      />
      <ArticleItem 
        number={5}
        title="Insurance & Accidents"
        content="Report any accident, theft, or damage to us within 24 hours AND to police if there's injury or theft. Get a police report. Do not admit fault or settle with others without us."
      />
    </div>
  );
}

// Tab 3: Agency Policies
function PoliciesTab({ tenantName }: { tenantName: string }) {
  return (
    <div 
      className="p-4 rounded-xl border space-y-4"
      style={{ 
        backgroundColor: brand.colors.warning.bg,
        borderColor: brand.colors.warning.border
      }}
    >
      <PolicyItem 
        icon={<Fuel size={14} style={{ color: brand.colors.secondary }} />}
        title="Fuel Policy"
        content="Return the car with the same fuel level as pickup. If below, a refueling fee applies."
      />
      <PolicyItem 
        icon={<MapPin size={14} style={{ color: brand.colors.secondary }} />}
        title="Mileage Limit"
        content="Daily limit: 550 KM. Excess mileage: KES 50 per KM."
      />
      <PolicyItem 
        icon={<Clock size={14} style={{ color: brand.colors.secondary }} />}
        title="Late Returns"
        content="Returns over 2 hours late are charged as a new rental day."
      />
      
      <div className="pt-3 border-t" style={{ borderColor: brand.colors.warning.border }}>
        <p 
          className="text-xs font-semibold mb-2"
          style={{ color: brand.colors.warning.text }}
        >
          {tenantName} Specific Policies
        </p>
        <p 
          className="text-xs"
          style={{ color: brand.colors.warning.text }}
        >
          Additional agency-specific policies are detailed in the full PDF contract document.
        </p>
      </div>
    </div>
  );
}

// Reusable components
function ArticleItem({ number, title, content }: { number: number; title: string; content: string }) {
  return (
    <div className="flex gap-3">
      <div 
        className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
        style={{ 
          backgroundColor: brand.colors.light.surfaceWarm,
          color: brand.colors.ink.secondary
        }}
      >
        {number}
      </div>
      <div>
        <h5 
          className="text-xs font-bold mb-1"
          style={{ color: brand.colors.ink.primary }}
        >
          {title}
        </h5>
        <p 
          className="text-xs leading-relaxed"
          style={{ color: brand.colors.ink.muted }}
        >
          {content}
        </p>
      </div>
    </div>
  );
}

function PolicyItem({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  return (
    <div className="flex items-start gap-3">
      <div 
        className="p-1.5 rounded-lg shrink-0"
        style={{ backgroundColor: brand.colors.secondaryMuted }}
      >
        {icon}
      </div>
      <div>
        <h5 
          className="text-xs font-bold mb-1"
          style={{ color: brand.colors.warning.text }}
        >
          {title}
        </h5>
        <p 
          className="text-xs leading-relaxed"
          style={{ color: brand.colors.warning.text }}
        >
          {content}
        </p>
      </div>
    </div>
  );
}
