"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { bookingsApi } from '@/lib/api/bookings';
import { clientsApi } from '@/lib/api/clients';
import { vehiclesApi } from '@/lib/api/vehicles';
import { servicesApi } from '@/lib/api/services';
import { driversApi } from '@/lib/api/drivers';
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
    start_date: '',
    end_date: '',
    pickup_at: '',
    scheduled_return_at: '',
    pickup_location: '',
    return_location: '',
    destination: '',
  });

  // ✅ MILESTONE 1: Live quote state
  const [quote, setQuote] = useState<PricingResult | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Load initial data (clients + vehicles + services + drivers)
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

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients.slice(0, 10);
    
    const search = clientSearch.toLowerCase();
    return clients.filter(client => 
      client.full_name.toLowerCase().includes(search) ||
      client.id_number?.toLowerCase().includes(search) ||
      client.dl_number?.toLowerCase().includes(search) ||
      client.phone.toLowerCase().includes(search)
    ).slice(0, 10);
  }, [clients, clientSearch]);

  // Filter vehicles based on search
  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) return vehicles.slice(0, 10);
    
    const search = vehicleSearch.toLowerCase();
    return vehicles.filter(vehicle => 
      vehicle.make.toLowerCase().includes(search) ||
      vehicle.model.toLowerCase().includes(search) ||
      vehicle.plate_number.toLowerCase().includes(search)
    ).slice(0, 10);
  }, [vehicles, vehicleSearch]);

  // ✅ MILESTONE 2: Filter drivers based on search (available + on_trip only for assignment)
  const filteredDrivers = useMemo(() => {
    const assignable = drivers.filter(d => 
      !d.is_archived && (d.status === 'available' || d.status === 'on_trip')
    );
    if (!driverSearch.trim()) return assignable.slice(0, 10);
    
    const search = driverSearch.toLowerCase();
    return assignable.filter(driver =>
      driver.full_name.toLowerCase().includes(search) ||
      driver.phone.toLowerCase().includes(search) ||
      driver.id_number_masked?.toLowerCase().includes(search) ||
      driver.dl_number_masked?.toLowerCase().includes(search)
    ).slice(0, 10);
  }, [drivers, driverSearch]);

  // ✅ MILESTONE 1.1: Group services by category (for Chauffeur sub-tabs)
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, ServiceDefinition[]> = {};
    services.forEach(svc => {
      if (!grouped[svc.category]) {
        grouped[svc.category] = [];
      }
      grouped[svc.category].push(svc);
    });
    return grouped;
  }, [services]);

  // ✅ MILESTONE 1: Debounced quote API call
  // ✅ MILESTONE 2: Includes driver_id so quote reflects per-driver fees
  useEffect(() => {
    if (
      !formData.vehicle_id ||
      !formData.pickup_at ||
      !formData.scheduled_return_at
    ) {
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      setQuoteLoading(true);
      try {
        const result = await bookingsApi.quote({
          vehicle_id: parseInt(formData.vehicle_id),
          service_type: formData.service_type,
          pickup_at: formData.pickup_at,
          return_at: formData.scheduled_return_at,
          // ✅ MILESTONE 2: Send driver_id for per-driver fee resolution
          driver_id: formData.driver_id ? parseInt(formData.driver_id) : undefined,
        });
        setQuote(result);
      } catch (err: any) {
        console.error("Quote failed:", err);
        setQuote(null);
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
    formData.driver_id,  // ✅ MILESTONE 2: Re-quote when driver changes
  ]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    // ✅ MILESTONE 1: Prefer quote total when available
    if (quote?.total) {
      return parseFloat(quote.total.toString());
    }

    // Fallback to client-side calculation
    if (!formData.start_date || !formData.end_date || !formData.vehicle_id) return 0;
    const vehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);
    if (!vehicle) return 0;
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const days = Math.max(1, diffDays);
    
    return days * Number(vehicle.daily_rate);
  };

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

    setLoading(true);
    try {
      const payload: any = {
        client_id: Number(formData.client_id),
        vehicle_id: Number(formData.vehicle_id),
        service_type: formData.service_type,
        start_date: formData.start_date || formData.pickup_at.split('T')[0],
        end_date: formData.end_date || formData.scheduled_return_at.split('T')[0],
        pickup_at: formData.pickup_at,
        scheduled_return_at: formData.scheduled_return_at,
        pickup_location: formData.pickup_location || undefined,
        return_location: formData.return_location || undefined,
        destination: formData.destination || undefined,
        total_amount: calculateTotal(),
        currency_code: 'KES',
        status: 'pending'
      };

      // ✅ MILESTONE 2: Include driver_id if selected
      if (formData.driver_id) {
        payload.driver_id = Number(formData.driver_id);
      }

      await bookingsApi.create(payload);
      toast.success('Booking created successfully!');
      router.push('/dashboard/bookings');
    } catch (error: any) {
      // ✅ MILESTONE 2 LOCKDOWN: FastAPI validation errors arrive as an ARRAY of
      // objects like [{loc: [...], msg: "Value error, end_date...", type: "value_error"}].
      // Rendering the array raw crashes React with "Objects are not valid as a React child".
      // Extract a human-readable string instead.
      const detail = error.response?.data?.detail;
      let msg = 'Failed to create booking';
      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        msg = String(detail[0]?.msg || 'Validation failed').replace(/^Value error,?\s*/i, '');
      }
      toast.error(msg);
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
    calculateTotal,
    getSelectedClient,
    getSelectedVehicle,
    getSelectedDriver,
    handleSubmit,
    quote,
    quoteLoading,
  };
}
