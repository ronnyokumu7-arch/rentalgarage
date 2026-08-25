"use client";

import { User, Car, Calendar, Banknote, UserCircle } from "lucide-react";
import type { PublicInvoiceView } from "@/lib/types";

interface PublicInvoiceDetailsProps {
  invoice: PublicInvoiceView;
}

export default function PublicInvoiceDetails({ invoice }: PublicInvoiceDetailsProps) {
  const hasDriver = !!(invoice?.driver_name);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
      <div className="space-y-2 sm:space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Details</h3>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg shrink-0"><User size={18} className="text-slate-600" /></div>
          <div>
            <p className="text-sm font-bold text-slate-900">{invoice.client_name}</p>
            <p className="text-xs text-slate-500">{invoice.client_phone || "Renter"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Details</h3>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg shrink-0"><Car size={18} className="text-slate-600" /></div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {invoice.vehicle_name || invoice.vehicle_description || "N/A"}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              {invoice.vehicle_plate || "Rental Vehicle"}
            </p>
          </div>
        </div>
      </div>

      {hasDriver && (
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Driver</h3>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 rounded-lg shrink-0"><UserCircle size={18} className="text-slate-600" /></div>
            <div>
              <p className="text-sm font-bold text-slate-900">{invoice.driver_name}</p>
              <p className="text-xs text-slate-500">{invoice.driver_phone || "—"}</p>
              {invoice.driver_dl_number && (
                <p className="text-xs text-slate-500 font-mono">DL {invoice.driver_dl_number}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 sm:space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice Dates</h3>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg shrink-0"><Calendar size={18} className="text-slate-600" /></div>
          <div>
            <p className="text-sm font-bold text-slate-900">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
            <p className="text-xs text-slate-500">Payment deadline</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</h3>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg shrink-0"><Banknote size={18} className="text-slate-600" /></div>
          <div>
            <p className="text-sm font-bold text-slate-900">{invoice.currency_code} {Number(invoice.amount_due).toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total invoice value</p>
          </div>
        </div>
      </div>
    </div>
  );
}
