import apiClient from "@/lib/api-client";
import type { Vehicle, VehicleCreate, VehicleUpdate, Booking, PaginatedResponse } from "@/lib/types";

export interface MileageUpdatePayload {
  current_mileage: number;
  next_service_km?: number | null;
}

export interface InvestorVehicleCreatePayload {
  make: string;
  model: string;
  year: number;
  plate_number: string;
  vin?: string | null;
  expected_lease_rate?: number | null;
  current_mileage?: number;
  next_service_km?: number | null;
  insurance_number?: string | null;
  insurance_expiry?: string | null;
  inspection_doc?: string | null;
  notes?: string | null;
}

// ✅ MATCHES BACKEND: InvestorVehicleAgencyUpdate (app/schemas/vehicle.py)
export interface InvestorVehicleAgencyUpdatePayload {
  daily_rate?: number;
  current_mileage?: number;
  next_service_km?: number | null;
  notes?: string | null;
  supports_airport_transfer?: boolean;
  airport_transfer_base_rate?: number | null;
  supports_wedding_service?: boolean;
  wedding_base_rate?: number | null;
  investor_lease_rate?: number | null;
  lease_rate_type?: string | null;
  lease_rate_locked?: boolean;
}

export const vehiclesApi = {
  list: (params?: { status?: string; page?: number; page_size?: number; include_archived?: boolean }) =>
    apiClient.get<PaginatedResponse<Vehicle>>("/vehicles/", { params }).then((r) => r.data.items),

  listArchived: (params?: { status?: string; page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Vehicle>>("/vehicles/archived", { params }).then((r) => r.data.items),

  get: (id: number) =>
    apiClient.get<Vehicle>(`/vehicles/${id}`).then((r) => r.data),

  create: (data: VehicleCreate) =>
    apiClient.post<Vehicle>("/vehicles", data).then((r) => r.data),

  createInvestorVehicle: (data: InvestorVehicleCreatePayload) =>
    apiClient.post<Vehicle>("/investors/vehicles", data).then((r) => r.data),

  update: (id: number, data: VehicleUpdate) =>
    apiClient.patch<Vehicle>(`/vehicles/${id}`, data).then((r) => r.data),

  // ✅ NEW: Investor-scoped update (uses same PATCH /vehicles/{id} route,
  // but only sends investor-allowed fields; backend dispatches on owner_id)
  updateInvestorVehicle: (id: number, data: InvestorVehicleAgencyUpdatePayload) =>
    apiClient.patch<Vehicle>(`/vehicles/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/vehicles/${id}`),

  activate: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/activate`).then((r) => r.data),

  sendToMaintenance: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/maintenance`).then((r) => r.data),

  reactivate: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/reactivate`).then((r) => r.data),

  retire: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/retire`).then((r) => r.data),

  archive: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/archive`).then((r) => r.data),

  restore: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/restore`).then((r) => r.data),

  getBookings: (vehicleId: number) =>
    apiClient.get<PaginatedResponse<Booking>>("/bookings", { params: { vehicle_id: vehicleId } }).then((r) => r.data.items),

  updateMileage: (id: number, data: MileageUpdatePayload) =>
    apiClient.patch<Vehicle>(`/vehicles/${id}/update-mileage`, data).then((r) => r.data),

  uploadInsuranceDoc: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/vehicles/${id}/upload-insurance`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadRegistrationDoc: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/vehicles/${id}/upload-registration`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadInspectionDoc: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/vehicles/${id}/upload-inspection`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadInvestorInsuranceDoc: (vehicleId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/investors/vehicles/${vehicleId}/upload-insurance`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadInvestorRegistrationDoc: (vehicleId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/investors/vehicles/${vehicleId}/upload-registration`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadInvestorInspectionDoc: (vehicleId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/investors/vehicles/${vehicleId}/upload-inspection`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
