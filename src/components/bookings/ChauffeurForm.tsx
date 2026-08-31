"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, User, Loader2, CheckCircle, Sparkles, Briefcase } from 'lucide-react';
import { useNewBooking } from '@/hooks/bookings/useNewBooking';

// ✅ FIXED: These are in the SAME folder, so use './' not '../'
import ClientSearch from './ClientSearch';
import VehicleSearch from './VehicleSearch';
import DriverSearch from './DriverSearch';
import BookingSummary from './BookingSummary';

// ✅ Assuming these are in the booking_form subfolder based on your screenshot
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import PremiumDateAndTimePicker from './booking_form/PremiumDateAndTimePicker';
import { sectionClass } from './booking_form/constants';

export default function ChauffeurForm({ onClose }: { onClose: () => void }) {
  const {
    loading, clients, vehicles, drivers, formData,
    clientSearch, vehicleSearch, driverSearch,
    setClientSearch, setVehicleSearch, setDriverSearch,
    updateField, calculateTotal, getSelectedClient, getSelectedVehicle, getSelectedDriver,
    handleSubmit, quote, quoteLoading,
  } = useNewBooking();

  // ✅ Force Pro Driver / Wedding service type on mount
  const [subService, setSubService] = useState<'wedding' | 'pro_driver'>('wedding');
  
  useEffect(() => {
    updateField('service_type', subService === 'wedding' ? 'wedding' : 'pro_driver');
    // Clear driver when switching to ensure a new one is selected
    updateField('driver_id', ''); 
  }, [subService]);

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

  const handle24HToggle = (checked: boolean) => {
    const currentDetails = (formData.service_details as Record<string, any>) || {};
    if (checked) {
      updateField('service_details', { ...currentDetails, accommodation_fee: 5000 }); 
    } else {
      const { accommodation_fee, ...rest } = currentDetails;
      updateField('service_details', Object.keys(rest).length > 0 ? rest : {});
    }
  };
  const is24HBooking = !!(formData.service_details as Record<string, any>)?.accommodation_fee;

  return (
    <form onSubmit={(e) => { handleSubmit(e); if (!loading) onClose(); }} className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-4">
        
        {/* Sub-Service Toggle */}
        <section className={sectionClass}>
          <div className="flex gap-2 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)]">
            <button type="button" onClick={() => setSubService('wedding')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${subService === 'wedding' ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'}`}>
              <Sparkles size={16} /> Wedding
            </button>
            <button type="button" onClick={() => setSubService('pro_driver')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${subService === 'pro_driver' ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'}`}>
              <Briefcase size={16} /> Pro Driver / Corporate
            </button>
          </div>
        </section>

        {/* Section 1: Client, Vehicle & Driver (Driver REQUIRED) */}
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
            <DriverSearch selectedDriverId={formData.driver_id} drivers={drivers} searchQuery={driverSearch} onSearchChange={setDriverSearch} onSelect={(d) => { updateField('driver_id', d?.id?.toString() || ''); setDriverSearch(''); }} />
            
            {subService === 'pro_driver' && (
              <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors">
                <input type="checkbox" checked={is24HBooking} onChange={(e) => handle24HToggle(e.target.checked)} className="w-4 h-4 rounded border-[var(--color-surface-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[var(--color-ink)]">24-Hour Booking</span>
                  <span className="text-[10px] text-[var(--color-ink-muted)]">Includes overnight driver accommodation fee (KES 5,000).</span>
                </div>
              </label>
            )}
          </div>
        </section>

        {/* Section 2: Schedule & Locations */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CalendarDays size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Schedule & Locations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <PremiumDateAndTimePicker label="Start Date & Time" blockPast minTime={pickupMinTime} value={formData.pickup_at || formData.start_date} onChange={(dt) => { updateField('pickup_at', dt); updateField('start_date', dt.split('T')[0]); }} required />
            <PremiumDateAndTimePicker label="End Date & Time" value={formData.scheduled_return_at || formData.end_date} onChange={(dt) => { updateField('scheduled_return_at', dt); updateField('end_date', dt.split('T')[0]); }} minDate={formData.pickup_at || formData.start_date || "today"} required />
          </div>
          <div className="space-y-3">
            <AddressAutocomplete value={formData.pickup_location} onChange={(v) => updateField('pickup_location', v)} label="Pickup Location" placeholder="Enter the pickup address..." />
            <AddressAutocomplete value={formData.return_location} onChange={(v) => updateField('return_location', v)} label="Return Location" placeholder="Enter the return address..." />
          </div>
        </section>

        {/* Section 3: Service-Specific Add-ons */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <MapPin size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">{subService === 'wedding' ? 'Wedding Add-ons' : 'Trip Add-ons'}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subService === 'wedding' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Decoration Fee (KES)</label>
                  <input type="number" min="0" value={(formData.service_details as any)?.decoration_fee || 0} onChange={(e) => updateField('service_details', { ...(formData.service_details as any), decoration_fee: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Extra Hours</label>
                  <input type="number" min="0" value={(formData.service_details as any)?.extra_hours || 0} onChange={(e) => updateField('service_details', { ...(formData.service_details as any), extra_hours: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Priority Booking Fee (KES)</label>
                  <input type="number" min="0" value={(formData.service_details as any)?.priority_booking_fee || 0} onChange={(e) => updateField('service_details', { ...(formData.service_details as any), priority_booking_fee: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Extra Hours (Overtime)</label>
                  <input type="number" min="0" value={(formData.service_details as any)?.extra_hours || 0} onChange={(e) => updateField('service_details', { ...(formData.service_details as any), extra_hours: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Toll Fees (KES)</label>
                  <input type="number" min="0" value={formData.toll_fees || 0} onChange={(e) => updateField('toll_fees', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Right Sidebar: Summary & Submit */}
      <aside className="lg:sticky lg:top-4 space-y-3">
        <BookingSummary client={selectedClient} vehicle={selectedVehicle} driver={selectedDriver} startDate={formData.pickup_at || formData.start_date} endDate={formData.scheduled_return_at || formData.end_date} totalAmount={totalAmount} serviceType={subService === 'wedding' ? 'wedding' : 'pro_driver'} quote={quote} quoteLoading={quoteLoading} />
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4">
          <button type="submit" disabled={loading || !formData.driver_id} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><CheckCircle size={16} /> Create Chauffeur Booking</>}
          </button>
          {!formData.driver_id && <p className="text-[10px] text-center text-[var(--color-warning-text)] mt-2">A staff driver must be assigned for chauffeur services.</p>}
        </div>
      </aside>
    </form>
  );
}
