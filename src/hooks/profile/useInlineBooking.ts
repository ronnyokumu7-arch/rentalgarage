import { confirmAction } from "@/lib/utils/confirmAction";
// src/hooks/profile/useInlineBooking.ts
import { useState, useEffect } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import { contractsApi } from "@/lib/api/contracts";
import { invoicesApi } from "@/lib/api/invoices";
import type { Booking, Client, Vehicle, Contract } from "@/lib/types";
import toast from "react-hot-toast";

export function useInlineBooking(booking: Booking) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [client, setClient] = useState<Client | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [contract, setContract] = useState<Contract | null>(booking.contract || null);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);

  const [formData, setFormData] = useState({
    destination: booking.destination || "",
    pickup_location: booking.pickup_location || "",
    return_location: booking.return_location || "",
    start_date: booking.start_date ? booking.start_date.split("T")[0] : "",
    end_date: booking.end_date ? booking.end_date.split("T")[0] : "",
    daily_rate: Number(booking.daily_rate) || 0,
    total_amount: Number(booking.total_amount) || 0,
    vehicle_id: booking.vehicle_id,
  });

  // ✅ FIX: Added booking.vehicle_id to dependencies
  useEffect(() => {
    if (booking.client_id) clientsApi.get(booking.client_id).then(setClient).catch(console.error);
    if (booking.vehicle_id) vehiclesApi.get(booking.vehicle_id).then(setVehicle).catch(console.error);
    
    if (!booking.contract) {
      contractsApi.list({ booking_id: booking.id }).then((data) => {
        if (data && data.length > 0) setContract(data[0]);
      }).catch(console.error);
    }
  }, [booking.id, booking.vehicle_id]); 

  useEffect(() => {
    if (isEditing) {
      vehiclesApi.list({ include_archived: false }).then((data) => {
        const current = data.find(v => v.id === booking.vehicle_id);
        const others = data.filter(v => v.status === 'available' && v.id !== booking.vehicle_id);
        setAvailableVehicles([current, ...others].filter(Boolean) as Vehicle[]);
      }).catch(console.error);
    }
  }, [isEditing, booking.vehicle_id]);

  useEffect(() => {
    if (formData.start_date && formData.end_date && formData.daily_rate > 0) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > 0) {
        const newTotal = formData.daily_rate * diffDays;
        if (Math.abs(formData.total_amount - newTotal) > 0.01) {
          setFormData(prev => ({ ...prev, total_amount: newTotal }));
        }
      }
    }
  }, [formData.start_date, formData.end_date, formData.daily_rate]);

  const handleVehicleChange = (newVehicleId: number) => {
    const newVehicle = availableVehicles.find(v => v.id === newVehicleId);
    if (newVehicle) {
      setVehicle(newVehicle);
      setFormData(prev => ({
        ...prev,
        vehicle_id: newVehicleId,
        daily_rate: Number(newVehicle.daily_rate)
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await bookingsApi.update(booking.id, {
        destination: formData.destination || null,
        pickup_location: formData.pickup_location || null,
        return_location: formData.return_location || null,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        daily_rate: formData.daily_rate,
        total_amount: formData.total_amount,
        vehicle_id: formData.vehicle_id,
      });
      toast.success("Booking updated successfully!");
      setIsEditing(false);
      
      // ✅ AUTO-REFRESH: notify bookings list to refetch (cross-context update)
      window.dispatchEvent(new CustomEvent('booking:updated'));
    } catch {
      toast.error("Failed to update booking.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAction = async (action: "confirm" | "activate" | "complete" | "cancel" | "no_show") => {
    if (!confirmAction(`Are you sure you want to ${action.replace("_", " ")} this booking?`)) return;
    setIsActionLoading(true);
    try {
      if (action === "confirm") await bookingsApi.confirm(booking.id);
      else if (action === "activate") await bookingsApi.activate(booking.id);
      else if (action === "complete") await bookingsApi.complete(booking.id);
      else if (action === "cancel") await bookingsApi.cancel(booking.id);
      else if (action === "no_show") await bookingsApi.noShow(booking.id);
      toast.success(`Booking ${action.replace("_", " ")} successfully!`);
      
      // ✅ AUTO-REFRESH: notify bookings list to refetch (cross-context status change)
      window.dispatchEvent(new CustomEvent('booking:updated'));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${action.replace("_", " ")} booking.`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSendContract = async (): Promise<string | null> => {
    if (!contract) {
      toast.error("No contract found for this booking.");
      return null;
    }
    try {
      const res = await contractsApi.generateShareLink(contract.id);
      setContract(prev => prev ? { ...prev, status: 'sent' as any, share_token: res.share_token } : null);
      toast.success("Contract link copied to clipboard!");
      
      // ✅ AUTO-REFRESH: notify contracts list (status flipped to 'sent')
      window.dispatchEvent(new CustomEvent('contract:updated'));
      return res.share_token;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to generate contract link.");
      return null;
    }
  };

  const handleSendInvoice = async (): Promise<string | null> => {
    if (!booking.invoices?.[0]) {
      toast.error("No invoice generated yet.");
      return null;
    }
    try {
      const res = await invoicesApi.generateShareLink(booking.invoices[0].id);
      toast.success("Invoice link copied to clipboard!");
      
      // ✅ AUTO-REFRESH: notify invoices list
      window.dispatchEvent(new CustomEvent('invoice:updated'));
      return res.share_token;
    } catch {
      toast.error("Failed to copy invoice link.");
      return null;
    }
  };

  return {
    isEditing, setIsEditing,
    isSaving, isActionLoading,
    formData, setFormData,
    client, vehicle, contract, availableVehicles,
    handleSave, handleAction,
    handleVehicleChange,
    handleSendContract,
    handleSendInvoice,
  };
}
