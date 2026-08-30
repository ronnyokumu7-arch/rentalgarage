// src/components/public-docs/PublicDocDetails.tsx
import React from "react";
import { LucideIcon } from "lucide-react";

interface DetailItem {
  label: string;
  value: string | React.ReactNode;
  icon: LucideIcon;
}

interface PublicDocDetailsProps {
  title: string;
  items: DetailItem[];
}

export default function PublicDocDetails({ title, items }: PublicDocDetailsProps) {
  return (
    <div 
      className="rounded-2xl p-6 sm:p-8"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(28, 25, 23, 0.08)',
        border: '1px solid rgba(28, 25, 23, 0.10)',
      }}
    >
      <h3 
        className="text-sm font-bold uppercase tracking-wider mb-6 pb-3"
        style={{
          color: '#1C1917',
          borderBottom: '1px solid rgba(28, 25, 23, 0.06)',
        }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: '#FAF9F7',
                border: '1px solid rgba(28, 25, 23, 0.06)',
              }}
            >
              <item.icon 
                className="w-4 h-4"
                style={{ color: '#57534E' }}
              />
            </div>
            <div>
              <p 
                className="text-xs mb-0.5"
                style={{ color: '#57534E' }}
              >
                {item.label}
              </p>
              <p 
                className="text-sm font-semibold leading-snug"
                style={{ color: '#1C1917' }}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
