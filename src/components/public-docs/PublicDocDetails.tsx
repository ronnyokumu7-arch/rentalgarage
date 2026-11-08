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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-100 pb-3">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
              <item.icon className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
              <p className="text-sm font-semibold text-slate-900 leading-snug">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
