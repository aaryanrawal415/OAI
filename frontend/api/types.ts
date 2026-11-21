// Types for the API contract. They mirror docs/DATA_MODEL.md.
// Unknown values are null, never 0.

export type Verdict = "pass" | "fail" | "unknown";
export type ClaimTag = "fact" | "calculation" | "estimate" | "recommendation" | "ml_estimate";
export type SourceType = "synthetic" | "manual" | "csv_import" | "public_api";
export type RouteClass = "on_route" | "off_route";
export type ListingStatus = "open" | "cancelled" | "expired" | "unavailable";
export type RegistrationAccountType = "client" | "organization_owner" | "driver";
export type UserRole =
  | RegistrationAccountType
  | "cargo_owner"
  | "organization_staff"
  | "organization_manager"
  | "organization_owner"
  | "platform_admin"
  | "admin";
export type ShipmentStatus =
  | "accepted"
  | "heading_to_pickup"
  | "loaded"
  | "in_transit"
  | "delivered"
  | "cancelled";
export type BodyType =
  | "open_body"
  | "closed_body"
  | "flatbed_trailer"
  | "container_carrier"
  | "tanker"
  | "reefer"
  | "tipper";

export interface LatLng {
  lat: number;
  lng: number;
}
export interface Place extends LatLng {
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tier: "basic" | "professional" | "enterprise";
  organization_id?: string;
  organization_name?: string;
}
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "cancelled";
export interface Subscription {
  id: string;
  plan: "basic" | "professional" | "enterprise";
  status: SubscriptionStatus;
  billing_cycle: "monthly" | "annual";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}
export interface AuthSession {
  token: string;
  user: User;
}

export interface TruckInput {
  vehicle_class: string;
  body_type: BodyType;
  max_payload_kg: number;
  available_payload_kg: number;
  available_volume_m3: number | null;
  location: Place;
  available_from: string; // ISO 8601 date-time
  handling_equipment: string[];
}

export interface FleetDriver {
  id: string;
  name: string;
  email: string;
  created_at: string;
}
export type FleetDriverInput = Omit<FleetDriver, "id" | "created_at">;

export interface FleetContainer {
  id: string;
  registration_number: string;
  truck: TruckInput;
  driver_id: string | null;
  created_at: string;
}
export type FleetContainerInput = Omit<FleetContainer, "id" | "created_at">;

export interface ShipmentAssignment {
  driver_id: string | null;
  container_id: string | null;
}

export interface RouteInfo {
  id: string;
  corridor_id: string;
  name: string;
  origin: Place;
  destination: Place;
  polyline: LatLng[];
  distance_km: number;
  baseline_driving_minutes: number;
  verified: boolean; // true only when measured by a real road-network engine
  version: number;
}

export interface TripCaps {
  max_jobs_total: number;
  max_jobs_per_day: number | null;
  band_label: string;
}

export interface BudgetStatus {
  multiplier: number;
  distance_limit_km: number; // extra distance allowed over the whole trip
  time_limit_minutes: number; // extra active minutes allowed over the whole trip
  distance_used_fraction: number | null;
  time_used_fraction: number | null;
}

export interface CheckResult {
  rule_code: string;
  label: string;
  verdict: Verdict;
  value: string | number | null;
  threshold: string | number | null;
  unit: string | null;
  claim_tag: ClaimTag;
  message: string;
}

export interface Claim {
  text: string;
  tag: ClaimTag;
}

export interface Money3 {
  low: number | null;
  expected: number | null;
  high: number | null;
}

export interface LoadPoint {
  km: number;
  load_kg: number;
}

export interface TimelineStop {
  label: string;
  arrival: string; // ISO
  window_start: string | null;
  window_end: string | null;
}

export interface Candidate {
  id: string;
  title: string;
  category: string;
  category_label: string;
  weight_kg: number | null;
  is_bundle: boolean;
  bundle_size: number;
  source_type: SourceType;
  listing_status: ListingStatus;
  pickup: Place;
  drop: Place;
  pickup_at_km: number;
  drop_at_km: number;
  route_class: RouteClass;
  pickup_excursion_km: number | null;
  drop_excursion_km: number | null;
  extra_distance_km: number | null;
  extra_active_minutes: number | null;
  revenue_inr: number | null;
  incremental_cost_inr: number | null;
  net_inr: Money3;
  checks: CheckResult[];
  eligible: Verdict;
  rejection_codes: string[];
  baseline_score: number | null;
  model_score: number | null; // null when no trained model is connected
  explanation: Claim[];
  load_profile: LoadPoint[];
  timeline: TimelineStop[];
  budget_after: BudgetStatus | null;
}

export interface CostOverrides {
  diesel_inr_per_l?: number;
  mileage_km_per_l?: number;
  toll_inr_per_km?: number;
  driver_inr_per_hour?: number;
}

export interface MatchRequest {
  route_id: string;
  route_version: number;
  truck: TruckInput;
  off_route_enabled: boolean;
  cost_overrides?: CostOverrides;
}

export interface MatchResponse {
  run_id: string;
  route_id: string;
  route_version: number;
  config_version: number;
  generated_at: string;
  off_route_enabled: boolean;
  routing_source: "osrm" | "cache" | "mock";
  data_label: "demonstration" | "mixed" | "live";
  caps: TripCaps;
  budget: BudgetStatus;
  candidates: Candidate[]; // every candidate, each with its own verdict
  notices: string[];
}

export interface ManualCargoInput {
  title: string;
  category: string;
  weight_kg: number;
  rate_inr: number | null;
  pickup: Place;
  drop: Place;
  pickup_window_start: string | null;
  pickup_window_end: string | null;
}
export interface ManualListing extends ManualCargoInput {
  id: string;
  created_at: string;
}

export interface Shipment {
  id: string;
  created_at: string;
  status: ShipmentStatus;
  status_history: { status: ShipmentStatus; at: string }[];
  route_id: string;
  route_name: string;
  route_version: number;
  origin: Place;
  destination: Place;
  route_polyline: LatLng[];
  candidate: Candidate; // frozen copy of what the driver saw at acceptance
  assigned_driver_id?: string | null;
  fleet_container_id?: string | null;
}

export interface AcceptRequest {
  run_id: string;
  candidate_id: string;
  route_id: string;
  route_version: number;
  snapshot?: Candidate; // used by the demonstration API only
  origin?: Place;
  destination?: Place;
  route_polyline?: LatLng[];
  route_name?: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
