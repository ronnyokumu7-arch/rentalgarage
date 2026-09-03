"use client";

import { useEffect } from "react";
import { MapPin, User, Plane, Loader2, CheckCircle } from 'lucide-react';
import { useNewBooking } from '@/hooks/bookings/useNewBooking';
import ClientSearch from './ClientSearch';
import VehicleSearch from './VehicleSearch';
import DriverSearch from './DriverSearch';
import BookingSummary from './BookingSummary';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import PremiumDateAndTimePicker from './booking_form/PremiumDateAndTimePicker';

interface AirportTransferFormProps {
  formId?: string;
  onClose?: () => void;
}

export default function AirportTransferForm({ formId, onClose }: AirportTransferFormProps) {
  const {
    loading, clients, vehicles, drivers, formData,
    clientSearch, vehicleSearch, driverSearch,
    setClientSearch, setVehicleSearch, setDriverSearch,
    updateField, getSelectedClient, getSelectedVehicle, getSelectedDriver,
    handleSubmit, quote, quoteLoading,
  } = useNewBooking();

  const selectedClient = getSelectedClient();
  const selectedVehicle = getSelectedVehicle();
  const selectedDriver = getSelectedDriver();

  // ✅ Set service_type to airport_transfer on mount
  useEffect(() => {
    if (formData.service_type !== 'airport_transfer') {
      updateField('service_type', 'airport_transfer');
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    if (!loading && onClose) onClose();
  };

  return (
    <form id={formId} onSubmit={onSubmit} className="w-full space-y-6">
      {/* ── Section 1: Client, Vehicle & Driver ────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
            <User size={14} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Client & Vehicle</h3>
        </div>

        <div className="space-y-3">
          <ClientSearch
            selectedClientId={formData.client_id}
            clients={clients}
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
        </div>
      </div>

      {/* ── Section 2: Pickup & Drop-off Schedule ────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Plane size={14} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Pickup & Drop-off Schedule</h3>
        </div>

        <input type="hidden" name="service_type" value="airport_transfer" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PremiumDateAndTimePicker
            label="Pickup Date & Time"
            value={formData.pickup_at}
            onChange={(datetime) => {
              updateField('pickup_at', datetime);
              // ✅ Prefill return = pickup + 24h (only when pickup is chosen)
              if (!formData.scheduled_return_at || new Date(formData.scheduled_return_at) <= new Date(datetime)) {
                const d = new Date(datetime);
                d.setDate(d.getDate() + 1);
                const pad = (n: number) => String(n).padStart(2, '0');
                updateField('scheduled_return_at',
                  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
              }
            }}
            required
          />
          <PremiumDateAndTimePicker
            label="Return/Drop-off Time"
            value={formData.scheduled_return_at}
            onChange={(datetime) => updateField('scheduled_return_at', datetime)}
            floor={formData.pickup_at ? new Date(formData.pickup_at).toISOString() : undefined}
            exclusiveFloor
            required
          />
        </div>
      </div>

      {/* ── Section 3: Locations ──────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <MapPin size={14} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Locations</h3>
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
          driver={selectedDriver}
          startDate={formData.pickup_at}
          endDate={formData.scheduled_return_at}
          totalAmount={quote?.total ? parseFloat(quote.total.toString()) : 0}
          serviceType="airport_transfer"
          quote={quote}
          quoteLoading={quoteLoading}
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
