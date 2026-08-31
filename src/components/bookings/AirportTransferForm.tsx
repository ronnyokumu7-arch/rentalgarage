"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, User, Loader2, CheckCircle, Info, Plane } from 'lucide-react';
import { useNewBooking } from '@/hooks/bookings/useNewBooking';

// ✅ CORRECTED PATHS (Same folder)
import ClientSearch from './ClientSearch';
import VehicleSearch from './VehicleSearch';
import DriverSearch from './DriverSearch';
import BookingSummary from './BookingSummary';

// ✅ Check if these are inside the 'booking_form' subfolder
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import PremiumDateAndTimePicker from './booking_form/PremiumDateAndTimePicker';
import { sectionClass } from './booking_form/constants';


export default function AirportTransferForm({ onClose }: { onClose: () => void }) {
  const {
    loading, clients, vehicles, drivers, formData,
    clientSearch, vehicleSearch, driverSearch,
    setClientSearch, setVehicleSearch, setDriverSearch,
    updateField, calculateTotal, getSelectedClient, getSelectedVehicle, getSelectedDriver,
    handleSubmit, quote, quoteLoading,
  } = useNewBooking();

  // ✅ Force Airport Transfer service type on mount
  useEffect(() => {
    updateField('service_type', 'airport_transfer');
  }, []);

  const selectedClient = getSelectedClient();
  const selectedVehicle = getSelectedVehicle();
  const selectedDriver = getSelectedDriver();
  const totalAmount = calculateTotal();

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const pickupMinTime = useMemo(() => {
    const totalMin = now.getHours() * 60 + now.getMinutes();
    const slotMin = Math.ceil(totalMin / 30) * 30;
    const h = Math.floor(slotMin / 60);
    const m = slotMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }, [now]);

  return (
    <form onSubmit={(e) => { handleSubmit(e); if (!loading) onClose(); }} className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-4">
        
        {/* Section 1: Client, Vehicle & Driver */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
              <User size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Client, Vehicle & Driver</h3>
          </div>
          <div className="space-y-3">
            <ClientSearch selectedClientId={formData.client_id} clients={clients} searchQuery={clientSearch} onSearchChange={setClientSearch} onSelect={(c) => { updateField('client_id', c?.id?.toString() || ''); setClientSearch(''); }} />
            <VehicleSearch selectedVehicleId={formData.vehicle_id} vehicles={vehicles} searchQuery={vehicleSearch} onSearchChange={setVehicleSearch} onSelect={(v) => { updateField('vehicle_id', v?.id?.toString() || ''); setVehicleSearch(''); }} />
            
            {/* Driver is optional for airport transfers */}
            <DriverSearch selectedDriverId={formData.driver_id} drivers={drivers} searchQuery={driverSearch} onSearchChange={setDriverSearch} onSelect={(d) => { updateField('driver_id', d?.id?.toString() || ''); setDriverSearch(''); }} />
            <p className="text-[10px] text-[var(--color-ink-muted)] flex items-start gap-1.5">
              <Info size={11} className="text-[var(--color-primary)] shrink-0 mt-[1px]" />
              Driver assignment is optional. Leave blank if the vehicle will be dispatched without a pre-assigned staff driver.
            </p>
          </div>
        </section>

        {/* Section 2: Flight & Transfer Details */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Plane size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Flight & Transfer Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Direction</label>
              <select 
                value={(formData.service_details as any)?.direction || 'airport_pickup'} 
                onChange={(e) => updateField('service_details', { ...(formData.service_details as any), direction: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              >
                <option value="airport_pickup">Airport Pickup (Arrival)</option>
                <option value="airport_dropoff">Airport Drop-off (Departure)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Flight Number</label>
              <input type="text" placeholder="e.g., KQ100" value={(formData.service_details as any)?.flight_number || ''} onChange={(e) => updateField('service_details', { ...(formData.service_details as any), flight_number: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Airline</label>
              <input type="text" placeholder="e.g., Kenya Airways" value={(formData.service_details as any)?.airline || ''} onChange={(e) => updateField('service_details', { ...(formData.service_details as any), airline: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Terminal</label>
              <input type="text" placeholder="e.g., Terminal 1A" value={(formData.service_details as any)?.terminal || ''} onChange={(e) => updateField('service_details', { ...(formData.service_details as any), terminal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
            </div>
          </div>
        </section>

        {/* Section 3: Schedule & Locations */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <CalendarDays size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Schedule & Locations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <PremiumDateAndTimePicker label="Pickup Date & Time" blockPast minTime={pickupMinTime} value={formData.pickup_at || formData.start_date} onChange={(dt) => { updateField('pickup_at', dt); updateField('start_date', dt.split('T')[0]); }} required />
            <PremiumDateAndTimePicker label="Return/Drop-off Time" value={formData.scheduled_return_at || formData.end_date} onChange={(dt) => { updateField('scheduled_return_at', dt); updateField('end_date', dt.split('T')[0]); }} minDate={formData.pickup_at || formData.start_date || "today"} required />
          </div>
          <div className="space-y-3">
            <AddressAutocomplete value={formData.pickup_location} onChange={(v) => updateField('pickup_location', v)} label="Pickup Location" placeholder="e.g., JKIA Terminal 1A" />
            <AddressAutocomplete value={formData.return_location} onChange={(v) => updateField('return_location', v)} label="Drop-off Location" placeholder="e.g., Nairobi, Westlands" />
          </div>
        </section>

        {/* Section 4: Add-on Fees */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <MapPin size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Add-on Fees</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Toll Fees (KES)</label>
              <input type="number" min="0" value={formData.toll_fees || 0} onChange={(e) => updateField('toll_fees', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Parking Fees (KES)</label>
              <input type="number" min="0" value={formData.parking_fees || 0} onChange={(e) => updateField('parking_fees', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
            </div>
          </div>
        </section>
      </div>

      {/* Right Sidebar: Summary & Submit */}
      <aside className="lg:sticky lg:top-4 space-y-3">
        <BookingSummary client={selectedClient} vehicle={selectedVehicle} driver={selectedDriver} startDate={formData.pickup_at || formData.start_date} endDate={formData.scheduled_return_at || formData.end_date} totalAmount={totalAmount} serviceType="airport_transfer" quote={quote} quoteLoading={quoteLoading} />
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4">
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><CheckCircle size={16} /> Create Airport Booking</>}
          </button>
        </div>
      </aside>
    </form>
  );
}
