// src/components/fleet/mobile/types.ts
import type { Vehicle } from "@/lib/types";

export interface FleetCallbacks {
  onVehicleClick: (vehicle: Vehicle) => void;
  onTouchStart: (vehicle: Vehicle) => (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export interface FleetSectionData {
  collection: { id: string; name: string; vehicleIds: number[] } | null;
  vehicles: Vehicle[];
}
