// src/hooks/clients/useDesktopClients.ts
import { useMemo } from "react";
import { useClientsList } from "@/hooks/clients/useClientsList";

export interface UseDesktopClientsResult {
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  pageSize: number;
  totalPages: number;
  filteredClients: any[];
  paginatedClients: any[];
  pendingClients: number;
  clientMetrics: { total: number; active: number; inactive: number };
  statusOptions: { label: string; value: string; count: number }[];
  handleVerify: (id: number) => void;
  handleReactivate: (id: number) => void;
  handleArchive: (id: number) => void;
  refetch: () => void;
}

export function useDesktopClients(): UseDesktopClientsResult {
  const {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    filteredClients,
    paginatedClients,
    totalPages,
    pendingClients,
    handleVerify,
    handleReactivate,
    handleArchive,
    refetch,
  } = useClientsList();

  const clientMetrics = useMemo(() => {
    const total = filteredClients.length;
    const active = filteredClients.filter(
      (c) => c.status !== "suspended" && (c as any).bookingsCount > 0,
    ).length;
    const inactive = filteredClients.filter(
      (c) => c.status === "suspended" || (c as any).bookingsCount === 0,
    ).length;
    return { total, active, inactive };
  }, [filteredClients]);

  const statusOptions = useMemo(
    () => [
      { label: "Active",    value: "active",    count: clientMetrics.active },
      { label: "Pending",   value: "pending",   count: pendingClients },
      { label: "Suspended", value: "suspended", count: clientMetrics.inactive },
      { label: "Inactive",  value: "inactive",  count: clientMetrics.inactive },
    ],
    [clientMetrics.active, clientMetrics.inactive, pendingClients],
  );

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
    filteredClients,
    paginatedClients,
    pendingClients,
    clientMetrics,
    statusOptions,
    handleVerify,
    handleReactivate,
    handleArchive,
    refetch,
  };
}
