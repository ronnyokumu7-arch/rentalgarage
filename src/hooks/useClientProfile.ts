// src/hooks/useClientProfile.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

import { clientsApi } from "@/lib/api/clients";
import { invoicesApi } from "@/lib/api/invoices";
import { contractsApi } from "@/lib/api/contracts";
import type { Client, Invoice, Contract } from "@/lib/types";

export interface ClientStats {
  totalBookings: number;
  totalRevenue: number;
  activeContracts: number;
  outstandingBalance: number;
  currencyCode: string;
}

export function useClientProfile() {
  const params = useParams();
  const clientId = Number(params.id);

  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ClientStats>({
    totalBookings: 0,
    totalRevenue: 0,
    activeContracts: 0,
    outstandingBalance: 0,
    currencyCode: "KES",
  });
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ─── Initial Data Fetch ────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const clientData = await clientsApi.get(clientId);
      setClient(clientData);

      const bookings = await clientsApi.getBookings(clientId);
      const clientBookingIds = bookings.map((b) => b.id);

      const [allInvoices, allContracts] = await Promise.allSettled([
        invoicesApi.list(),
        contractsApi.list(),
      ]);

      const validInvoices = allInvoices.status === "fulfilled" ? allInvoices.value : [];
      const validContracts = allContracts.status === "fulfilled" ? allContracts.value : [];

      // Filter to only show invoices/contracts for this Client's bookings
      const clientInvoices = validInvoices.filter((inv) => clientBookingIds.includes(inv.booking_id!));
      const clientContracts = validContracts.filter((c) => c.booking_id && clientBookingIds.includes(c.booking_id));

      // ─── Calculate Stats ─────────────────────────────────────────────────
      const totalBookings = bookings.length;
      const totalRevenue = clientInvoices.reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0);
      const activeContracts = clientContracts.filter((c) => c.status !== "void").length;
      const outstandingBalance = clientInvoices
        .filter((inv) => inv.status !== "paid" && inv.status !== "void")
        .reduce((sum, inv) => sum + (Number(inv.amount_due || 0) - Number(inv.amount_paid || 0)), 0);

      setStats({
        totalBookings,
        totalRevenue,
        activeContracts,
        outstandingBalance,
        currencyCode: clientInvoices[0]?.currency_code || "KES",
      });

      // Sort by date (newest first) and slice to top 3 for the UI
      setInvoices(
        clientInvoices
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
      );
      setContracts(
        clientContracts
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
      );
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to load client profile");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Personal Info & Address (Instant Update) ────────────────────────────
  const handleUpdateClient = async (data: Partial<Client>) => {
    setActionLoading(true);
    try {
      // ✅ FIX: Strip out `null` values because the API expects `undefined` for optional fields
      const cleanData: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== null) {
          cleanData[key] = value;
        }
      }

      const updated = await clientsApi.update(clientId, cleanData);
      setClient(updated);
      toast.success("Details updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update details");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Document Upload (✅ FIXED: Mapped to the new split API endpoints) ───
  const handleUploadDocument = async (
    type: "avatar" | "id_front" | "id_back" | "dl_front",
    file: File
  ) => {
    setActionLoading(true);
    try {
      let updated: Client;
      
      if (type === "avatar") {
        updated = await clientsApi.uploadAvatar(clientId, file);
      } else if (type === "id_front") {
        updated = await clientsApi.uploadIdFront(clientId, file);
      } else if (type === "id_back") {
        updated = await clientsApi.uploadIdBack(clientId, file);
      } else if (type === "dl_front") {
        updated = await clientsApi.uploadDlFront(clientId, file);
      } else {
        throw new Error("Invalid upload type");
      }

      setClient(updated);
      toast.success(`${type.replace("_", " ")} uploaded successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Upload failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Status Action (Instant Update) ──────────────────────────────────────
  const handleStatusAction = async (action: "suspend" | "reactivate") => {
    if (!client) return;
    setActionLoading(true);
    try {
      let updated: Client;
      if (action === "suspend") {
        updated = await clientsApi.suspend(client.id);
        toast.success("Client suspended successfully.", { icon: "⏸️" });
      } else {
        updated = await clientsApi.reactivate(client.id);
        const wasPending = client.status === "pending";
        toast.success(
          wasPending ? "Client verified successfully!" : "Client reactivated successfully!",
          { icon: "✅" }
        );
      }
      setClient(updated);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${action} client`);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Financial Actions (Instant Update) ──────────────────────────────────
  const handleFinancialAction = async (
    docType: "invoice" | "contract",
    action: "copy" | "download",
    id: number
  ) => {
    try {
      const api = docType === "invoice" ? invoicesApi : contractsApi;

      if (action === "copy") {
        const res = await api.generateShareLink(id);
        const url = res.share_token || `${window.location.origin}/${docType}/${res.share_token}`;
        await navigator.clipboard.writeText(url);
        toast.success(`${docType} link copied to clipboard`);
      }
      
      if (action === "download") {
        toast.loading(`Downloading ${docType}...`);
        const res = await api.downloadPdf(id);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = `${docType}-${id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast.success(`${docType} downloaded successfully`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${action} ${docType}`);
    }
  };

  return {
    client,
    invoices,
    contracts,
    stats,
    loading,
    actionLoading,
    handleUpdateClient,
    handleUploadDocument,
    handleStatusAction,
    handleFinancialAction,
  };
}
