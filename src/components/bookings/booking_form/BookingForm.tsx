"use client";

import { CalendarDays, MapPin, User, Loader2, CheckCircle, Info } from 'lucide-react';
import { useNewBooking } from '@/hooks/bookings/useNewBooking';
import ClientSearch from '../ClientSearch';
import VehicleSearch from '../VehicleSearch';
import DriverSearch from '../DriverSearch';
import BookingSummary from '../BookingSummary';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import PremiumDateAndTimePicker from './PremiumDateAndTimePicker';
import ServiceTypeSelector from './ServiceTypeSelector';
import { sectionClass } from './constants';
import type { ServiceType } from '@/lib/types';

export default function BookingForm() {
  const {
    loading,
    clients,
    vehicles,
    drivers,
    services,
    formData,
    clientSearch,
    vehicleSearch,
    driverSearch,
    setClientSearch,
    setVehicleSearch,
    setDriverSearch,
    updateField,
    calculateTotal,
    getSelectedClient,
    getSelectedVehicle,
    getSelectedDriver,
    handleSubmit,
    quote,
    quoteLoading,
  } = useNewBooking();

  const selectedClient = getSelectedClient();
  const selectedVehicle = getSelectedVehicle();
  const selectedDriver = getSelectedDriver();
  const totalAmount = calculateTotal();

  // Determine whether the selected service requires a staff driver
  const selectedServiceDef = services.find(
    (s) => s.key === ((formData.service_type as ServiceType) || "selfdrive")
  );
  const requiresDriver = !!selectedServiceDef?.requires_driver;

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
      
      <div className="space-y-3">
        
        {/* Section 1: Client, Vehicle & Driver */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
              <User size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Client, Vehicle & Driver</h3>
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

            {/* Driver selector: only shown for services that require a staff driver */}
            {requiresDriver ? (
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
            ) : (
              <p className="text-[10px] text-[var(--color-ink-muted)] flex items-start gap-1.5">
                <Info size={11} className="text-[var(--color-primary)] shrink-0 mt-[1px]" />
                This is a self-drive rental — the client will drive the vehicle themselves. No staff driver needed.
              </p>
            )}
          </div>
        </section>

        {/* Section 2: Service Type & Schedule */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CalendarDays size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Service Type & Schedule</h3>
          </div>

          <div className="mb-3">
            <ServiceTypeSelector
              value={(formData.service_type as ServiceType) || "selfdrive"}
              onChange={(type) => {
                updateField('service_type', type);
                // Auto-clear driver when switching to a service that doesn't require one
                const svc = services.find((s) => s.key === type);
                if (!svc?.requires_driver && formData.driver_id) {
                  updateField('driver_id', '');
                }
              }}
              services={services}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PremiumDateAndTimePicker
              label="Pickup Date & Time"
              value={formData.pickup_at || formData.start_date}
              onChange={(datetime) => {
                updateField('pickup_at', datetime);
                updateField('start_date', datetime.split('T')[0]);
                // Clear return if it's now before the new pickup
                if (formData.scheduled_return_at && new Date(datetime) >= new Date(formData.scheduled_return_at)) {
                  updateField('scheduled_return_at', '');
                  updateField('end_date', '');
                }
              }}
              required
            />
            <PremiumDateAndTimePicker
              label="Return Date & Time"
              value={formData.scheduled_return_at || formData.end_date}
              onChange={(datetime) => {
                updateField('scheduled_return_at', datetime);
                updateField('end_date', datetime.split('T')[0]);
              }}
              minDate={formData.pickup_at || formData.start_date || "today"}
              required
            />
          </div>
        </section>

        {/* Section 3: Pickup & Return Locations */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
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
        </section>

      </div>

      <aside className="lg:sticky lg:top-4 space-y-3">
        
        <BookingSummary
          client={selectedClient}
          vehicle={selectedVehicle}
          driver={requiresDriver ? selectedDriver : undefined}
          startDate={formData.pickup_at || formData.start_date}
          endDate={formData.scheduled_return_at || formData.end_date}
          totalAmount={totalAmount}
          serviceType={(formData.service_type as ServiceType) || "selfdrive"}
          quote={quote}
          quoteLoading={quoteLoading}
        />

        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating booking...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Create Booking
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-[var(--color-ink-muted)] mt-2">
            Your booking will be created with "Pending" status. You can confirm it once all details are verified.
          </p>
        </div>

      </aside>
    </form>
  );
}
