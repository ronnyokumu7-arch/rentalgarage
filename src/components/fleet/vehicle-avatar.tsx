// src/components/fleet/vehicle-avatar.tsx
"use client";

import { Car, Truck, Van, Motorcycle, CarProfile } from "@phosphor-icons/react";
import type { Vehicle } from "@/lib/types";

type BodyType =
  | "sedan" | "suv" | "pickup" | "van" | "bus"
  | "motorcycle" | "coupe" | "hatchback" | "truck";

/** Body-type → icon, used only when there is no real photo. */
const BODY_TYPE_ICONS: Record<BodyType, React.ElementType> = {
  sedan: Car,
  coupe: Car,
  hatchback: Car,
  suv: Car,
  pickup: Truck,
  truck: Truck,
  van: Van, // Phosphor's Van icon is a great fit for cargo/passenger vans
  bus: Van, // Using Van for bus as Phosphor doesn't have a dedicated Bus icon
  motorcycle: Motorcycle,
};

/**
 * Placeholder shown when there is neither a real photo nor a
 * recognizable body type. This is the ultimate fallback.
 */
const PLACEHOLDER_ICON: React.ElementType = CarProfile;

const BODY_TYPE_PATTERNS: Array<[BodyType, RegExp]> = [
  ["motorcycle", /\b(motorcycle|motorbike|bike|scooter|boda|tuktuk|tuk[- ]?tuk)\b/],
  ["truck", /\b(truck|lorry|tipper|trailer|lorries|tractor|prime mover)\b/],
  ["pickup", /\b(pickup|pick-up|hilux|ranger|navara|d-max|amarok|tundra|f-?150)\b/],
  ["bus", /\b(bus|coaster|rosa|matatu|coach)\b/],
  ["van", /\b(van|hiace|caravan|urvan|transit|sprinter|nv350|kangoo|probox)\b/],
  ["suv", /\b(suv|prado|land ?cruiser|landcruiser|land ?rover|x[1-7]|q[3-8]|rav-?4|cr-?v|tucson|santa ?fe|fortuner|harrier|murano|patrol|sequoia|4runner|hilux ?surf)\b/],
  ["coupe", /\b(coupe|coupé|convertible|cabriolet|roadster|gt-?r)\b/],
  ["hatchback", /\b(hatchback|hatch|fit|vitz|yaris|swift|demio|march|note|picanto|golf|polo|i20)\b/],
  ["sedan", /\b(sedan|saloon|corolla|premio|axio|allion|mark ?x|camry|accord|civic|mazda ?3|mazda ?6|passat|benz|e-?class|c-?class|5-?series|3-?series|lexus|impreza|legacy|teana)\b/],
];

function inferBodyType(vehicle: Vehicle): BodyType | null {
  const haystack = `${vehicle.make ?? ""} ${vehicle.model ?? ""}`.toLowerCase();
  for (const [bodyType, pattern] of BODY_TYPE_PATTERNS) {
    if (pattern.test(haystack)) return bodyType;
  }
  return null;
}

/**
 * Returns the real photo URL for a vehicle, or null if there isn't one.
 * STUB: the Vehicle type currently has no image field. When the backend
 * adds e.g. `image_url`, return `vehicle.image_url ?? null` here — this
 * is the only place that needs to change.
 */
function getVehicleImageUrl(_vehicle: Vehicle): string | null {
  return null;
}

/**
 * Resolves what to render for a vehicle's avatar:
 *   1. real image, if one exists
 *   2. body-type icon, if the type is recognizable
 *   3. CarProfile placeholder otherwise
 */
export function getVehicleBodyIcon(vehicle: Vehicle): React.ElementType {
  // (1) is handled by the caller when a URL exists; this helper only
  // deals with the icon path (2) and (3).
  const hasImage = getVehicleImageUrl(vehicle) !== null;
  if (hasImage) return Car; // unused in practice; caller renders <img>

  const bodyType = inferBodyType(vehicle);
  return (bodyType && BODY_TYPE_ICONS[bodyType]) || PLACEHOLDER_ICON;
}

export { getVehicleImageUrl, PLACEHOLDER_ICON };
