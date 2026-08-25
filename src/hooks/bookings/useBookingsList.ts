"use client";
import { confirmAction } from "@/lib/utils/confirmAction";

import { useState, useEffect, useMemo } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import { contractsApi } from "@/lib/api/contracts";
import type { Booking, CancellationReason } from "@/lib/types";
import toast from "react-hot-toast";

export type ViewMode = "active" | "vault";

export function useBookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const pageSize = 7;

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = view === "vault" 
        ? await bookingsApi.listArchived() 
        : await bookingsApi.list();
      setBookings(data);
    } catch (_error) {
      console.error("Failed to fetch bookings", _error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [view]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    if (openDropdownId !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
    return undefined;
  }, [openDropdownId]);

  const activeCount = useMemo(() => bookings.filter(b => !b.is_archived).length, [bookings]);
  const vaultCount = useMemo(() => bookings.filter(b => b.is_archived).length, [bookings]);
  const upcomingCount = useMemo(() => bookings.filter(b => !b.is_archived && (b.status === 'pending' || b.status === 'confirmed')).length, [bookings]);
  const activeTripsCount = useMemo(() => bookings.filter(b => !b.is_archived && b.status === 'active').length, [bookings]);
  const completedCount = useMemo(() => bookings.filter(b => !b.is_archived && b.status === 'completed').length, [bookings]);

  const filteredBookings = useMemo(() => {
    let result = bookings;
    if (view === "active") {
      result = result.filter(b => !b.is_archived);
    } else {
      result = result.filter(b => b.is_archived);
    }
    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((b) => 
        b.booking_number?.toLowerCase().includes(lowerSearch) || 
        b.id.toString().includes(lowerSearch) || 
        b.destination?.toLowerCase().includes(lowerSearch) ||
        b.pickup_location?.toLowerCase().includes(lowerSearch)
      );
    }
    return result;
  }, [bookings, view, statusFilter, search]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view]);

  // ✅ DEPRECATED: Confirm is now client-driven via quotation accept.
  // Backend endpoint still exists for backward compat, but dashboard button should be removed.
  const handleConfirm = async (bookingId: number) => {
    setActionLoadingId(bookingId);
    try {
      await bookingsApi.confirm(bookingId);
      toast.success("Booking confirmed! Contract & Invoice generated.");
      await fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to confirm booking");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleStartTrip = async (bookingId: number) => {
    setActionLoadingId(bookingId);
    try {
      await bookingsApi.activate(bookingId);
      toast.success("Trip started! Vehicle marked as rented.");
      await fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to start trip");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleCompleteTrip = async (bookingId: number) => {
    setActionLoadingId(bookingId);
    try {
      await bookingsApi.complete(bookingId);
      toast.success("Trip completed & booking finalized!");
      await fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to complete trip");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  // ✅ LIFECYCLE: Cancel with reason (new requirement).
  // Opens a reason-picker modal; sends the selected reason to the backend.
  const handleCancel = async (bookingId: number) => {
    if (!confirmAction("Are you sure you want to cancel this booking?")) return;

    // Simple reason picker (ideally a proper modal component)
    const reasonInput = prompt(
      "Cancellation reason (required):\n" +
      "- client_cancelled (client backed out)\n" +
      "- agency_cancelled (operator voided)\n" +
      "- no_show (client never arrived)\n" +
      "- expired_unpaid (quotation lapsed)"
    );

    if (!reasonInput) {
      toast.error("Cancellation reason is required");
      return;
    }

    // Validate against CancellationReason enum
    const validReasons: CancellationReason[] = [
      "client_cancelled", "agency_cancelled", "no_show", "expired_unpaid"
    ];
    if (!validReasons.includes(reasonInput as CancellationReason)) {
      toast.error("Invalid cancellation reason");
      return;
    }

    setActionLoadingId(bookingId);
    try {
      await bookingsApi.cancel(bookingId, { reason: reasonInput as CancellationReason });
      toast.success("Booking cancelled");
      await fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to cancel booking");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  // ✅ LIFECYCLE: No-show is now a cancel shortcut (reason=no_show).
  // Backend /no-show endpoint still exists as backward-compat alias.
  const handleNoShow = async (bookingId: number) => {
    if (!confirmAction("Mark this booking as a No-Show?")) return;
    setActionLoadingId(bookingId);
    try {
      await bookingsApi.cancel(bookingId, { reason: "no_show" });
      toast.success("Booking marked as No-Show");
      await fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to mark as No-Show");
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  };

  const handleCopyContractLink = async (bookingId: number) => {
    try {
      toast.loading("Fetching contract...", { duration: 1000 });
      
      const contractsData = await contractsApi.list({ booking_id: bookingId });
      
      if (!contractsData || contractsData.length === 0) {
        toast.error("No contract found for this booking. Please confirm it first.");
        setOpenDropdownId(null);
        return;
      }

      const contract = contractsData[0];
      
      let shareUrl = "";
      if (contract.share_token) {
        shareUrl = `${window.location.origin}/contracts/view/${contract.share_token}`;
      } else {
        toast.loading("Generating share link...", { duration: 1000 });
        const res = await contractsApi.generateShareLink(contract.id);
        shareUrl = res.share_token || `${window.location.origin}/contracts/view/${res.share_token}`;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success("Contract link copied to clipboard!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to copy contract link");
    } finally {
      setOpenDropdownId(null);
    }
  };

  return {
    bookings,
    loading, 
    view, 
    setView, 
    search, 
    setSearch, 
    statusFilter, 
    setStatusFilter,
    currentPage, 
    setCurrentPage, 
    filteredBookings, 
    paginatedBookings, 
    totalPages,
    activeCount,
    vaultCount,
    upcomingCount,
    activeTripsCount,
    completedCount,
    actionLoadingId,
    openDropdownId,
    setOpenDropdownId,
    handleConfirm,
    handleStartTrip,
    handleCompleteTrip,
    handleCancel,
    handleNoShow,
    handleCopyContractLink,
    refetch: fetchBookings
  };
}
