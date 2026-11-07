// src/components/ui/AddressAutocomplete.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { MapPin } from "@phosphor-icons/react/ssr";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Search address...",
  label = "Address",
  className = ""
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer (300ms debounce)
    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        const addresses = data.map((item: any) => item.display_name);
        setSuggestions(addresses);
        setShowSuggestions(addresses.length > 0);
      } catch (_error) {
        console.error("Address search error:", _error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Wait 300ms after user stops typing
  };

  const handleSelect = (address: string) => {
    onChange(address);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <MapPin size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" aria-hidden="true" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            searchAddress(e.target.value);
          }}
          onFocus={() => value.length >= 3 && searchAddress(value)}
          placeholder={placeholder}
          className={`${inputClass} pl-8`}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-2.5 top-2.5">
            <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((address, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full px-3 py-2.5 text-left text-xs hover:bg-[var(--color-surface-hover)] first:rounded-t-lg last:rounded-b-lg transition-colors border-b border-[var(--color-surface-border)] last:border-0"
              onClick={() => handleSelect(address)}
            >
              <div className="flex items-start gap-2">
                <MapPin size={12} className="text-[var(--color-ink-subtle)] mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-[var(--color-ink)]">{address}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
