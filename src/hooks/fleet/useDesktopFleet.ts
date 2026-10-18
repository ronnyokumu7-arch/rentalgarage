// src/hooks/fleet/useDesktopFleet.ts
import { useFleetList } from "@/hooks/fleet/useFleetList";
import type { VehicleStatus } from "@/lib/types";

export interface UseDesktopFleetResult {
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: VehicleStatus | "";
  setStatusFilter: (v: VehicleStatus | "") => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  pageSize: number;
  totalPages: number;
  filteredVehicles: any[];
  paginatedVehicles: any[];
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  mileageDueCount: number;
  garageVehicle: any | null;
  setGarageVehicle: (v: any | null) => void;
  garageModalOpen: boolean;
  setGarageModalOpen: (open: boolean) => void;
  setPricingVehicle: (v: any | null) => void;
  setIsPricingModalOpen: (open: boolean) => void;
  handleStatusAction: (id: number, action: string) => void;
  handleArchive: (id: number) => void;
  handleRetire: (id: number) => void;
  handleGarageSave: (payload: { current_mileage: number; next_service_km?: number | null }) => Promise<void>;
  refetch: () => void;
}

export function useDesktopFleet(): UseDesktopFleetResult {
  const {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    filteredVehicles,
    paginatedVehicles,
    totalPages,
    totalVehicles,
    availableVehicles,
    rentedVehicles,
    mileageDueCount,
    garageVehicle,
    setGarageVehicle,
    garageModalOpen,
    setGarageModalOpen,
    setPricingVehicle,
    setIsPricingModalOpen,
    handleStatusAction,
    handleArchive,
    handleRetire,
    handleGarageSave,
    refetch,
  } = useFleetList();

  return {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    filteredVehicles,
    paginatedVehicles,
    totalVehicles,
    availableVehicles,
    rentedVehicles,
    mileageDueCount,
    garageVehicle,
    setGarageVehicle,
    garageModalOpen,
    setGarageModalOpen,
    setPricingVehicle,
    setIsPricingModalOpen,
    handleStatusAction,
    handleArchive,
    handleRetire,
    handleGarageSave,
    refetch,
  };
}
