// src/lib/collections.ts
export interface VehicleCollection {
  id: string;
  name: string;
  vehicleIds: number[];
  createdAt: number;
}

const KEY = "rg.vehicle.collections.v1";
const EVT = "rg.collections.changed";

function read(): VehicleCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(collections: VehicleCollection[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(collections));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function getCollections(): VehicleCollection[] {
  return read();
}

export function saveCollections(collections: VehicleCollection[]) {
  write(collections);
}

export function createCollection(
  name: string,
  vehicleIds: number[] = []
): VehicleCollection {
  const collections = read();
  const collection: VehicleCollection = {
    id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    vehicleIds,
    createdAt: Date.now(),
  };
  write([...collections, collection]);
  return collection;
}

export function updateCollection(
  id: string,
  updates: Partial<Pick<VehicleCollection, "name" | "vehicleIds">>
) {
  const collections = read().map((c) =>
    c.id === id ? { ...c, ...updates } : c
  );
  write(collections);
}

export function deleteCollection(id: string) {
  write(read().filter((c) => c.id !== id));
}

export function addVehiclesToCollection(id: string, vehicleIds: number[]) {
  const collections = read().map((c) => {
    if (c.id !== id) return c;
    const merged = Array.from(new Set([...c.vehicleIds, ...vehicleIds]));
    return { ...c, vehicleIds: merged };
  });
  write(collections);
}

export function removeVehicleFromCollection(id: string, vehicleId: number) {
  const collections = read().map((c) =>
    c.id === id
      ? { ...c, vehicleIds: c.vehicleIds.filter((v) => v !== vehicleId) }
      : c
  );
  write(collections);
}
