import type { BodyType } from "../api/types";

// Mirrors data/reference/*.csv. All values are provisional placeholders until sourced.

export interface VehicleClass {
  id: string;
  name: string;
  bodyTypes: BodyType[];
  payloadMaxKg: number;
  volumeM3: number | null;
  mileageKmPerL: number;
}

export const VEHICLE_CLASSES: VehicleClass[] = [
  { id: "lcv_pickup", name: "Light commercial pickup", bodyTypes: ["open_body", "closed_body"], payloadMaxKg: 1500, volumeM3: 8, mileageKmPerL: 12 },
  { id: "icv_truck", name: "Intermediate commercial truck", bodyTypes: ["open_body", "closed_body"], payloadMaxKg: 7000, volumeM3: 30, mileageKmPerL: 7.5 },
  { id: "hcv_6wheel", name: "Heavy rigid truck (2 axle)", bodyTypes: ["open_body", "closed_body"], payloadMaxKg: 12000, volumeM3: 45, mileageKmPerL: 5 },
  { id: "hcv_10wheel", name: "Heavy rigid truck (3 axle)", bodyTypes: ["open_body", "closed_body"], payloadMaxKg: 21000, volumeM3: 60, mileageKmPerL: 4 },
  { id: "hcv_multi_axle", name: "Multi-axle heavy truck", bodyTypes: ["open_body", "closed_body"], payloadMaxKg: 30000, volumeM3: 70, mileageKmPerL: 3.3 },
  { id: "trailer_flatbed", name: "Tractor-trailer flatbed", bodyTypes: ["flatbed_trailer"], payloadMaxKg: 30000, volumeM3: null, mileageKmPerL: 3 },
  { id: "trailer_container", name: "Tractor-trailer container carrier", bodyTypes: ["container_carrier"], payloadMaxKg: 29000, volumeM3: null, mileageKmPerL: 3 },
  { id: "tanker", name: "Tanker truck", bodyTypes: ["tanker"], payloadMaxKg: 25000, volumeM3: 35, mileageKmPerL: 4 },
  { id: "reefer", name: "Refrigerated truck", bodyTypes: ["reefer"], payloadMaxKg: 12000, volumeM3: 45, mileageKmPerL: 5 },
  { id: "tipper", name: "Tipper truck", bodyTypes: ["tipper"], payloadMaxKg: 25000, volumeM3: 18, mileageKmPerL: 4 },
];

export const BODY_LABEL: Record<BodyType, string> = {
  open_body: "Open body",
  closed_body: "Closed body",
  flatbed_trailer: "Flatbed trailer",
  container_carrier: "Container carrier",
  tanker: "Tanker",
  reefer: "Refrigerated",
  tipper: "Tipper",
};

export interface CargoCategory {
  id: string;
  name: string;
}

export const CARGO_CATEGORIES: CargoCategory[] = [
  { id: "fmcg_packaged", name: "Packaged consumer goods" },
  { id: "steel_coils_sections", name: "Steel coils, bars and sections" },
  { id: "cement_bags", name: "Bagged cement" },
  { id: "building_materials", name: "Tiles, bricks and pipes" },
  { id: "auto_parts", name: "Automotive parts and components" },
  { id: "machinery_heavy", name: "Industrial machinery" },
  { id: "container_20ft", name: "20 ft container" },
  { id: "container_40ft", name: "40 ft container" },
  { id: "agri_grain_bags", name: "Bagged grain and pulses" },
  { id: "fresh_produce", name: "Fresh fruit and vegetables" },
  { id: "frozen_pharma", name: "Frozen and pharmaceutical goods" },
  { id: "chemicals_packaged_hazardous", name: "Packaged hazardous chemicals" },
  { id: "liquid_bulk", name: "Liquid bulk" },
  { id: "textiles_garments", name: "Textiles and garments" },
  { id: "furniture_household", name: "Furniture and household goods" },
  { id: "ecommerce_parcels", name: "E-commerce parcels" },
  { id: "over_dimensional_project", name: "Over-dimensional project cargo" },
  { id: "bulk_aggregates_coal", name: "Bulk aggregates and coal" },
];

export function categoryName(id: string): string {
  return CARGO_CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export interface HubOption {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// A subset of data/reference/hubs.csv (coordinates are approximate).
export const HUB_OPTIONS: HubOption[] = [
  { id: "delhi_okhla", name: "Okhla Industrial Area, Delhi", lat: 28.53, lng: 77.27 },
  { id: "gurugram_manesar", name: "Manesar, Haryana", lat: 28.35, lng: 76.94 },
  { id: "jaipur_sitapura", name: "Sitapura, Jaipur", lat: 26.78, lng: 75.84 },
  { id: "ahmedabad_vatva", name: "Vatva, Ahmedabad", lat: 22.97, lng: 72.65 },
  { id: "vadodara_makarpura", name: "Makarpura, Vadodara", lat: 22.25, lng: 73.17 },
  { id: "surat_sachin", name: "Sachin, Surat", lat: 21.09, lng: 72.87 },
  { id: "bhiwandi", name: "Bhiwandi warehouse cluster", lat: 19.3, lng: 73.06 },
  { id: "jnpt", name: "JNPT (Nhava Sheva)", lat: 18.95, lng: 72.95 },
  { id: "pune_chakan", name: "Chakan, Pune", lat: 18.76, lng: 73.86 },
  { id: "bengaluru_peenya", name: "Peenya, Bengaluru", lat: 13.03, lng: 77.52 },
  { id: "nagpur_butibori", name: "Butibori, Nagpur", lat: 20.97, lng: 78.98 },
  { id: "hyderabad_patancheru", name: "Patancheru, Hyderabad", lat: 17.53, lng: 78.27 },
  { id: "chennai_ambattur", name: "Ambattur, Chennai", lat: 13.1, lng: 80.15 },
];
