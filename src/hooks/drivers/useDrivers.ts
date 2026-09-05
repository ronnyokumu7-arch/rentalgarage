//src/hooks/drivers/useDrivers.ts
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { driversApi } from '@/lib/api/drivers';
import type { Driver, DriverCreate, DriverListItem, DriverStatus, DriverUpdate } from '@/lib/types';
import { useLiveRefresh } from '@/hooks/useLiveRefresh';

export function useDrivers() {
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<DriverListItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverStatus | ''>('');
  const [includeArchived, setIncludeArchived] = useState(false);

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ✅ STABLE REF: wrapped in useCallback for useLiveRefresh + event listeners
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        page_size: 200, // Load all for now; add pagination later if needed
      };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      if (includeArchived) params.include_archived = true;

      const data = await driversApi.list(params);
      setDrivers(data);
    } catch (error: any) {
      console.error('Failed to load drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, includeArchived]);

  // ✅ LIVE REFRESH: focus + visibility listeners for cross-tab changes
  useLiveRefresh(fetchDrivers);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // ✅ AUTO-REFRESH: listen for driver creation + updates from modals / inline contexts
  useEffect(() => {
    const handleDriverEvent = () => fetchDrivers();
    window.addEventListener('driver:created', handleDriverEvent);
    window.addEventListener('driver:updated', handleDriverEvent);
    
    return () => {
      window.removeEventListener('driver:created', handleDriverEvent);
      window.removeEventListener('driver:updated', handleDriverEvent);
    };
  }, [fetchDrivers]);

  // Filter locally (for instant search feel)
  const filteredDrivers = useMemo(() => {
    if (!search.trim()) return drivers;
    const q = search.toLowerCase();
    return drivers.filter(d =>
      d.full_name.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q) ||
      d.id_number_masked?.toLowerCase().includes(q) ||
      d.dl_number_masked?.toLowerCase().includes(q)
    );
  }, [drivers, search]);

  // Fetch full detail
  const loadDriverDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const driver = await driversApi.get(id);
      setSelectedDriver(driver);
    } catch (error: any) {
      console.error('Failed to load driver:', error);
      toast.error('Failed to load driver details');
    } finally {
      setDetailLoading(false);
    }
  };

  // CRUD operations
  const createDriver = async (payload: DriverCreate) => {
    try {
      await driversApi.create(payload);
      toast.success('Driver created successfully!');
      
      // ✅ AUTO-REFRESH: notify drivers list to refetch (new driver appears instantly)
      window.dispatchEvent(new CustomEvent('driver:created'));
      
      await fetchDrivers();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create driver');
      return false;
    }
  };

  const updateDriver = async (id: number, payload: DriverUpdate) => {
    try {
      await driversApi.update(id, payload);
      toast.success('Driver updated successfully!');
      
      // ✅ AUTO-REFRESH: notify drivers list to refetch (cross-context update)
      window.dispatchEvent(new CustomEvent('driver:updated', { detail: { driverId: id } }));
      
      await fetchDrivers();
      setSelectedDriver(null);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update driver');
      return false;
    }
  };

  const archiveDriver = async (id: number) => {
    try {
      await driversApi.archive(id);
      toast.success('Driver archived');
      
      // ✅ AUTO-REFRESH: notify drivers list to refetch
      window.dispatchEvent(new CustomEvent('driver:updated', { detail: { driverId: id } }));
      
      await fetchDrivers();
      setSelectedDriver(null);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to archive driver');
      return false;
    }
  };

  const restoreDriver = async (id: number) => {
    try {
      await driversApi.restore(id);
      toast.success('Driver restored');
      
      // ✅ AUTO-REFRESH: notify drivers list to refetch
      window.dispatchEvent(new CustomEvent('driver:updated', { detail: { driverId: id } }));
      
      await fetchDrivers();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to restore driver');
      return false;
    }
  };

  const clearSelection = () => setSelectedDriver(null);

  return {
    loading,
    drivers: filteredDrivers,
    allDrivers: drivers,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    includeArchived,
    setIncludeArchived,
    selectedDriver,
    detailLoading,
    loadDriverDetail,
    clearSelection,
    createDriver,
    updateDriver,
    archiveDriver,
    restoreDriver,
    refresh: fetchDrivers,
    refetch: fetchDrivers,
  };
}
