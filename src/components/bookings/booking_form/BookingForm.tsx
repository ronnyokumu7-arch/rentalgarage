"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, User, Info, Car, Users, Loader2, CheckCircle, DollarSign } from 'lucide-react';
import { useNewBooking } from '@/hooks/bookings/useNewBooking';
import ClientSearch from '../ClientSearch';
import VehicleSearch from '../VehicleSearch';
import DriverSearch from '../DriverSearch';
import BookingSummary from '../BookingSummary';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import PremiumDateAndTimePicker from './PremiumDateAndTimePicker';
import type { ServiceType } from '@/lib/types';

const bookingTabs = [
  { id: 'selfdrive', label: 'Self-Drive', icon: Car },
  { id: 'chauffeur', label: 'Chauffeur', icon: Users },
];

// ✅ Sections use the same container pattern as NewClientForm / Add Client modal
const sectionClass = "bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5";

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
    allClients, allVehicles, allDrivers,
    quoteError,
  } = useNewBooking();

  const selectedClient = getSelectedClient();
  const selectedVehicle = getSelectedVehicle();
  const selectedDriver = getSelectedDriver();

  // ✅ Local state to control fee input visibility
  const [showDeliveryInput, setShowDeliveryInput] = useState(false);
  const [showTollInput, setShowTollInput] = useState(false);
  const [showParkingInput, setShowParkingInput] = useState(false);

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

  // ✅ Helper for numeric fee inputs to prevent NaN
  const handleFeeChange = (field: 'toll_fees' | 'parking_fees' | 'delivery_fee', value: string) => {
    const num = parseFloat(value);
    updateField(field, isNaN(num) ? 0 : num);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    if (!loading && onClose) onClose();
  };

  return (
    <form id={formId} onSubmit={onSubmit} className="w-full space-y-6">

      {/* ── Mode Switcher — tab underline pattern (matches Add Client modal) ── */}
      <div className="flex border-b border-[var(--color-surface-border)]">
        {bookingTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = bookingMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBookingMode(tab.id as 'selfdrive' | 'chauffeur')}
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

          {bookingMode === 'chauffeur' ? (
            <>
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
      </section>

      {/* ── Section 2: Service Type & Schedule ────────────────── */}
      <section className={sectionClass}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CalendarDays size={16} />
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

      {/* ✅ NEW: Section 4 - Additional Fees (Standardized Toggle Pattern) */}
      <section className={sectionClass}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <DollarSign size={16} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Additional Fees</h3>
        </div>

        <div className="space-y-3">
          
          {/* ✅ Toll Fees Toggle + Conditional Input */}
          <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 hover:bg-[var(--color-surface-hover)] transition-colors">
            <input
              type="checkbox"
              checked={showTollInput}
              onChange={(e) => {
                setShowTollInput(e.target.checked);
                if (!e.target.checked) updateField('toll_fees', 0);
              }}
              className="w-4 h-4 mt-0.5 rounded border-[var(--color-surface-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-2 transition-all"
            />
            <div className="flex flex-col flex-1">
              <span className="text-xs font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-ink-primary)] transition-colors">
                Toll Fees
              </span>
              <span className="text-[10px] text-[var(--color-ink-muted)]">
                Highway or bridge tolls incurred during trip.
              </span>
              
              {showTollInput && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.toll_fees || ''}
                    onChange={(e) => handleFeeChange('toll_fees', e.target.value)}
                    placeholder="Enter toll amount..."
                    autoFocus
                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                  />
                </div>
              )}
            </div>
          </label>

          {/* ✅ Parking Fees Toggle + Conditional Input */}
          <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 hover:bg-[var(--color-surface-hover)] transition-colors">
            <input
              type="checkbox"
              checked={showParkingInput}
              onChange={(e) => {
                setShowParkingInput(e.target.checked);
                if (!e.target.checked) updateField('parking_fees', 0);
              }}
              className="w-4 h-4 mt-0.5 rounded border-[var(--color-surface-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-2 transition-all"
            />
            <div className="flex flex-col flex-1">
              <span className="text-xs font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-ink-primary)] transition-colors">
                Parking Fees
              </span>
              <span className="text-[10px] text-[var(--color-ink-muted)]">
                Paid parking at destination or pickup points.
              </span>
              
              {showParkingInput && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.parking_fees || ''}
                    onChange={(e) => handleFeeChange('parking_fees', e.target.value)}
                    placeholder="Enter parking amount..."
                    autoFocus
                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                  />
                </div>
              )}
            </div>
          </label>

          {/* ✅ Delivery Fee Toggle + Conditional Input */}
          <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 hover:bg-[var(--color-surface-hover)] transition-colors">
            <input
              type="checkbox"
              checked={showDeliveryInput}
              onChange={(e) => {
                setShowDeliveryInput(e.target.checked);
                if (!e.target.checked) updateField('delivery_fee', 0);
              }}
              className="w-4 h-4 mt-0.5 rounded border-[var(--color-surface-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-2 transition-all"
            />
            <div className="flex flex-col flex-1">
              <span className="text-xs font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-ink-primary)] transition-colors">
                Delivery Fee
              </span>
              <span className="text-[10px] text-[var(--color-ink-muted)]">
                Add delivery fee (charge twice to include collection fee if applicable).
              </span>
              
              {showDeliveryInput && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.delivery_fee || ''}
                    onChange={(e) => handleFeeChange('delivery_fee', e.target.value)}
                    placeholder="Enter delivery fee amount..."
                    autoFocus
                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                  />
                </div>
              )}
            </div>
          </label>

        </div>
      </section>

      {/* ─ Right Sidebar: Summary & Submit ────────────────────── */}
      <div className="lg:sticky lg:top-4 space-y-3">
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
