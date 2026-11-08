"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Archive,
  ArchiveRestore,
  Trash2,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";

import { vehiclesApi } from "@/lib/api/vehicles";
import { bookingsApi } from "@/lib/api/bookings";
import type { Vehicle, VehicleStatus, VehicleUpdatePayload, Booking } from "@/lib/types";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import QuickGarageModal from "@/components/ui/QuickGarageModal";

// NEW: Import split components
import VehicleHeroSection from "@/components/vehicle/VehicleHeroSection";
import VehicleCockpitGrid from "@/components/vehicle/VehicleCockpitGrid";
import VehicleBookingsTab from "@/components/vehicle/VehicleBookingsTab";

const statusColors: Record<VehicleStatus, "success" | "accent" | "warning" | "neutral"> = {
  available: "success", rented: "accent", maintenance: "warning", retired: "neutral",
};

export default function VehicleProfilePage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = Number(params.id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [garageModalOpen, setGarageModalOpen] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    open: boolean; title: string; message: string; variant: "danger" | "warning" | "info" | "success"; onConfirm: () => void;
  }>({ open: false, title: "", message: "", variant: "danger", onConfirm: () => {} });

  // FIX: Reset state immediately when ID changes
  useEffect(() => {
    setVehicle(null);
    setBookings([]);
    setLoading(true);
  }, [vehicleId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vehicleData, bookingsData] = await Promise.all([
        vehiclesApi.get(vehicleId),
        bookingsApi.list({ vehicle_id: vehicleId })
      ]);
      setVehicle(vehicleData);
      setBookings(bookingsData);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    if (vehicleId) fetchData();
  }, [fetchData, vehicleId]);

  const handleGarageSave = async (data: VehicleUpdatePayload) => {
    try {
      await vehiclesApi.update(vehicleId, data);
      toast.success("Vehicle updated successfully");
      setGarageModalOpen(false);
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update vehicle");
    }
  };

  const handleStatusAction = async (action: "archive" | "restore" | "delete") => {
    try {
      if (action === "delete") await vehiclesApi.update(vehicleId, { status: "retired" } as any);
      if (action === "restore") await vehiclesApi.update(vehicleId, { status: "available" } as any);
      if (action === "delete") {
        toast.error("Delete functionality not implemented for vehicles yet.");
        return;
      }
      toast.success(`Vehicle ${action}d successfully`);
      if (action === "archive") router.push("/dashboard/fleet");
      else await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${action} vehicle`);
    }
  };

  const confirmAction = (title: string, message: string, variant: "danger" | "warning" | "info" | "success", onConfirm: () => void) => {
    setConfirmState({ open: true, title, message, variant, onConfirm });
  };

  // Stats Calculation
  const stats = (() => {
    if (!vehicle || bookings.length === 0) return { totalRevenue: 0, totalDaysBooked: 0, utilizationRate: 0 };
    const activeBookings = bookings.filter(b => !["cancelled", "no_show"].includes(b.status));
    const totalRevenue = activeBookings.reduce((sum, b) => sum + b.total_amount, 0);
    const totalDaysBooked = activeBookings.reduce((sum, b) => {
      const days = Math.ceil((new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(1, days);
    }, 0);
    const daysSinceCreation = Math.max(1, (Date.now() - new Date(vehicle.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const utilizationRate = (totalDaysBooked / daysSinceCreation) * 100;
    return { totalRevenue, totalDaysBooked, utilizationRate };
  })();

  if (loading) return <div className="flex justify-center min-h-[400px]">Loading...</div>;
  if (!vehicle) return null;

  return (
    <div className="space-y-4 pb-20 bg-slate-50/50">
      {/* Back Button */}
      <button onClick={() => router.push("/dashboard/fleet")} className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={14} /> Back to Fleet
      </button>

      {/* 1. Hero Section */}
      <VehicleHeroSection vehicle={vehicle} stats={stats} />

      {/* 2. Cockpit Grid */}
      <VehicleCockpitGrid vehicle={vehicle} />

      {/* 3. Bookings Tab */}
      <VehicleBookingsTab vehicleId={vehicleId} />

      {/* 4. Action Bar (Unchanged as requested) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 p-1.5 flex items-center gap-1.5 z-40">
        <button onClick={() => setGarageModalOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all">
          <Wrench size={14} /> Quick Garage
        </button>
        <button onClick={() => setEditModalOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors">
          <Edit2 size={14} /> Edit Details
        </button>
        {!vehicle.is_archived && (
          <button onClick={() => confirmAction("Archive Vehicle", "Archive this vehicle?", "info", () => handleStatusAction("archive"))} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors">
            <Archive size={14} /> Archive
          </button>
        )}
        {vehicle.is_archived && (
          <>
            <button onClick={() => confirmAction("Restore Vehicle", "Restore this vehicle?", "info", () => handleStatusAction("restore"))} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors">
              <ArchiveRestore size={14} /> Restore
            </button>
            <button onClick={() => confirmAction("Delete Vehicle", "Permanently delete this vehicle?", "danger", () => handleStatusAction("delete"))} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-red-700 hover:bg-red-50 transition-colors">
              <Trash2 size={14} /> Delete
            </button>
          </>
        )}
      </div>

      {/* Modals */}
      <QuickGarageModal vehicle={vehicle} open={garageModalOpen} onClose={() => setGarageModalOpen(false)} onSave={handleGarageSave} />
      
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Vehicle Details" subtitle="Update core information" icon={Edit2} size="md">
        <EditVehicleForm vehicle={vehicle} onSave={async (data) => {
          try { await vehiclesApi.update(vehicleId, data); toast.success("Details updated"); setEditModalOpen(false); await fetchData(); } 
          catch (e: any) { toast.error(e.response?.data?.detail || "Failed to update"); }
        }} onClose={() => setEditModalOpen(false)} />
      </Modal>

      <ConfirmDialog open={confirmState.open} onClose={() => setConfirmState({ ...confirmState, open: false })} onConfirm={() => { confirmState.onConfirm(); setConfirmState({ ...confirmState, open: false }); }} title={confirmState.title} message={confirmState.message} variant={confirmState.variant} confirmLabel="Confirm" />
    </div>
  );
}

// Internal Edit Form (kept minimal)
function EditVehicleForm({ vehicle, onSave, onClose }: { vehicle: Vehicle; onSave: (data: any) => void; onClose: () => void }) {
  const [formData, setFormData] = useState({ make: vehicle.make, model: vehicle.model, year: vehicle.year, plate_number: vehicle.plate_number, vin: vehicle.vin || "", daily_rate: vehicle.daily_rate, notes: vehicle.notes || "" });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Make"><Input value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value})} required /></FormGroup>
        <FormGroup label="Model"><Input value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} required /></FormGroup>
        <FormGroup label="Year"><Input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})} required /></FormGroup>
        <FormGroup label="Plate"><Input value={formData.plate_number} onChange={(e) => setFormData({...formData, plate_number: e.target.value})} required /></FormGroup>
        <FormGroup label="VIN"><Input value={formData.vin} onChange={(e) => setFormData({...formData, vin: e.target.value})} /></FormGroup>
        <FormGroup label="Daily Rate"><Input type="number" value={formData.daily_rate} onChange={(e) => setFormData({...formData, daily_rate: parseFloat(e.target.value)})} required /></FormGroup>
      </div>
      <FormGroup label="Notes"><textarea className="input w-full" rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></FormGroup>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
      </div>
    </form>
  );
}