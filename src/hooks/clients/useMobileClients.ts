// src/hooks/clients/useMobileClients.ts
"use client";

import { useMemo } from "react";
import { useClientsList } from "@/hooks/clients/useClientsList";

export interface UseMobileClientsResult {
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  filteredClients: any[];
  paginatedClients: any[];
  pendingClients: number;
  statusOptions: { label: string; value: string; count: number }[];
  handleVerify: (id: number) => void;
  handleSuspend: (id: number) => void;      // ✅ ADDED
  handleReactivate: (id: number) => void;   // ✅ also add for future use
  handleArchive: (id: number) => void;
  refetch: () => void;
}

export function useMobileClients(): UseMobileClientsResult {
  const {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredClients,
    paginatedClients,
    pendingClients,
    handleVerify,
    handleSuspend,       // ✅ pulled from useClientsList
    handleReactivate,    // ✅ pulled from useClientsList
    handleArchive,
    refetch,
  } = useClientsList();

  const statusOptions = useMemo(() => {
    const active = filteredClients.filter(
      (c) => c.status !== "suspended" && (c as any).bookingsCount > 0,
    ).length;
    const inactive = filteredClients.filter(
      (c) => c.status === "suspended" || (c as any).bookingsCount === 0,
    ).length;

    return [
      { label: "Active",    value: "active",    count: active },
      { label: "Pending",   value: "pending",   count: pendingClients },
      { label: "Suspended", value: "suspended", count: inactive },
      { label: "Inactive",  value: "inactive",  count: inactive },
    ];
  }, [filteredClients, pendingClients]);

  return {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredClients,
    paginatedClients,
    pendingClients,
    statusOptions,
    handleVerify,
    handleSuspend,       // ✅ exposed in the return value
    handleReactivate,    // ✅ exposed in the return value
    handleArchive,
    refetch,
  };
}
