// src/components/contracts/public/PublicContractTermsSection.tsx
"use client";

import { useState } from "react";
import { Shield, Scale, AlertCircle, FileText, CheckCircle2, Fuel, MapPin, Clock } from "lucide-react";

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
          style={{ color: '#1C1917' }}
        >
          <FileText size={18} style={{ color: '#6D28D9' }} />
          Terms & Conditions
        </h3>
        <p 
          className="text-xs mt-1"
          style={{ color: '#57534E' }}
        >
          Review the contract terms before signing.
        </p>
      </div>

      {/* Clean Tab Navigation */}
      <div 
        className="mb-6"
        style={{ borderBottom: '1px solid rgba(28, 25, 23, 0.10)' }}
      >
        <nav className="flex gap-1 -mb-px overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors focus:outline-none"
                style={{
                  borderBottom: isActive ? '2px solid #6D28D9' : '2px solid transparent',
                  color: isActive ? '#6D28D9' : '#57534E',
                  background: isActive ? 'rgba(109, 40, 217, 0.05)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#1C1917';
                    e.currentTarget.style.background = '#F5F3F0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#57534E';
                    e.currentTarget.style.background = 'transparent';
                  }
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
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(109, 40, 217, 0.05)',
          border: '1px solid rgba(109, 40, 217, 0.15)',
        }}
      >
        <h4 
          className="text-sm font-bold mb-3"
          style={{ color: '#6D28D9' }}
        >
          Your Declaration
        </h4>
        <p 
          className="text-xs mb-3"
          style={{ color: '#6D28D9' }}
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
              <CheckCircle2 
                size={14} 
                className="flex-shrink-0 mt-0.5"
                style={{ color: '#6D28D9' }}
              />
              <span 
                className="text-xs"
                style={{ color: '#6D28D9' }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div 
        className="p-4 rounded-xl"
        style={{
          background: '#FAF9F7',
          border: '1px solid rgba(28, 25, 23, 0.10)',
        }}
      >
        <p 
          className="text-xs leading-relaxed"
          style={{ color: '#57534E' }}
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
        content="Report any accident, theft, or damage to us within 24 hours AND to police if there&apos;s injury or theft. Get a police report. Do not admit fault or settle with others without us."
      />
    </div>
  );
}

// Tab 3: Agency Policies
function PoliciesTab({ tenantName }: { tenantName: string }) {
  return (
    <div 
      className="p-4 rounded-xl space-y-4"
      style={{
        background: 'rgba(180, 83, 9, 0.05)',
        border: '1px solid rgba(180, 83, 9, 0.20)',
      }}
    >
      <PolicyItem 
        icon={<Fuel size={14} style={{ color: '#B45309' }} />}
        title="Fuel Policy"
        content="Return the car with the same fuel level as pickup. If below, a refueling fee applies."
      />
      <PolicyItem 
        icon={<MapPin size={14} style={{ color: '#B45309' }} />}
        title="Mileage Limit"
        content="Daily limit: 550 KM. Excess mileage: KES 50 per KM."
      />
      <PolicyItem 
        icon={<Clock size={14} style={{ color: '#B45309' }} />}
        title="Late Returns"
        content="Returns over 2 hours late are charged as a new rental day."
      />
      
      <div 
        className="pt-3"
        style={{ borderTop: '1px solid rgba(180, 83, 9, 0.20)' }}
      >
        <p 
          className="text-xs font-semibold mb-2"
          style={{ color: '#B45309' }}
        >
          {tenantName} Specific Policies
        </p>
        <p 
          className="text-xs"
          style={{ color: '#B45309' }}
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
          background: '#FAF9F7',
          color: '#44403C',
          border: '1px solid rgba(28, 25, 23, 0.10)',
        }}
      >
        {number}
      </div>
      <div>
        <h5 
          className="text-xs font-bold mb-1"
          style={{ color: '#1C1917' }}
        >
          {title}
        </h5>
        <p 
          className="text-xs leading-relaxed"
          style={{ color: '#57534E' }}
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
        style={{
          background: 'rgba(180, 83, 9, 0.10)',
        }}
      >
        {icon}
      </div>
      <div>
        <h5 
          className="text-xs font-bold mb-1"
          style={{ color: '#B45309' }}
        >
          {title}
        </h5>
        <p 
          className="text-xs leading-relaxed"
          style={{ color: '#B45309' }}
        >
          {content}
        </p>
      </div>
    </div>
  );
}
