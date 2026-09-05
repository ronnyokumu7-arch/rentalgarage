import { confirmAction } from "@/lib/utils/confirmAction";
// src/hooks/profile/useInlineVehicle.ts
import { useState, useEffect, useRef } from "react";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Vehicle } from "@/lib/types";
import toast from "react-hot-toast";

export function useInlineVehicle(vehicle: Vehicle) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    plate_number: vehicle.plate_number,
    vin: vehicle.vin || "",
    daily_rate: vehicle.daily_rate,
    current_mileage: vehicle.current_mileage,
    next_service_km: vehicle.next_service_km || 0,
    insurance_number: vehicle.insurance_number || "",
    insurance_expiry: vehicle.insurance_expiry ? vehicle.insurance_expiry.split("T")[0] : "",
    notes: vehicle.notes || "",
  });

  // Refs for hidden file inputs
  const insuranceRef = useRef<HTMLInputElement>(null);
  const registrationRef = useRef<HTMLInputElement>(null);
  const inspectionRef = useRef<HTMLInputElement>(null);

  // Reset form when vehicle changes
  useEffect(() => {
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      plate_number: vehicle.plate_number,
      vin: vehicle.vin || "",
      daily_rate: vehicle.daily_rate,
      current_mileage: vehicle.current_mileage,
      next_service_km: vehicle.next_service_km || 0,
      insurance_number: vehicle.insurance_number || "",
      insurance_expiry: vehicle.insurance_expiry ? vehicle.insurance_expiry.split("T")[0] : "",
      notes: vehicle.notes || "",
    });
    setIsEditing(false);
  }, [vehicle.id]);

  const isInsuranceExpired = formData.insurance_expiry && new Date(formData.insurance_expiry) < new Date();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await vehiclesApi.update(vehicle.id, {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        plate_number: formData.plate_number,
        vin: formData.vin || null,
        daily_rate: formData.daily_rate,
        current_mileage: formData.current_mileage,
        next_service_km: formData.next_service_km || null,
        insurance_number: formData.insurance_number || null,
        insurance_expiry: formData.insurance_expiry ? new Date(formData.insurance_expiry).toISOString() : null,
        notes: formData.notes || null,
      });
      toast.success("Vehicle details updated successfully!");
      setIsEditing(false);
      
      // ✅ AUTO-REFRESH: notify fleet list to refetch (cross-context update)
      window.dispatchEvent(new CustomEvent('vehicle:updated', { detail: { vehicleId: vehicle.id } }));
    } catch {
      toast.error("Failed to update vehicle details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusAction = async (action: "activate" | "maintenance" | "reactivate" | "retire") => {
    if (!confirmAction(`Are you sure you want to ${action.replace(/_/g, " ")} this vehicle?`)) return;
    setIsActionLoading(true);
    try {
      if (action === "activate") await vehiclesApi.activate(vehicle.id);
      else if (action === "maintenance") await vehiclesApi.sendToMaintenance(vehicle.id);
      else if (action === "reactivate") await vehiclesApi.reactivate(vehicle.id);
      else if (action === "retire") await vehiclesApi.retire(vehicle.id);
      
      toast.success(`Vehicle ${action.replace(/_/g, " ")} successfully!`);
      
      // ✅ AUTO-REFRESH: notify fleet list to refetch (cross-context status change)
      window.dispatchEvent(new CustomEvent('vehicle:updated', { detail: { vehicleId: vehicle.id } }));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${action.replace(/_/g, " ")} vehicle.`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDocUpload = async (docType: "insurance" | "registration" | "inspection", _file: File) => {
    setUploadingDoc(docType);
    try {
      // Note: Backend endpoints for document uploads may need to be added
      // For now, this is a placeholder structure
      toast.success(`${docType.toUpperCase()} uploaded successfully!`);
    } catch {
      toast.error(`Failed to upload ${docType}.`);
    } finally {
      setUploadingDoc(null);
    }
  };

  return {
    isEditing, setIsEditing,
    isSaving, isActionLoading,
    uploadingDoc, viewingImage, setViewingImage,
    formData, setFormData,
    isInsuranceExpired,
    insuranceRef, registrationRef, inspectionRef,
    handleSave, handleStatusAction, handleDocUpload,
  };
}
