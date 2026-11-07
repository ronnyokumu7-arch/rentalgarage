"use client";

import { Money as Banknote, CalendarDots as CalendarDays, Car } from "@phosphor-icons/react/ssr";
import type { Client } from "@/lib/types";
import Badge from "@/components/ui/Badge";

const statusColors: Record<string, "success" | "accent" | "warning" | "danger"> = {
  active: "success", pending: "warning", inactive: "warning", suspended: "danger"
};

interface ClientHeroProps {
  client: Client;
  stats: { totalSpent: number; totalBookings: number; activeRentals: number };
}

export default function ClientHeroSection({ client, stats }: ClientHeroProps) {
  const formatKES = (amount: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Client Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-200">
            {client.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {client.full_name}
              <Badge variant={statusColors[client.status]} className="text-xs">{client.status.charAt(0).toUpperCase() + client.status.slice(1)}</Badge>
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <span className="font-medium text-gray-700">{client.email || "No email"}</span>
              <span>•</span>
              <span>{client.phone}</span>
            </p>
          </div>
        </div>

        {/* Premium Stats Cards */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[110px]">
            <Banknote size={18} className="text-emerald-600 mb-1" aria-hidden="true" />
            <p className="text-[10px] uppercase text-emerald-700 font-semibold tracking-wide">Total Spent</p>
            <p className="text-lg font-bold text-gray-900">{formatKES(stats.totalSpent)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[110px]">
            <CalendarDays size={18} className="text-blue-600 mb-1" aria-hidden="true" />
            <p className="text-[10px] uppercase text-blue-700 font-semibold tracking-wide">Total Bookings</p>
            <p className="text-lg font-bold text-gray-900">{stats.totalBookings}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[110px]">
            <Car size={18} className="text-amber-600 mb-1" aria-hidden="true" />
            <p className="text-[10px] uppercase text-amber-700 font-semibold tracking-wide">Active Rentals</p>
            <p className="text-lg font-bold text-gray-900">{stats.activeRentals}</p>
          </div>
        </div>
      </div>
    </div>
  );
}