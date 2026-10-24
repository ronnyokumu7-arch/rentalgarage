// src/components/fleet/vehicle-avatar.tsx
"use client";

import { Car, Truck, Van, Motorcycle, CarProfile } from "@phosphor-icons/react";
import brands from "car-brand-logos/brands.json";
import type { Vehicle } from "@/lib/types";

type BodyType =
  | "sedan" | "suv" | "pickup" | "van" | "bus"
  | "motorcycle" | "coupe" | "hatchback" | "truck";

/** Body-type → icon, used only when there is no real photo or brand logo. */
const BODY_TYPE_ICONS: Record<BodyType, React.ElementType> = {
  sedan: Car,
  coupe: Car,
  hatchback: Car,
  suv: Car,
  pickup: Truck,
  truck: Truck,
  van: Van,
  bus: Van,
  motorcycle: Motorcycle,
};

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
 * Returns the CDN URL for a car brand logo based on the vehicle's make.
 * Handles case-insensitivity and trailing whitespace.
 * Returns null if the make isn't in the manifest.
 */
export function getVehicleBrandLogoUrl(vehicle: Vehicle): string | null {
  const rawMake = vehicle.make;
  if (!rawMake) return null;

  const manifest = brands as Record<string, string>;
  const trimmed = rawMake.trim();

  // Exact match first (fast path)
  let logoFile = manifest[trimmed];

  // Case-insensitive fallback
  if (!logoFile) {
    const lower = trimmed.toLowerCase();
    const key = Object.keys(manifest).find((k) => k.toLowerCase() === lower);
    if (key) logoFile = manifest[key];
  }

  if (!logoFile) return null;

  return `https://cdn.jsdelivr.net/gh/vehiclespecs/brand-logos@v1.0.0/${logoFile}`;
}

/**
 * Returns a Phosphor icon component for the vehicle's inferred body type.
 * Used as a fallback when there is no real photo and no brand logo
 * (e.g. in dark mode, or when the make isn't in the brand manifest).
 */
export function getVehicleBodyIcon(vehicle: Vehicle): React.ElementType {
  const bodyType = inferBodyType(vehicle);
  return (bodyType && BODY_TYPE_ICONS[bodyType]) || PLACEHOLDER_ICON;
}

export { PLACEHOLDER_ICON };
