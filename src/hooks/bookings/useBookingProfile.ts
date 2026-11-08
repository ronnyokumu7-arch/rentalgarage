// src/hooks/bookings/useBookingProfile.ts
"use client";
import { useState, useEffect, useCallback } from  "react";
import { useParams, useRouter } from  "next/navigation";
import toast from  "react-hot-toast";
import { bookingsApi } from  "@/lib/api/bookings";
import { clientsApi } from  "@/lib/api/clients";
import { vehiclesApi } from  "@/lib/api/vehicles";
import { contractsApi } from  "@/lib/api/contracts";
import type { Booking, Client, Vehicle, Contract } from  "@/lib/types";
export type ConfirmActionType = "confirm" | "activate" | "cancel" | null;
export function useBookingProfile() {
const params = useParams();
const router = useRouter();
const bookingId = Number(params.id);
const [booking, setBooking] = useState<Booking | null>(null);
const [client, setClient] = useState<Client | null>(null);
const [vehicle, setVehicle] = useState<Vehicle | null>(null);
const [contract, setContract] = useState<Contract | null>(null);
const [loading, setLoading] = useState(true);
const [isActionLoading, setIsActionLoading] = useState(false);
const [showClientModal, setShowClientModal] = useState(false);
const [showVehicleModal, setShowVehicleModal] = useState(false);
const [showShareModal, setShowShareModal] = useState(false);
const [showContractDrawer, setShowContractDrawer] = useState(false);
const [shareMethod, setShareMethod] = useState<"email" | "whatsapp" | "">("");
const [confirmAction, setConfirmAction] = useState<ConfirmActionType>(null);
const [tripDates, setTripDates] = useState({ start: "", end: "" });
const [destination, setDestination] = useState("");
const [availableClients, setAvailableClients] = useState<Client[]>([]);
const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
const [isTripEnded, setIsTripEnded] = useState(false);
const [showMileageModal, setShowMileageModal] = useState(false);
const [finalMileage, setFinalMileage] = useState(0);
const [quotationUrl, setQuotationUrl] = useState<string | null>(null);
const [showQuotationModal, setShowQuotationModal] = useState(false);
const fetchData = useCallback(async () => {
if (!bookingId) return;
setLoading(true);
try {
const bookingData = await bookingsApi.getById(bookingId);
setBooking(bookingData);
setTripDates({
start: bookingData.start_date.split("T")[0],
end: bookingData.end_date.split("T")[0],
});
setDestination(bookingData.destination || "");
// ✅ FIXED: Changed getById to get to match API client methods
const [clientData, vehicleData] = await Promise.all([
  clientsApi.get(bookingData.client_id),
  vehiclesApi.get(bookingData.vehicle_id),
]);
setClient(clientData);
setVehicle(vehicleData);
try {
  const contractsData = await contractsApi.list({ booking_id: bookingId });
  setContract(contractsData.length > 0 ? contractsData[0] : null);
} catch (e) {
  console.warn("Contract fetch failed", e);
  setContract(null);
}
} catch (error: any) {
toast.error(error.response?.data?.detail || "Failed to load booking");
} finally {
setLoading(false);
}
}, [bookingId]);
useEffect(() => { fetchData(); }, [fetchData]);
useEffect(() => {
if (showClientModal) clientsApi.list().then(setAvailableClients);
if (showVehicleModal) {
vehiclesApi.list().then((data) =>
setAvailableVehicles(data.filter((v) => v.status === "available" || v.id === booking?.vehicle_id))
);
}
}, [showClientModal, showVehicleModal, booking?.vehicle_id]);
const handleSaveTripChanges = async () => {
if (!booking) return;
setIsActionLoading(true);
try {
await bookingsApi.update(booking.id, {
start_date: new Date(tripDates.start).toISOString(),
end_date: new Date(tripDates.end).toISOString(),
destination,
});
toast.success("Trip logistics updated");
fetchData();
} catch (error: any) {
toast.error(error.response?.data?.detail || "Failed to update trip");
} finally {
setIsActionLoading(false);
}
};
const handleChangeClient = async (newClientId: number) => {
if (!booking) return;
setIsActionLoading(true);
try {
await bookingsApi.update(booking.id, { client_id: newClientId });
toast.success("Client updated");
setShowClientModal(false);
fetchData();
} catch (error: any) {
toast.error(error.response?.data?.detail || "Failed to update client");
} finally {
setIsActionLoading(false);
}
};
const handleChangeVehicle = async (newVehicleId: number) => {
if (!booking) return;
setIsActionLoading(true);
try {
await bookingsApi.update(booking.id, { vehicle_id: newVehicleId });
toast.success("Vehicle updated");
setShowVehicleModal(false);
fetchData();
} catch (error: any) {
toast.error(error.response?.data?.detail || "Failed to update vehicle");
} finally {
setIsActionLoading(false);
}
};
const handleStatusTransition = async () => {
if (!booking || !confirmAction) return;
setIsActionLoading(true);
try {
await bookingsApi.transitionStatus(booking.id, confirmAction);
toast.success(`Booking ${confirmAction}ed successfully`);
setConfirmAction(null);
fetchData();
} catch (error: any) {
toast.error(error.response?.data?.detail || `Failed to ${confirmAction} booking`);
} finally {
setIsActionLoading(false);
}
};
const handleCopyContractLink = async () => {
if (!contract) return toast.error("No contract found");
try {
let shareToken = contract.share_token;
if (!shareToken) {
toast.loading("Generating share link...", { duration: 1000 });
const res = await contractsApi.generateShareLink(contract.id);
shareToken = res.share_token;
setContract({ ...contract, share_token: shareToken });
}
const shareUrl = `${window.location.origin}/contract/${shareToken}`;
await navigator.clipboard.writeText(shareUrl);
toast.success("Contract link copied!");
} catch (error: any) {
toast.error(error.response?.data?.detail || "Failed to generate link");
}
};
const handleSendInvoice = async () => {
toast.success(`Invoice sent via ${shareMethod}`);
setShowShareModal(false);
setShareMethod("");
};
const handleStageEndTrip = () => {
setIsTripEnded(true);
toast.success("Trip ended. Please record the final mileage to complete the booking.");
};
const handleOpenMileageModal = () => {
setFinalMileage(vehicle?.current_mileage || 0);
setShowMileageModal(true);
};
const handleSaveFinalMileage = async () => {
if (!vehicle || !booking) return;
if (finalMileage < (vehicle.current_mileage || 0)) {
return toast.error("Final mileage cannot be less than the current mileage.");
}
setIsActionLoading(true);
try {
  await vehiclesApi.update(vehicle.id, { current_mileage: finalMileage } as any);
  await bookingsApi.transitionStatus(booking.id, "complete");
  toast.success("Mileage updated & Booking Completed!");
  setShowMileageModal(false);
  setIsTripEnded(false);
  fetchData();
} catch (error: any) {
  toast.error(error.response?.data?.detail || "Failed to complete trip");
} finally {
  setIsActionLoading(false);
}
};
const handleGenerateQuotation = async () => {
if (!booking) return;
setIsActionLoading(true);
try {
const result = await bookingsApi.generateQuotation(booking.id);
setQuotationUrl(result.share_url);
setShowQuotationModal(true);
toast.success("Quotation generated!");
fetchData();
} catch (error: any) {
toast.error(error.response?.data?.detail || "Failed to generate quotation");
} finally {
setIsActionLoading(false);
}
};
const handleCopyQuotationLink = async () => {
if (!quotationUrl) return;
await navigator.clipboard.writeText(quotationUrl);
toast.success("Quotation link copied!");
};
return {
bookingId, booking, client, vehicle, contract, loading, router,
tripDates, setTripDates, destination, setDestination,
showClientModal, setShowClientModal, showVehicleModal, setShowVehicleModal,
showShareModal, setShowShareModal, showContractDrawer, setShowContractDrawer,
shareMethod, setShareMethod, confirmAction, setConfirmAction,
availableClients, availableVehicles, isActionLoading,
fetchData, handleSaveTripChanges, handleChangeClient, handleChangeVehicle,
handleStatusTransition, handleCopyContractLink, handleSendInvoice,
isTripEnded, showMileageModal, finalMileage, setFinalMileage,
setShowMileageModal, handleStageEndTrip, handleOpenMileageModal, handleSaveFinalMileage,
quotationUrl, showQuotationModal, setShowQuotationModal,
handleGenerateQuotation, handleCopyQuotationLink,
};
}
