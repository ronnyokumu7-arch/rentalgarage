"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, User, Users, Loader2, CheckCircle } from 'lucide-react';
import { useNewBooking } from '@/hooks/bookings/useNewBooking';
import ClientSearch from './ClientSearch';
import VehicleSearch from './VehicleSearch';
import DriverSearch from './DriverSearch';
import BookingSummary from './BookingSummary';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import PremiumDateAndTimePicker from './booking_form/PremiumDateAndTimePicker';

const chauffeurTabs = [
  { id: 'pro_driver', label: 'Chauffeur', icon: Users },
  { id: 'wedding', label: 'Wedding', icon: Users },
];

// ✅ Sections use the same container pattern as BookingForm / NewClientForm
const sectionClass = "bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5";

interface ChauffeurFormProps {
  formId?: string;
  onClose?: () => void;
}

export default function ChauffeurForm({ formId, onClose }: ChauffeurFormProps) {
  const {
    loading, clients, vehicles, drivers, formData,
    clientSearch, vehicleSearch, driverSearch,
    setClientSearch, setVehicleSearch, setDriverSearch,
    updateField, getSelectedClient, getSelectedVehicle, getSelectedDriver,
    handleSubmit, quote, quoteLoading, quoteError,
    allClients, allVehicles, allDrivers,
  } = useNewBooking();

  const selectedClient = getSelectedClient();
  const selectedVehicle = getSelectedVehicle();
  const selectedDriver = getSelectedDriver();

  // ✅ Default to a valid sub-service if formData.service_type is still a
  // stale value (e.g. 'selfdrive' inherited from useNewBooking's initial state).
  // Prevents both tabs rendering inactive on first mount.
  const initialSubService: 'pro_driver' | 'wedding' =
    formData.service_type === 'pro_driver' || formData.service_type === 'wedding'
      ? formData.service_type
      : 'pro_driver';

  const [subService, setSubService] = useState<'pro_driver' | 'wedding'>(initialSubService);

  useEffect(() => {
    if (formData.service_type !== subService) {
      updateField('service_type', subService);
    }
  }, [subService]);

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

      {/* ── Sub-Service Switcher — tab underline pattern (matches Add Client modal) ── */}
      <div className="flex border-b border-[var(--color-surface-border)]">
        {chauffeurTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = subService === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubService(tab.id as 'pro_driver' | 'wedding')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
                isActive
                  ? 'text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5 rounded-t-lg'
                  : 'text-[var(--color-ink-muted)] border-transparent hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] rounded-t-lg'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Section 1: Client, Vehicle & Driver ────────────────── */}
      <section className={sectionClass}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
            <User size={16} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Client, Vehicle & Driver</h3>
        </div>

        <div className="space-y-3">
          <ClientSearch
            selectedClientId={formData.client_id}
            clients={clients}
            allClients={allClients}
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
            allVehicles={allVehicles}
            searchQuery={vehicleSearch}
            onSearchChange={setVehicleSearch}
            onSelect={(vehicle) => {
              updateField('vehicle_id', vehicle?.id ? vehicle.id.toString() : '');
              setVehicleSearch('');
            }}
          />

          <DriverSearch
            selectedDriverId={formData.driver_id}
            drivers={drivers}
            allDrivers={allDrivers}
            searchQuery={driverSearch}
            onSearchChange={setDriverSearch}
            onSelect={(driver) => {
              updateField('driver_id', driver?.id ? driver.id.toString() : '');
              setDriverSearch('');
            }}
          />

          {/* ── 24-Hour Booking Toggle (Chauffeur only) ────────────────── */}
          {subService === 'pro_driver' && (
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
          )}
        </div>
      </section>

      {/* ── Section 2: Service Type & Schedule ────────────────── */}
      <section className={sectionClass}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CalendarDays size={16} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Service Type & Schedule</h3>
        </div>

        <input type="hidden" name="service_type" value={subService} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PremiumDateAndTimePicker
            label="Start Date & Time"
            value={formData.pickup_at}
            onChange={(datetime) => {
              updateField('pickup_at', datetime);
              // ✅ Prefill end = start + 24h, ONLY once start is chosen
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
            label="End Date & Time"
            value={formData.scheduled_return_at}
            onChange={(datetime) => updateField('scheduled_return_at', datetime)}
            floor={formData.pickup_at ? new Date(formData.pickup_at).toISOString() : undefined}
            exclusiveFloor
            required
          />
        </div>
      </section>

      {/* ── Section 3: Pickup & Return Locations ────────────────── */}
      <section className={sectionClass}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <MapPin size={16} />
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
      </section>

      {/* ── Right Sidebar: Summary & Submit ────────────────────── */}
      <div className="lg:sticky lg:top-4 space-y-3">
        <BookingSummary
          client={selectedClient}
          vehicle={selectedVehicle}
          driver={selectedDriver}
          startDate={formData.pickup_at}
          endDate={formData.scheduled_return_at}
          totalAmount={quote?.total ? parseFloat(quote.total.toString()) : 0}
          serviceType={subService}
          quote={quote}
          quoteLoading={quoteLoading}
          quoteError={quoteError}
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
