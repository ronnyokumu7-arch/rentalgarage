// src/components/bookings/TripLogisticsSection.tsx
"use client";

import { useState } from "react";
import { MapPin, Edit2, Save, X } from "lucide-react";
import type { Booking } from "@/lib/types";

interface TripLogisticsSectionProps {
  booking: Booking;
  isEditable: boolean;
  tripDates: { start: string; end: string };
  setTripDates: (dates: { start: string; end: string }) => void;
  destination: string;
  setDestination: (dest: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

const LOCAL_SUGGESTIONS = ["Nairobi", "Mombasa", "Diani Beach", "Kisumu", "Maasai Mara", "Naivasha"];

export default function TripLogisticsSection({
  booking, isEditable, tripDates, setTripDates, destination, setDestination, onSave, isSaving
}: TripLogisticsSectionProps) {
  
  const [isEditing, setIsEditing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = LOCAL_SUGGESTIONS.filter((loc) =>
    loc.toLowerCase().includes(destination.toLowerCase()) && destination.length > 0
  );

  if (isEditing) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-accent-dark" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Trip Logistics (Edit Mode)</h3>
          </div>
          <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-ink-muted hover:text-ink uppercase tracking-wide flex items-center gap-1">
            <X size={12} /> Cancel
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase text-ink-subtle font-bold mb-1.5 block">Pickup Date</label>
              <input type="date" value={tripDates.start} onChange={(e) => setTripDates({ ...tripDates, start: e.target.value })} className="input" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-ink-subtle font-bold mb-1.5 block">Return Date</label>
              <input type="date" value={tripDates.end} onChange={(e) => setTripDates({ ...tripDates, end: e.target.value })} className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase text-ink-subtle font-bold mb-1.5 block">Pickup Location</label>
              <input type="text" value={booking.pickup_location || ""} disabled className="input bg-surface-hover cursor-not-allowed" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-ink-subtle font-bold mb-1.5 block">Return Location</label>
              <input type="text" value={booking.return_location || ""} disabled className="input bg-surface-hover cursor-not-allowed" />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] uppercase text-ink-subtle font-bold mb-1.5 block">Destination / Area of Use</label>
            <input 
              type="text" 
              value={destination} 
              onChange={(e) => { setDestination(e.target.value); setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="e.g., Maasai Mara, Diani Beach" 
              className="input" 
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-surface-card border border-surface-border rounded-lg shadow-lg max-h-32 overflow-y-auto">
                {filteredSuggestions.map((loc) => (
                  <button key={loc} type="button" onMouseDown={() => { setDestination(loc); setShowSuggestions(false); }} className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-surface-hover transition-colors">
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={onSave} disabled={isSaving} className="w-full py-2.5 bg-accent-dark text-white text-sm font-bold rounded-lg hover:bg-accent-darker transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={14} /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    );
  }

  // View Mode
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-accent-dark" />
          <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Trip Logistics</h3>
        </div>
        {isEditable && (
          <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-accent-dark hover:text-accent-darker uppercase tracking-wide flex items-center gap-1">
            <Edit2 size={12} /> Edit Trip
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] uppercase text-ink-subtle font-bold">Trip Duration</p>
            <p className="text-sm font-semibold text-ink">
              {new Date(booking.start_date).toLocaleDateString()} — {new Date(booking.end_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-ink-subtle font-bold">Destination</p>
            <p className="text-sm font-semibold text-ink">{booking.destination || "Not specified"}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] uppercase text-ink-subtle font-bold">Pickup Point</p>
            <p className="text-sm font-semibold text-ink">{booking.pickup_location || "TBD"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-ink-subtle font-bold">Return Point</p>
            <p className="text-sm font-semibold text-ink">{booking.return_location || "TBD"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
