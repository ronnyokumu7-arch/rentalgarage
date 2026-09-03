"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, User, Info, Car, Users, Loader2, CheckCircle } from 'lucide-react';
import { useNewBooking } from '@/hooks/bookings/useNewBooking';
import ClientSearch from '../ClientSearch';
import VehicleSearch from '../VehicleSearch';
import DriverSearch from '../DriverSearch';
import BookingSummary from '../BookingSummary';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import PremiumDateAndTimePicker from './PremiumDateAndTimePicker';
import PremiumSwitch, { SwitchTab } from '@/components/ui/PremiumSwitch';
import type { ServiceType } from '@/lib/types';

const bookingTabs: SwitchTab[] = [
  { id: 'selfdrive', label: 'Self-Drive', icon: Car },
  { id: 'chauffeur', label: 'Chauffeur', icon: Users },
];

interface BookingFormProps {
  formId?: string;
  onClose?: () => void;
}

export default function BookingForm({ formId, onClose }: BookingFormProps) {
  const {
    loading, clients, vehicles, drivers, formData,
    clientSearch, vehicleSearch, driverSearch,
    setClientSearch, setVehicleSearch, setDriverSearch,
    updateField, getSelectedClient, getSelectedVehicle, getSelectedDriver,
    handleSubmit, quote, quoteLoading,
    allClients, quoteError,  // ✅ NEW: needed for display + error surfacing
  } = useNewBooking();

  const selectedClient = getSelectedClient();
  const selectedVehicle = getSelectedVehicle();
  const selectedDriver = getSelectedDriver();

  const [bookingMode, setBookingMode] = useState<'selfdrive' | 'chauffeur'>(
    formData.service_type === 'pro_driver' ? 'chauffeur' : 'selfdrive'
  );

  useEffect(() => {
    if (bookingMode === 'chauffeur' && formData.service_type !== 'pro_driver') {
      updateField('service_type', 'pro_driver');
    } else if (bookingMode === 'selfdrive' && formData.service_type !== 'selfdrive') {
      updateField('service_type', 'selfdrive');
      updateField('driver_id', '');
    }
  }, [bookingMode]);

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    if (!loading && onClose) onClose();
  };

  return (
    <form id={formId} onSubmit={onSubmit} className="w-full space-y-6">
      {/* ── Mode Switcher ────────────────────────────────────────── */}
      <PremiumSwitch
        tabs={bookingTabs}
        activeTab={bookingMode}
        onChange={(id) => setBookingMode(id as 'selfdrive' | 'chauffeur')}
      />

      {/* ── Section 1: Client, Vehicle & Driver ────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
            <User size={14} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Client, Vehicle & Driver</h3>
        </div>

        <div className="space-y-3">
          <ClientSearch
            selectedClientId={formData.client_id}
            clients={clients}
            allClients={allClients}  // ✅ NEW: resolves display from full list
            searchQuery={clientSearch}
            onSearchChange={setClientSearch}
            onSelect={(client) => {
              updateField('client_id', client?.id ? client.id.toString() : '');
              setClientSearch('');
            }}
          />

          <VehicleSearch
            selectedVehicleId={formData.vehicle_id}
            vehicles={vehicles}
            searchQuery={vehicleSearch}
            onSearchChange={setVehicleSearch}
            onSelect={(vehicle) => {
              updateField('vehicle_id', vehicle?.id ? vehicle.id.toString() : '');
              setVehicleSearch('');
            }}
          />

          {bookingMode === 'chauffeur' ? (
            <>
              <DriverSearch
                selectedDriverId={formData.driver_id}
                drivers={drivers}
                searchQuery={driverSearch}
                onSearchChange={setDriverSearch}
                onSelect={(driver) => {
                  updateField('driver_id', driver?.id ? driver.id.toString() : '');
                  setDriverSearch('');
                }}
              />

              <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 hover:bg-[var(--color-surface-hover)] transition-colors">
                <input
                  type="checkbox"
                  checked={is24HBooking}
                  onChange={(e) => handle24HToggle(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--color-surface-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-2 transition-all"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-ink-primary)] transition-colors">
                    24-Hour Booking
                  </span>
                  <span className="text-[10px] text-[var(--color-ink-muted)]">
                    Includes overnight driver accommodation fee.
                  </span>
                </div>
              </label>
            </>
          ) : (
            <p className="text-[10px] text-[var(--color-ink-muted)] flex items-start gap-1.5">
              <Info size={11} className="text-[var(--color-primary)] shrink-0 mt-[1px]" />
              This is a self-drive rental — the client will drive the vehicle themselves. No staff driver needed.
            </p>
          )}
        </div>
      </div>

      {/* ── Section 2: Service Type & Schedule ────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CalendarDays size={14} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Service Type & Schedule</h3>
        </div>

        <input type="hidden" name="service_type" value={formData.service_type} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PremiumDateAndTimePicker
            label="Pickup Date & Time"
            value={formData.pickup_at}
            onChange={(datetime) => {
              updateField('pickup_at', datetime);
              // ✅ Default return = pickup + 24h, ONLY once pickup is chosen
              if (!formData.scheduled_return_at || new Date(formData.scheduled_return_at) <= new Date(datetime)) {
                const d = new Date(datetime);
                d.setDate(d.getDate() + 1);
                const pad = (n: number) => String(n).padStart(2, '0');
                updateField('scheduled_return_at', `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
              }
            }}
            required
          />
          <PremiumDateAndTimePicker
            label="Return Date & Time"
            value={formData.scheduled_return_at}
            onChange={(datetime) => updateField('scheduled_return_at', datetime)}
            floor={formData.pickup_at ? new Date(formData.pickup_at).toISOString() : undefined}
            exclusiveFloor
            required
          />
        </div>
      </div>

      {/* ── Section 3: Pickup & Return Locations ────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <MapPin size={14} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Pickup & Return Locations</h3>
        </div>

        <div className="space-y-3">
          <AddressAutocomplete
            value={formData.pickup_location}
            onChange={(value) => updateField('pickup_location', value)}
            label="Pickup Location"
            placeholder="Enter the pickup address..."
          />

          <AddressAutocomplete
            value={formData.return_location}
            onChange={(value) => updateField('return_location', value)}
            label="Return Location"
            placeholder="Enter the return address..."
          />

          <AddressAutocomplete
            value={formData.destination}
            onChange={(value) => updateField('destination', value)}
            label="Destination (optional)"
            placeholder="Enter the destination address..."
          />
        </div>
      </div>

      {/* ── Right Sidebar: Summary & Submit ────────────────────── */}
      <div className="lg:sticky lg:top-4 space-y-3 pt-4 border-t border-[var(--color-surface-border)]">
        <BookingSummary
          client={selectedClient}
          vehicle={selectedVehicle}
          driver={bookingMode === 'chauffeur' ? selectedDriver : undefined}
          startDate={formData.pickup_at}
          endDate={formData.scheduled_return_at}
          totalAmount={quote?.total ? parseFloat(quote.total.toString()) : 0}
          serviceType={(formData.service_type as ServiceType) || "selfdrive"}
          quote={quote}
          quoteLoading={quoteLoading}
          quoteError={quoteError}  // ✅ NEW: shows real error if quote failed
        />

        {!formId && (
          <button
            type="submit"
            disabled={loading || quoteLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading || quoteLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Creating booking...</>
            ) : (
              <><CheckCircle size={16} /> Create Booking</>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
