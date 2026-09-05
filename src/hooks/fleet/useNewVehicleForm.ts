// src/hooks/fleet/useNewVehicleForm.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { VehicleCreate } from "@/lib/types";

export const CAR_DATA: Record<string, string[]> = {
  Toyota: ["Filder", "Axio", "RAV4", "Vanguard", "Prado", "Hilux", "Corolla", "Harrier", "Land Cruiser V8", "Noah", "Voxy", "Alphard", "Vellfire"],
  Nissan: ["X-Trail", "Navara", "Patrol", "Note", "Sunny", "Juke", "Kicks", "Serena"],
  Honda: ["Civic", "CR-V", "Accord", "Fit", "HR-V", "Vezel", "Stepwgn", "Spada"],
  Mazda: ["CX-5", "CX-3", "CX-8", "Demio", "Axela", "Atenza", "Verisa"],
  Subaru: ["Forester", "Impreza", "Outback", "XV", "Legacy"],
  Mitsubishi: ["Pajero", "Outlander", "L200", "Eclipse Cross", "Canter"],
  Volkswagen: ["Golf", "Polo", "Tiguan", "Passat", "Amarok", "Caddy"],
  Ford: ["Ranger", "Everest", "Focus", "Fiesta", "Transit"],
  Mercedes: ["C-Class", "E-Class", "G-Wagon", "GLC", "GLE", "Sprinter"],
  BMW: ["3 Series", "5 Series", "X3", "X5", "X1", "X7"],
  Hyundai: ["Tucson", "Santa Fe", "Elantra", "i10", "Creta", "H1"],
  Kia: ["Sportage", "Sorento", "Picanto", "Rio", "Seltos", "Carnival"],
  Suzuki: ["Swift", "Vitara", "Jimny", "Alto", "Celerio"],
  Isuzu: ["D-Max", "MU-X", "N-Series", "F-Series"],
  LandRover: ["Defender", "Discovery", "Range Rover", "Evoque", "Freelander"],
  Renault: ["Koleos", "Duster", "Kadja", "Kiger"]
};

export const currentYear = new Date().getFullYear();
export const YEARS = Array.from({ length: currentYear - 2013 + 1 }, (_, i) => currentYear - i);

export function useNewVehicleForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [registrationFile, setRegistrationFile] = useState<File | null>(null);
  const [inspectionFile, setInspectionFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    make: "", model: "", year: "", plate_number: "", vin: "",
    daily_rate: "", current_mileage: "", next_service_km: "",
    insurance_number: "", insurance_expiry: "", notes: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "make") updated.model = "";
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.make || !formData.model || !formData.year || !formData.plate_number || !formData.daily_rate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload: VehicleCreate = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year) || currentYear,
        plate_number: formData.plate_number,
        vin: formData.vin || null,
        daily_rate: parseFloat(formData.daily_rate) || 0,
        current_mileage: formData.current_mileage ? parseInt(formData.current_mileage) : 0,
        next_service_km: formData.next_service_km ? parseInt(formData.next_service_km) : null,
        insurance_number: formData.insurance_number || null,
        insurance_expiry: formData.insurance_expiry ? new Date(formData.insurance_expiry).toISOString() : null,
        notes: formData.notes || null,
      };

      const newVehicle = await vehiclesApi.create(payload);
      toast.success("Vehicle added to fleet successfully!");
      
      // ✅ AUTO-REFRESH: notify fleet list to refetch (new vehicle appears instantly)
      window.dispatchEvent(new CustomEvent('vehicle:created'));

      const uploadPromises = [];
      if (insuranceFile) uploadPromises.push(vehiclesApi.uploadInsuranceDoc(newVehicle.id, insuranceFile));
      if (registrationFile) uploadPromises.push(vehiclesApi.uploadRegistrationDoc(newVehicle.id, registrationFile));
      if (inspectionFile) uploadPromises.push(vehiclesApi.uploadInspectionDoc(newVehicle.id, inspectionFile));

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        toast.success("Documents uploaded successfully!");
      }

      router.push("/dashboard/fleet");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading, formData,
    insuranceFile, setInsuranceFile,
    registrationFile, setRegistrationFile,
    inspectionFile, setInspectionFile,
    updateField, handleSubmit,
  };
}
