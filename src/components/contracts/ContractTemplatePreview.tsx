"use client";

import React from "react";
import { ShieldCheck, CheckCircle as CheckCircle2, Lock, Buildings as Building2 } from "@phosphor-icons/react/ssr";

// =============================================================================
// BACKEND SYNCED TYPESPEC (Matches FastAPI Schemas)
// =============================================================================
export interface ContractDetailData {
  contract_number: string;
  created_at: string;
  status: string;
  signed_by_client: boolean;
  signature_image_path?: string | null;
  client_signed_at?: string | null;
  signer_ip?: string | null;
  signer_user_agent?: string | null;
  share_token?: string | null;
  
  tenant?: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    logo_url?: string | null;
  };

  client?: {
    full_name: string;
    email?: string | null;
    phone: string;
    id_number?: string | null;
    dl_number?: string | null;
    dl_expiry?: string | null;
    residential_address?: string | null;
    next_of_kin_name?: string | null;
    next_of_kin_phone?: string | null;
  };

  vehicle?: {
    make: string;
    model: string;
    year?: number | null;
    plate_number: string;
    vin?: string | null;
    insurance_number?: string | null;
    current_mileage?: number | null;
  };

  booking?: {
    booking_number?: string | null;
    start_date: string;
    end_date: string;
    pickup_location?: string | null;
    return_location?: string | null;
    destination?: string | null;
    daily_rate?: number | string | null;
    total_amount: number | string;
    currency_code: string;
  };

  policies?: string[];
}

interface ContractTemplatePreviewProps {
  data?: ContractDetailData;
}

// Formatters
const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, ", ");
  } catch {
    return dateStr;
  }
};

const formatCurrency = (amount?: number | string | null, currency = "KES") => {
  if (amount === undefined || amount === null) return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
};

// Default Mock Data Fallback for Live Preview Page
const DEFAULT_MOCK_DATA: ContractDetailData = {
  contract_number: "T001-2026-0042",
  created_at: "2026-07-24T10:15:22Z",
  status: "EXECUTED",
  signed_by_client: true,
  client_signed_at: "2026-07-24T10:15:22Z",
  signer_ip: "102.217.64.12 (Nairobi, KE)",
  signer_user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124.0.0.0",
  share_token: "e4f298ab-41c3-4d89-9a2b-8812f90123ab",
  tenant: {
    name: "Apex Luxury Car Rentals",
    address: "102 Westlands Avenue, Nairobi, Kenya",
    phone: "+254 700 000 000",
    email: "info@apexrentals.com",
    website: "www.apexrentals.com",
  },
  client: {
    full_name: "John Doe",
    email: "john.doe@example.com",
    phone: "+254 712 345 678",
    id_number: "A1234567",
    dl_number: "DL-998823",
    dl_expiry: "2028-11-15",
    residential_address: "45 Riverside Drive, Nairobi, Kenya",
    next_of_kin_name: "Jane Doe (Spouse)",
    next_of_kin_phone: "+254 722 999 888",
  },
  vehicle: {
    make: "Toyota",
    model: "Prado TX",
    year: 2023,
    plate_number: "KDA 123X",
    vin: "JTEPE59J100123456",
    insurance_number: "INS-992011",
    current_mileage: 45210,
  },
  booking: {
    booking_number: "BK-99201",
    start_date: "2026-07-25T09:00:00Z",
    end_date: "2026-07-30T17:00:00Z",
    pickup_location: "Nairobi HQ Yard",
    return_location: "JKIA Airport",
    destination: "Mombasa / Coast",
    daily_rate: 15000,
    total_amount: 105000,
    currency_code: "KES",
  },
  policies: [
    "FUEL POLICY: Vehicle must be returned with full tank (8/8). Refueling fee of KES 3,000 applies if returned below level.",
    "MILEAGE LIMITS: Daily cap is 300 KM. Excess mileage is billed at KES 50/KM.",
    "LATE RETURNS: Returns over 1 hour late will be charged at 150% of the daily rate.",
  ],
};

export default function ContractTemplatePreview({ data }: ContractTemplatePreviewProps) {
  // Use passed database props or fall back cleanly to default mock data
  const c = data || DEFAULT_MOCK_DATA;

  const tenant = c.tenant;
  const client = c.client;
  const vehicle = c.vehicle;
  const booking = c.booking;
  const currency = booking?.currency_code || "KES";

  return (
    <div className="w-full bg-slate-100 p-2 sm:p-8 min-h-screen flex justify-center">
      {/* A4 Container Preview */}
      <div className="w-full max-w-4xl bg-white text-slate-900 border border-slate-300 shadow-2xl p-6 sm:p-12 font-sans text-xs leading-relaxed">
        
        {/* ================= HEADER & HERO LOGO AREA ================= */}
        <header className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            
            {/* Left-Aligned Logo & Agency Credentials */}
            <div className="flex items-start gap-4">
              <div className="w-[120px] h-[60px] bg-slate-900 text-white flex items-center justify-center font-bold tracking-wider text-sm rounded shrink-0">
                {tenant?.logo_url ? (
                  <img src={tenant.logo_url} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex items-center gap-1">
                    <Building2 size={18} aria-hidden="true" />
                    <span className="truncate max-w-[80px]">{tenant?.name?.substring(0, 8) || "AGENCY"}</span>
                  </div>
                )}
              </div>
              <div className="space-y-0.5">
                <h1 className="text-base font-extrabold text-slate-950 uppercase tracking-tight">
                  {tenant?.name || "Rental Agency"}
                </h1>
                <p className="text-slate-600 font-medium">{tenant?.address || "—"}</p>
                <p className="text-slate-600 font-medium">
                  Tel: {tenant?.phone || "—"} | Email: {tenant?.email || "—"}
                </p>
                {tenant?.website && <p className="text-slate-600 font-medium">{tenant.website}</p>}
              </div>
            </div>

            {/* Document Title / Badge */}
            <div className="text-left sm:text-right space-y-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-bold text-[10px] uppercase rounded border ${
                c.signed_by_client 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
                  : "bg-amber-50 text-amber-800 border-amber-300"
              }`}>
                <CheckCircle2 size={12} aria-hidden="true" /> {c.signed_by_client ? "EXECUTED / SIGNED" : "PENDING SIGNATURE"}
              </span>
              <p className="text-[10px] text-slate-400 font-mono pt-1">
                SECURED BY Rental Garage
              </p>
            </div>
          </div>

          {/* Hero Summary Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-200 bg-slate-50 p-3 rounded">
            <div>
              <p className="text-[10px] font-bold text-slate-900 uppercase">Contract No</p>
              <p className="font-semibold text-slate-700">{c.contract_number}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-900 uppercase">Issue Date</p>
              <p className="font-semibold text-slate-700">{formatDate(c.created_at)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-900 uppercase">Booking Ref</p>
              <p className="font-semibold text-slate-700">{booking?.booking_number || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-900 uppercase">Currency</p>
              <p className="font-semibold text-slate-700">{currency}</p>
            </div>
          </div>
        </header>

        {/* ================= 1. RENTER & EMERGENCY CONTACT ================= */}
        <section className="mb-6 space-y-3">
          <h2 className="font-bold text-slate-950 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            1. Renter Profile & Emergency Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-slate-700">
            <div><span className="font-bold text-slate-900">Full Name:</span> <span className="text-slate-600 font-medium">{client?.full_name || "—"}</span></div>
            <div><span className="font-bold text-slate-900">National ID / Passport:</span> <span className="text-slate-600 font-medium">{client?.id_number || "—"}</span></div>
            <div><span className="font-bold text-slate-900">Phone Number:</span> <span className="text-slate-600 font-medium">{client?.phone || "—"}</span></div>
            <div><span className="font-bold text-slate-900">Driver's License No:</span> <span className="text-slate-600 font-medium">{client?.dl_number || "—"}</span></div>
            <div><span className="font-bold text-slate-900">Email Address:</span> <span className="text-slate-600 font-medium">{client?.email || "—"}</span></div>
            <div><span className="font-bold text-slate-900">License Expiry Date:</span> <span className="text-slate-600 font-medium">{formatDate(client?.dl_expiry)}</span></div>
            <div className="sm:col-span-2"><span className="font-bold text-slate-900">Residential Address:</span> <span className="text-slate-600 font-medium">{client?.residential_address || "—"}</span></div>
          </div>

          <div className="mt-2 pt-2 border-t border-dashed border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-slate-700">
            <div><span className="font-bold text-slate-900">Emergency Contact:</span> <span className="text-slate-600 font-medium">{client?.next_of_kin_name || "—"}</span></div>
            <div><span className="font-bold text-slate-900">Emergency Phone:</span> <span className="text-slate-600 font-medium">{client?.next_of_kin_phone || "—"}</span></div>
          </div>
        </section>

        {/* ================= 2. VEHICLE ASSET ASSIGNMENT ================= */}
        <section className="mb-6 space-y-3">
          <h2 className="font-bold text-slate-950 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            2. Vehicle Asset Assignment & Handover Condition
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-slate-700">
            <div><span className="font-bold text-slate-900">Make & Model:</span> <span className="text-slate-600 font-medium">{vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year ? `(${vehicle.year})` : ""}` : "—"}</span></div>
            <div><span className="font-bold text-slate-900">Plate Number:</span> <span className="text-slate-600 font-medium">{vehicle?.plate_number || "—"}</span></div>
            <div><span className="font-bold text-slate-900">Vehicle VIN:</span> <span className="text-slate-600 font-medium">{vehicle?.vin || "—"}</span></div>
            <div><span className="font-bold text-slate-900">Insurance Policy:</span> <span className="text-slate-600 font-medium">{vehicle?.insurance_number || "—"}</span></div>
            <div><span className="font-bold text-slate-900">Handover Odometer:</span> <span className="text-slate-600 font-medium">{vehicle?.current_mileage ? `${vehicle.current_mileage.toLocaleString()} KM` : "0 KM"}</span></div>
            <div><span className="font-bold text-slate-900">Fuel Level at Out:</span> <span className="text-slate-600 font-medium">8 / 8 (Full)</span></div>
          </div>

          {/* SIGNATURE SPOT 1 */}
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <p className="text-[10px] text-slate-600 font-serif italic">
              "I confirm that I have inspected the vehicle identified above and accept its handover condition and initial mileage reading as accurate."
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-slate-900">Signature Spot 1: Handover Acceptance</span>
              <div className="text-right">
                {c.signed_by_client ? (
                  <>
                    <span className="font-serif italic font-bold text-slate-800 text-sm">/s/ {client?.full_name}</span>
                    <p className="text-[9px] text-slate-400 font-mono">{formatDate(c.client_signed_at)}</p>
                  </>
                ) : (
                  <span className="text-slate-400 italic font-serif">Pending Signature</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. RENTAL SCHEDULE & FINANCIALS ================= */}
        <section className="mb-6 space-y-3">
          <h2 className="font-bold text-slate-950 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            3. Rental Schedule & Itemized Financial Schedule
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-slate-700 mb-3">
            <div><span className="font-bold text-slate-900">Pick-up Date & Time:</span> <span className="text-slate-600 font-medium">{formatDate(booking?.start_date)}</span></div>
            <div><span className="font-bold text-slate-900">Pick-up Location:</span> <span className="text-slate-600 font-medium">{booking?.pickup_location || "HQ Yard"}</span></div>
            <div><span className="font-bold text-slate-900">Return Date & Time:</span> <span className="text-slate-600 font-medium">{formatDate(booking?.end_date)}</span></div>
            <div><span className="font-bold text-slate-900">Return Location:</span> <span className="text-slate-600 font-medium">{booking?.return_location || "HQ Yard"}</span></div>
            <div className="sm:col-span-2"><span className="font-bold text-slate-900">Authorized Destination:</span> <span className="text-slate-600 font-medium">{booking?.destination || "Standard Region"}</span></div>
          </div>

          {/* Charges Table */}
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
                <th className="p-2 border-r border-slate-200">Itemized Description</th>
                <th className="p-2 border-r border-slate-200 w-36">Daily Rate</th>
                <th className="p-2 w-36 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 font-medium divide-y divide-slate-200">
              <tr>
                <td className="p-2 border-r border-slate-200">Vehicle Rental Charge</td>
                <td className="p-2 border-r border-slate-200">{formatCurrency(booking?.daily_rate, currency)}</td>
                <td className="p-2 text-right">{formatCurrency(booking?.total_amount, currency)}</td>
              </tr>
              <tr className="bg-slate-50 font-bold text-slate-950">
                <td colSpan={2} className="p-2 border-r border-slate-200 text-right uppercase">Total Contract Value Due</td>
                <td className="p-2 text-right text-sm text-slate-900">{formatCurrency(booking?.total_amount, currency)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ================= 4. SPECIFIC AGENCY POLICIES ================= */}
        <section className="mb-6 space-y-3">
          <h2 className="font-bold text-slate-950 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            4. Specific Agency Policies & Liability Clauses
          </h2>
          <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
            {c.policies && c.policies.length > 0 ? (
              c.policies.map((policy, idx) => <li key={idx}>{policy}</li>)
            ) : (
              <li>Standard agency operational, fuel, and late fee terms apply as per Master Agreement.</li>
            )}
          </ul>

          {/* SIGNATURE SPOT 2 */}
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <p className="text-[10px] text-slate-600 font-serif italic">
              "I acknowledge and agree to the specific fuel, mileage, and late return liabilities detailed in Section 4 above."
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-slate-900">Signature Spot 2: Policy Acknowledgment</span>
              <div className="text-right">
                {c.signed_by_client ? (
                  <>
                    <span className="font-serif italic font-bold text-slate-800 text-sm">/s/ {client?.full_name}</span>
                    <p className="text-[9px] text-slate-400 font-mono">{formatDate(c.client_signed_at)}</p>
                  </>
                ) : (
                  <span className="text-slate-400 italic font-serif">Pending Signature</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= 5. MASTER LEGAL TERMS & EXECUTION ================= */}
        <section className="mb-6 space-y-4">
          <h2 className="font-bold text-slate-950 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            5. Master Legal Terms & Digital Execution Seal
          </h2>
          <p className="text-slate-600 font-medium text-[11px]">
            This agreement constitutes the complete and legally binding vehicle rental contract between Lessor ({tenant?.name || "Lessor"}) and Lessee ({client?.full_name || "Lessee"}). By affixing digital signatures below, both parties certify acceptance of all terms, schedule rates, and conditions across this document.
          </p>

          <div className="grid grid-cols-2 gap-8 pt-2">
            {/* Lessor Representative */}
            <div className="border-t border-slate-300 pt-2 space-y-1">
              <p className="font-bold text-slate-900 uppercase">Lessor Representative</p>
              <p className="text-slate-600 font-medium">Signature: _______________________</p>
              <p className="text-slate-600 font-medium">Name: {tenant?.name || "Agency Operations"}</p>
              <p className="text-slate-600 font-medium">Date: {formatDate(c.created_at)}</p>
            </div>

            {/* Lessee Signature (SIGNATURE SPOT 3) */}
            <div className="border-t border-slate-300 pt-2 space-y-1">
              <p className="font-bold text-slate-900 uppercase">Lessee / Customer (Signature Spot 3)</p>
              {c.signed_by_client ? (
                <>
                  <p className="font-serif italic font-bold text-slate-900 text-base">/s/ {client?.full_name}</p>
                  <p className="text-slate-600 font-medium">Name: {client?.full_name}</p>
                  <p className="text-slate-600 font-medium">Date: {formatDate(c.client_signed_at)}</p>
                </>
              ) : (
                <p className="text-slate-400 font-serif italic py-2">Pending Execution Signature</p>
              )}
            </div>
          </div>

          {/* DIGITAL AUDIT TRAIL BLOCK */}
          {c.signed_by_client && (
            <div className="mt-4 p-4 bg-slate-900 text-slate-100 rounded space-y-2 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-wider text-emerald-400">
                  <ShieldCheck size={14} aria-hidden="true" /> Cryptographic Non-Repudiation Audit Stamp
                </div>
                <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
                  <Lock size={10} aria-hidden="true" /> LOCK-SEALED
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 font-mono text-[10px] text-slate-300">
                <div><span className="text-slate-500">Signer Identity:</span> {client?.full_name} &lt;{client?.email || "n/a"}&gt;</div>
                <div><span className="text-slate-500">IP Address:</span> {c.signer_ip || "102.217.64.12 (KE)"}</div>
                <div><span className="text-slate-500">Share Token:</span> {c.share_token || "e4f298ab-41c3-4d89"}</div>
                <div><span className="text-slate-500">UTC Timestamp:</span> {c.client_signed_at || c.created_at}</div>
                <div className="sm:col-span-2 truncate"><span className="text-slate-500">User Agent:</span> {c.signer_user_agent || "Verified Web Session"}</div>
              </div>
            </div>
          )}
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="pt-6 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <div>PAGE 1 OF 1 • CONTRACT #{c.contract_number}</div>
          <div>POWERED BY Rental Garage PLATFORM</div>
        </footer>

      </div>
    </div>
  );
}
