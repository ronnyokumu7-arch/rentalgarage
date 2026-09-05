// src/hooks/fleet/useFleetList.ts
import { confirmAction } from "@/lib/utils/confirmAction";
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Vehicle, VehicleStatus } from "@/lib/types";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";

export function useFleetList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const [garageVehicle, setGarageVehicle] = useState<Vehicle | null>(null);
  const [garageModalOpen, setGarageModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vehiclesApi.list();
      setVehicles(data);
    } catch {
      toast.error("Failed to load fleet data");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ LIVE REFRESH: focus + visibility listeners for cross-tab changes
  useLiveRefresh(fetchVehicles);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // ✅ AUTO-REFRESH: listen for vehicle creation + updates from modals / inline contexts
  useEffect(() => {
    const handleVehicleEvent = () => fetchVehicles();
    window.addEventListener('vehicle:created', handleVehicleEvent);
    window.addEventListener('vehicle:updated', handleVehicleEvent);
    
    return () => {
      window.removeEventListener('vehicle:created', handleVehicleEvent);
      window.removeEventListener('vehicle:updated', handleVehicleEvent);
    };
  }, [fetchVehicles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        v.make.toLowerCase().includes(searchLower) ||
        v.model.toLowerCase().includes(searchLower) ||
        v.plate_number.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "" || v.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, statusFilter]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, currentPage]);

  const totalPages = Math.ceil(filteredVehicles.length / pageSize);
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === "available").length;
  const rentedVehicles = vehicles.filter((v) => v.status === "rented").length;
  const mileageDueCount = vehicles.filter((v) => v.mileage_due).length;

  const handleStatusAction = async (id: number, action: string) => {
    setActionLoadingId(id);
    try {
      if (action === "activate") {
        await vehiclesApi.activate(id);
        toast.success("Vehicle activated successfully");
      } else if (action === "maintenance") {
        await vehiclesApi.sendToMaintenance(id);
        toast.success("Vehicle sent to maintenance");
      } else if (action === "reactivate") {
        await vehiclesApi.reactivate(id);
        toast.success("Vehicle reactivated successfully");
      } else if (action === "restore") {
        await vehiclesApi.restore(id);
        toast.success("Vehicle restored to active fleet");
      } else if (action === "retire") {
        await vehiclesApi.retire(id);
        toast.success("Vehicle retired successfully");
      } else {
        // ✅ LIFECYCLE: all status transitions use dedicated endpoints.
        // This fallback catches unsupported actions gracefully.
        console.warn(`Unhandled fleet action: ${action}`);
        toast.error("Action not supported");
        return;
      }
      await fetchVehicles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      const errorMsg = err.response?.data?.detail || "Failed to update vehicle";
      toast.error(errorMsg);
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirmAction("Are you sure you want to archive this vehicle?")) return;
    setActionLoadingId(id);
    try {
      await vehiclesApi.archive(id);
      toast.success("Vehicle archived");
      await fetchVehicles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to archive vehicle");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleRetire = async (id: number) => {
    if (!confirmAction("Are you sure you want to retire this vehicle? This is permanent.")) return;
    setActionLoadingId(id);
    try {
      await vehiclesApi.retire(id);
      toast.success("Vehicle retired");
      await fetchVehicles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to retire vehicle");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleGarageSave = async (payload: { current_mileage: number; next_service_km?: number | null }) => {
    if (!garageVehicle) return;
    setActionLoadingId(garageVehicle.id);
    try {
      if (garageVehicle.mileage_due) {
        await vehiclesApi.updateMileage(garageVehicle.id, payload);
        toast.success("Mileage updated and vehicle is now available!");
      } else {
        await vehiclesApi.update(garageVehicle.id, payload);
        toast.success("Vehicle mileage updated!");
      }
      setGarageModalOpen(false);
      setGarageVehicle(null);
      await fetchVehicles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; message?: string } } };
      toast.error(err.response?.data?.message || err.response?.data?.detail || "Failed to update mileage");
      throw error;
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage,
    pageSize,
    garageVehicle, setGarageVehicle,
    garageModalOpen, setGarageModalOpen,
    actionLoadingId,
    openDropdownId, setOpenDropdownId,
    handleStatusAction,
    handleArchive,
    handleRetire,
    handleGarageSave,
    filteredVehicles,
    paginatedVehicles,
    totalPages,
    totalVehicles,
    availableVehicles,
    rentedVehicles,
    mileageDueCount,
    refetch: fetchVehicles,
  };
}
