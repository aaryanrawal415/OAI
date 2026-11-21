import type { LatLng, TruckInput } from "../api/types";
import { isInsideIndia } from "./geo";

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function passwordProblem(value: string): string | null {
  if (value.length < 8) return "Use at least 8 characters.";
  return null;
}

export function truckProblems(truck: TruckInput): string[] {
  const out: string[] = [];
  if (!(truck.available_payload_kg > 0)) out.push("Available payload must be above 0 kg.");
  if (truck.available_payload_kg > truck.max_payload_kg) {
    out.push(`Available payload cannot be more than the truck's maximum of ${truck.max_payload_kg} kg.`);
  }
  if (!isInsideIndia(truck.location)) out.push("The truck location must be inside India.");
  if (Number.isNaN(Date.parse(truck.available_from))) out.push("Choose when the truck is available.");
  return out;
}

export interface PlaceDraft {
  hub: string; // a hub id, or "custom"
  name: string;
  lat: string;
  lng: string;
}

export interface ManualDraft {
  title: string;
  category: string;
  weight: string;
  rate: string;
  pickup: PlaceDraft;
  drop: PlaceDraft;
  windowStart: string;
  windowEnd: string;
}

export type ManualErrors = Partial<Record<"title" | "category" | "weight" | "rate" | "pickup" | "drop" | "window", string>>;

export function parsePoint(draft: PlaceDraft): LatLng | null {
  const lat = Number(draft.lat);
  const lng = Number(draft.lng);
  if (draft.lat.trim() === "" || draft.lng.trim() === "" || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function manualProblems(d: ManualDraft): ManualErrors {
  const errors: ManualErrors = {};
  if (d.title.trim().length < 3) errors.title = "Describe the load in a few words.";
  if (!d.category) errors.category = "Choose a cargo category.";
  const weight = Number(d.weight);
  if (d.weight.trim() === "" || !Number.isFinite(weight) || weight <= 0) errors.weight = "Weight must be above 0 kg.";
  if (d.rate.trim() !== "") {
    const rate = Number(d.rate);
    if (!Number.isFinite(rate) || rate < 0) errors.rate = "Payment cannot be negative.";
  }
  const pickup = parsePoint(d.pickup);
  const drop = parsePoint(d.drop);
  if (!pickup || !isInsideIndia(pickup)) errors.pickup = "Enter a pickup location inside India.";
  if (!drop || !isInsideIndia(drop)) errors.drop = "Enter a drop location inside India.";
  if (pickup && drop && pickup.lat === drop.lat && pickup.lng === drop.lng) {
    errors.drop = "Pickup and drop cannot be the same place.";
  }
  if (d.windowStart && d.windowEnd && new Date(d.windowEnd) <= new Date(d.windowStart)) {
    errors.window = "The window must end after it starts.";
  }
  return errors;
}
