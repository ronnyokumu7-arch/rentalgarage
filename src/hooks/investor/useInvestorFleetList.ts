import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { vehiclesApi } from "@/lib/api/vehicles";
import { useAuth } from "@/context/auth-context";
import type { Vehicle, VehicleStatus } from "@/lib/types";

export function useInvestorFleetList() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const fetchVehicles = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Fetch all vehicles and filter client-side to only show those owned by this investor
      // (Once backend supports ?owner_id=X, update this to vehiclesApi.list({ owner_id: user.id }))
      const data = await vehiclesApi.list(); 
      const investorVehicles = data.filter((v: Vehicle) => v.owner_id === user.id);
      setVehicles(investorVehicles);
    } catch {
      toast.error("Failed to load your fleet data");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchVehicles();
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

  return {
    loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage,
    pageSize,
    filteredVehicles,
    paginatedVehicles,
    totalPages,
    totalVehicles,
    availableVehicles,
    rentedVehicles,
    refetch: fetchVehicles,
  };
}
