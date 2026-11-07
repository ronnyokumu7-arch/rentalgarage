"use client";

import React from "react";
import Link from "next/link";
import { Phone, Envelope as Mail, ChatCircle as MessageCircle, Car, MapPin, CurrencyDollar as DollarSign, ArrowSquareOut as ExternalLink } from "@phosphor-icons/react/ssr";
import type { Client, Vehicle } from "@/lib/types";
import Badge from "@/components/ui/Badge";

// ─── Contact Action Icons ────────────────────────────────────────────────────
interface ContactActionsProps {
  phone?: string | null;
  email?: string | null;
  className?: string;
}

export function ContactActions({ phone, email, className = "" }: ContactActionsProps) {
  const waNumber = phone ? phone.replace(/[^0-9]/g, "") : null;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {phone && (
        <a
          href={`tel:${phone}`}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-hover text-ink-muted hover:bg-accent-bg hover:text-accent-dark transition-colors"
          title={`Call ${phone}`}
        >
          <Phone size={14} aria-hidden="true" />
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-hover text-ink-muted hover:bg-accent-bg hover:text-accent-dark transition-colors"
          title={`Email ${email}`}
        >
          <Mail size={14} aria-hidden="true" />
        </a>
      )}
      {waNumber && (
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-hover text-ink-muted hover:bg-green-50 hover:text-green-600 transition-colors"
          title="WhatsApp"
        >
          <MessageCircle size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

// ── Client Hover Link ───────────────────────────────────────────────────────
interface ClientHoverLinkProps {
  client: Client;
  children: React.ReactNode;
  className?: string;
}

export function ClientHoverLink({ client, children, className = "" }: ClientHoverLinkProps) {
  return (
    <div className={`group relative inline-block ${className}`}>
      <Link 
        href={`/dashboard/clients/${client.id}`} 
        className="text-accent-dark hover:text-accent-dark/80 hover:underline transition-colors font-medium"
      >
        {children}
      </Link>
      
      <div className="absolute z-50 left-0 top-full mt-2 w-72 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 delay-150 pointer-events-none group-hover:pointer-events-auto">
        <div className="card !p-4 shadow-xl border border-surface-border/50 bg-surface-card">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-accent-bg flex items-center justify-center text-accent-dark font-bold text-lg">
              {client.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink truncate">{client.full_name}</p>
              <Badge variant={client.status === "active" ? "success" : client.status === "suspended" ? "danger" : "warning"} dot className="mt-1">
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 mb-3 text-xs">
            {client.email && (
              <div className="flex items-center gap-2 text-ink-muted">
                <Mail size={12} aria-hidden="true" /> <span className="truncate">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-ink-muted">
                <Phone size={12} aria-hidden="true" /> <span>{client.phone}</span>
              </div>
            )}
            {client.residential_address && (
              <div className="flex items-center gap-2 text-ink-muted">
                <MapPin size={12} aria-hidden="true" /> <span className="truncate">{client.residential_address}</span>
              </div>
            )}
          </div>

          <ContactActions phone={client.phone} email={client.email} className="mb-3" />
          
          <Link 
            href={`/dashboard/clients/${client.id}`}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-hover text-ink-muted hover:bg-success-bg hover:text-success-text transition-colors"
          >
            View Full Profile <ExternalLink size={10} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Vehicle Hover Link ──────────────────────────────────────────────────────
interface VehicleHoverLinkProps {
  vehicle: Vehicle;
  children: React.ReactNode;
  className?: string;
}

export function VehicleHoverLink({ vehicle, children, className = "" }: VehicleHoverLinkProps) {
  const statusColors: Record<string, "success" | "accent" | "warning" | "neutral"> = {
    available: "success",
    rented: "accent",
    maintenance: "warning",
    retired: "neutral",
  };

  return (
    <div className={`group relative inline-block ${className}`}>
      <Link 
        href={`/dashboard/fleet/${vehicle.id}`} 
        className="text-accent-dark hover:text-accent-dark/80 hover:underline transition-colors font-medium"
      >
        {children}
      </Link>
      
      <div className="absolute z-50 left-0 top-full mt-2 w-72 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 delay-150 pointer-events-none group-hover:pointer-events-auto">
        <div className="card !p-4 shadow-xl border border-surface-border/50 bg-surface-card">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center text-ink-muted">
              <Car size={20} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink truncate">{vehicle.make} {vehicle.model}</p>
              <p className="text-xs text-ink-muted mb-1">{vehicle.plate_number} · {vehicle.year}</p>
              <Badge variant={statusColors[vehicle.status] || "neutral"} dot>
                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="p-2 rounded-lg bg-surface-hover">
              <p className="text-ink-subtle text-[10px] uppercase mb-0.5">Daily Rate</p>
              <p className="font-semibold text-ink flex items-center gap-1">
                <DollarSign size={10} aria-hidden="true" /> {Number(vehicle.daily_rate).toLocaleString()}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-surface-hover">
              <p className="text-ink-subtle text-[10px] uppercase mb-0.5">Mileage</p>
              <p className="font-semibold text-ink flex items-center gap-1">
                {vehicle.current_mileage.toLocaleString()} km
              </p>
            </div>
          </div>

          <Link 
            href={`/dashboard/fleet/${vehicle.id}`}
            className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-surface-hover text-xs font-medium text-ink-muted hover:bg-accent-bg hover:text-accent-dark transition-colors"
          >
            View Full Details <ExternalLink size={10} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
