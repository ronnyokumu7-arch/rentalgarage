// src/hooks/fleet/useMobileFleet.ts
import { useMemo } from "react";
import { useFleetList } from "@/hooks/fleet/useFleetList";
import type { VehicleStatus } from "@/lib/types";

export interface UseMobileFleetResult {
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: VehicleStatus | "";
  setStatusFilter: (v: VehicleStatus | "") => void;
  filteredVehicles: any[];
  statusOptions: { label: string; value: string; count: number }[];
  handleStatusAction: (id: number, action: string) => void;
  handleArchive: (id: number) => void;
  handleRetire: (id: number) => void;
  refetch: () => void;
}

export function useMobileFleet(): UseMobileFleetResult {
  const {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredVehicles,
    handleStatusAction,
    handleArchive,
    handleRetire,
    refetch,
  } = useFleetList();

  const statusOptions = useMemo(() => {
    const opts = [
      { value: "pending_activation", label: "Pending Activation" },
      { value: "available",          label: "Available" },
      { value: "rented",             label: "Rented" },
      { value: "maintenance",        label: "Maintenance" },
      { value: "retired",            label: "Retired" },
    ];
    return opts.map((o) => ({
      ...o,
      count: filteredVehicles.filter((v) => v.status === o.value).length,
    }));
  }, [filteredVehicles]);

  return {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredVehicles,
    statusOptions,
    handleStatusAction,
    handleArchive,
    handleRetire,
    refetch,
  };
}
