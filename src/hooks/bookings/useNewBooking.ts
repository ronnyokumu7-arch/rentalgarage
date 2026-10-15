"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { bookingsApi } from '@/lib/api/bookings';
import { clientsApi } from '@/lib/api/clients';
import { vehiclesApi } from '@/lib/api/vehicles';
import { servicesApi } from '@/lib/api/services';
import { driversApi } from '@/lib/api/drivers';
import { getApiErrorMessage } from '@/lib/api-error';
import type { Client, Vehicle, ServiceType, PricingResult, ServiceDefinition, DriverListItem } from '@/lib/types';

export function useNewBooking() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [drivers, setDrivers] = useState<DriverListItem[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');

  const [formData, setFormData] = useState({
    client_id: '',
    vehicle_id: '',
    driver_id: '',
    service_type: 'selfdrive' as ServiceType,
    pickup_at: '',
    scheduled_return_at: '',
    pickup_location: '',
    return_location: '',
    destination: '',
    service_details: {} as Record<string, any>,
    toll_fees: 0,
    parking_fees: 0,
  });

  const [quote, setQuote] = useState<PricingResult | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // ✅ Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, v, s, d] = await Promise.all([
          clientsApi.list(),
          vehiclesApi.list({ status: 'available' }),
          servicesApi.list(),
          driversApi.list({ include_archived: false }),
        ]);
        setClients(c);
        setVehicles(v);
        setServices(s.services);
        setDrivers(d);
      } catch {
        toast.error('Failed to load initial data');
      }
    };
    fetchData();
  }, []);

  // ─── Client filtering ────────────────────────────────────────────────────
  // No cap — the dropdown's max-h-80 overflow-y-auto handles the visual limit.
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const search = clientSearch.toLowerCase();
    return clients.filter(client =>
      client.full_name.toLowerCase().includes(search) ||
      client.id_number?.toLowerCase().includes(search) ||
      client.dl_number?.toLowerCase().includes(search) ||
      client.phone.toLowerCase().includes(search)
    );
  }, [clients, clientSearch]);

  // ─── Vehicle filtering ───────────────────────────────────────────────────
  // ✅ Only bookable vehicles (status === 'available') reach the dropdown.
  // Prevents selecting retired/maintenance vehicles that the backend will
  // reject on create/quote. No cap — scroll handles the visual limit.
  const filteredVehicles = useMemo(() => {
    const bookable = vehicles.filter(v => v.status === 'available');
    if (!vehicleSearch.trim()) return bookable;
    const search = vehicleSearch.toLowerCase();
    return bookable.filter(vehicle =>
      vehicle.make.toLowerCase().includes(search) ||
      vehicle.model.toLowerCase().includes(search) ||
      vehicle.plate_number.toLowerCase().includes(search)
    );
  }, [vehicles, vehicleSearch]);

  // ─── Driver filtering ────────────────────────────────────────────────────
  // ✅ Only assignable drivers (available | on_trip, not archived).
  // No cap — scroll handles the visual limit.
  const filteredDrivers = useMemo(() => {
    const assignable = drivers.filter(d =>
      !d.is_archived && (d.status === 'available' || d.status === 'on_trip')
    );
    if (!driverSearch.trim()) return assignable;
    const search = driverSearch.toLowerCase();
    return assignable.filter(driver =>
      driver.full_name.toLowerCase().includes(search) ||
      driver.phone.toLowerCase().includes(search) ||
      driver.id_number_masked?.toLowerCase().includes(search) ||
      driver.dl_number_masked?.toLowerCase().includes(search)
    );
  }, [drivers, driverSearch]);

  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, ServiceDefinition[]> = {};
    services.forEach(svc => {
      if (!grouped[svc.category]) grouped[svc.category] = [];
      grouped[svc.category].push(svc);
    });
    return grouped;
  }, [services]);

  // ✅ Serialize local datetime → ISO for backend
  const toISO = (localDatetime: string): string => {
    if (!localDatetime) return '';
    const d = new Date(localDatetime);
    if (isNaN(d.getTime())) return '';
    return d.toISOString();
  };

  // ✅ Debounced quote with VERBOSE error handling
  useEffect(() => {
    if (!formData.vehicle_id || !formData.pickup_at || !formData.scheduled_return_at) {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    const pickupISO = toISO(formData.pickup_at);
    const returnISO = toISO(formData.scheduled_return_at);

    if (!pickupISO || !returnISO) {
      setQuote(null);
      setQuoteError(`Invalid date format — pickup: "${formData.pickup_at}", return: "${formData.scheduled_return_at}"`);
      return;
    }

    const fetchQuote = async () => {
      setQuoteLoading(true);
      setQuoteError(null);

      const payload = {
        vehicle_id: parseInt(formData.vehicle_id),
        service_type: formData.service_type,
        pickup_at: pickupISO,
        return_at: returnISO,
        driver_id: formData.driver_id ? parseInt(formData.driver_id) : undefined,
        toll_fees: formData.toll_fees || undefined,
        parking_fees: formData.parking_fees || undefined,
        service_details: Object.keys(formData.service_details).length > 0
          ? formData.service_details
          : undefined,
      };

      try {
        const result = await bookingsApi.quote(payload);
        setQuote(result);
        setQuoteError(null);
      } catch (err: any) {
        setQuote(null);

        const status = err.response?.status;
        const data = err.response?.data;
        const detail = data?.detail;

        if (!err.response) {
          setQuoteError(`Network error: ${err.message || 'Cannot reach server'}`);
        } else if (typeof data?.message === 'string') {
          setQuoteError(data.message);
        } else if (typeof detail === 'string') {
          setQuoteError(detail);
        } else if (Array.isArray(detail) && detail.length > 0) {
          const msgs = detail.map((d: any) => {
            const loc = d.loc ? d.loc.join(' → ') : '';
            const msg = String(d.msg || '').replace(/^Value error,?\s*/i, '');
            return loc ? `${loc}: ${msg}` : msg;
          });
          setQuoteError(msgs.join('; '));
        } else if (typeof data === 'string') {
          setQuoteError(data.slice(0, 300));
        } else if (data) {
          setQuoteError(JSON.stringify(data).slice(0, 300));
        } else {
          setQuoteError(`[${status}] Unknown error — no response body`);
        }
      } finally {
        setQuoteLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchQuote, 300);
    return () => clearTimeout(timeoutId);
  }, [
    formData.vehicle_id,
    formData.service_type,
    formData.pickup_at,
    formData.scheduled_return_at,
    formData.driver_id,
    formData.toll_fees,
    formData.parking_fees,
    formData.service_details,
  ]);

  const updateField = (field: string, value: string | number | Record<string, any>) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Selection lookups resolve against the FULL source arrays — NOT the
  // filtered lists. Prevents silent-selection failures when a vehicle/driver
  // found via search would otherwise drop out of the filtered view.
  const getSelectedClient = () => clients.find(c => c.id.toString() === formData.client_id);
  const getSelectedVehicle = () => vehicles.find(v => v.id.toString() === formData.vehicle_id);
  const getSelectedDriver = () => drivers.find(d => d.id.toString() === formData.driver_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || !formData.vehicle_id) {
      toast.error('Please select a client and a vehicle.');
      return;
    }
    if (!formData.pickup_at || !formData.scheduled_return_at) {
      toast.error('Please select pickup and return times.');
      return;
    }
    if (quoteError) {
      toast.error(`Cannot create booking: ${quoteError}`);
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        client_id: Number(formData.client_id),
        vehicle_id: Number(formData.vehicle_id),
        service_type: formData.service_type,
        pickup_at: toISO(formData.pickup_at),
        scheduled_return_at: toISO(formData.scheduled_return_at),
        pickup_location: formData.pickup_location || undefined,
        return_location: formData.return_location || undefined,
        destination: formData.destination || undefined,
        currency_code: 'KES',
        toll_fees: formData.toll_fees || undefined,
        parking_fees: formData.parking_fees || undefined,
        service_details: Object.keys(formData.service_details).length > 0 ? formData.service_details : undefined,
      };
      if (formData.driver_id) {
        payload.driver_id = Number(formData.driver_id);
      }

      await bookingsApi.create(payload);
      toast.success('Booking created successfully!');

      // ✅ AUTO-REFRESH: notify bookings list to refetch
      window.dispatchEvent(new CustomEvent('booking:created'));

      router.push('/dashboard/bookings');
    } catch (error: any) {
      if (!error.response?.data?.message) {
        toast.error(getApiErrorMessage(error, 'Unable to reach the server. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    clients: filteredClients,
    vehicles: filteredVehicles,
    drivers: filteredDrivers,
    allClients: clients,
    allVehicles: vehicles,
    allDrivers: drivers,
    services,
    servicesByCategory,
    formData,
    clientSearch,
    vehicleSearch,
    driverSearch,
    setClientSearch,
    setVehicleSearch,
    setDriverSearch,
    updateField,
    getSelectedClient,
    getSelectedVehicle,
    getSelectedDriver,
    handleSubmit,
    quote,
    quoteLoading,
    quoteError,
  };
}
