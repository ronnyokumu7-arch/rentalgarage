import apiClient from "@/lib/api-client";
import type {
  Vehicle,
  VehicleCreatePayload,
  VehicleUpdatePayload,
  VehicleStatus,
  Booking,
} from "@/lib/types";

export interface VehicleListParams {
  include_archived?: boolean;
  status?: VehicleStatus;
}

export const vehiclesApi = {
  list: (params?: VehicleListParams) =>
  apiClient.get<Vehicle[]>("/vehicles", { params }).then((r) => r.data),

  listArchived: () =>
    apiClient.get<Vehicle[]>("/vehicles/archived").then((r) => r.data),

  get: (id: number) =>
    apiClient.get<Vehicle>(`/vehicles/${id}`).then((r) => r.data),

  create: (data: VehicleCreatePayload) =>
    apiClient.post<Vehicle>("/vehicles", data).then((r) => r.data),

  update: (id: number, data: VehicleUpdatePayload) =>
    apiClient.patch<Vehicle>(`/vehicles/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/vehicles/${id}`),

  // Status Transitions
  maintenance: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/maintenance`).then((r) => r.data),

  reactivate: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/reactivate`).then((r) => r.data),

  retire: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/retire`).then((r) => r.data),

  archive: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/archive`).then((r) => r.data),

  restore: (id: number) =>
    apiClient.post<Vehicle>(`/vehicles/${id}/restore`).then((r) => r.data),

  // Related Data
  getBookings: (vehicleId: number) =>
    apiClient
      .get<Booking[]>("/bookings", { params: { vehicle_id: vehicleId } })
      .then((r) => r.data),
};