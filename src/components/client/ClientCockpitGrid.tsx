"use client";

import { User, CreditCard, Shield, FileText, WarningCircle as AlertCircle } from "@phosphor-icons/react/ssr";
import type { Client } from "@/lib/types";
import SectionCard from "@/components/ui/SectionCard";
import Badge from "@/components/ui/Badge";

export default function ClientCockpitGrid({ client }: { client: Client }) {
  const isDlExpired = client.dl_expiry ? new Date(client.dl_expiry) < new Date() : false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* Identity & Contact */}
      <SectionCard className="!p-3 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center"><User size={12} className="text-blue-600" aria-hidden="true" /></div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Identity & Contact</h3>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[9px] uppercase text-gray-500 font-bold mb-0.5">ID Number</p>
              <p className="text-xs font-bold text-gray-900">{client.id_number || "N/A"}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[9px] uppercase text-gray-500 font-bold mb-0.5">Phone</p>
              <p className="text-xs font-bold text-gray-900">{client.phone}</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <p className="text-[9px] uppercase text-blue-600 font-bold mb-0.5">Residential Address</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{client.residential_address || "Not provided"}</p>
          </div>
        </div>
      </SectionCard>

      {/* Driver's License & KYC */}
      <SectionCard className="!p-3 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center"><CreditCard size={12} className="text-amber-600" aria-hidden="true" /></div>
          {/* FIX: Escaped the apostrophe to prevent build errors */}
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Driver's License</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[9px] uppercase text-gray-500 font-bold mb-1">DL Number</p>
            <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
              {client.dl_number || "Not set"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase text-gray-500 font-bold mb-1">Expiry Date</p>
              <p className="text-sm font-bold text-gray-900">{client.dl_expiry ? new Date(client.dl_expiry).toLocaleDateString() : "N/A"}</p>
            </div>
            {client.dl_expiry && (
              <Badge variant={isDlExpired ? "danger" : "success"} dot>
                {isDlExpired ? "Expired" : "Valid"}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
              <FileText size={14} className="mx-auto text-gray-400 mb-1" aria-hidden="true" />
              <p className="text-[9px] text-gray-500 font-medium">ID Front</p>
            </div>
            <div className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
              <FileText size={14} className="mx-auto text-gray-400 mb-1" aria-hidden="true" />
              <p className="text-[9px] text-gray-500 font-medium">DL Front</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Next of Kin & Notes */}
      <SectionCard className="!p-3 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center"><Shield size={12} className="text-emerald-600" aria-hidden="true" /></div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Next of Kin & Notes</h3>
        </div>
        <div className="space-y-2">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[9px] uppercase text-gray-500 font-bold mb-0.5">Name</p>
            <p className="text-xs font-bold text-gray-900">{client.next_of_kin_name || "Not provided"}</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[9px] uppercase text-gray-500 font-bold mb-0.5">Emergency Phone</p>
            <p className="text-xs font-bold text-gray-900">{client.next_of_kin_phone || "Not provided"}</p>
          </div>
          {/* Placeholder for future notes feature */}
          <div className="mt-2 p-2 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-2 text-gray-400">
            <AlertCircle size={12} aria-hidden="true" />
            <p className="text-[10px]">Notes feature coming in v1.1</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
