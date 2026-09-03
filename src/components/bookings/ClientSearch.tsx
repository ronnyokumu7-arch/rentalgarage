"use client";

import { useState } from "react";
import { User, Phone, CreditCard, Car } from "lucide-react";
import type { Client } from "@/lib/types";

interface ClientSearchProps {
  selectedClientId: string;
  clients: Client[];          // ✅ Filtered list (for dropdown)
  allClients?: Client[];      // ✅ Optional full list (for display resolution)
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelect: (client: Client) => void;
}

export default function ClientSearch({
  selectedClientId,
  clients,
  allClients,
  searchQuery,
  onSearchChange,
  onSelect
}: ClientSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Resolve display from FULL list when available; fall back to filtered.
  // Never crashes if a consumer hasn't been updated to pass allClients.
  const pool = allClients ?? clients;
  const selectedClient = pool.find(c => c.id.toString() === selectedClientId);

  return (
    <div className="relative">
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
        Client <span className="text-[var(--color-danger)]">*</span>
      </label>
      
      {/* Search Input */}
      <div className="relative">
        <User size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
        <input
          type="text"
          value={isOpen ? searchQuery : selectedClient ? `${selectedClient.full_name} (${selectedClient.phone})` : searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by name, ID, DL, or phone..."
          className="w-full px-3 py-2 pl-8 pr-10 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
        />
        {selectedClient && !isOpen && (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              onSelect({} as Client);
            }}
            className="absolute right-2 top-2 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-xl max-h-80 overflow-y-auto">
          {clients.length === 0 ? (
            <div className="p-3 text-xs text-[var(--color-ink-muted)] text-center">
              No clients found
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    onSelect(client);
                    setIsOpen(false);
                  }}
                  className="w-full p-3 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-left border border-transparent hover:border-[var(--color-surface-border)]"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-semibold text-sm text-[var(--color-ink)]">
                      {client.full_name}
                    </div>
                    {selectedClientId === client.id.toString() && (
                      <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--color-ink-muted)]">
                    <div className="flex items-center gap-1">
                      <Phone size={10} />
                      <span>{client.phone}</span>
                    </div>
                    {client.id_number && (
                      <div className="flex items-center gap-1">
                        <CreditCard size={10} />
                        <span>{client.id_number}</span>
                      </div>
                    )}
                    {client.dl_number && (
                      <div className="flex items-center gap-1 col-span-2">
                        <Car size={10} />
                        <span>{client.dl_number}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click outside handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
