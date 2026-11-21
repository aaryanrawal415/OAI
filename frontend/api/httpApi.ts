import type { Api } from "./client";
import {
  ApiError,
  type AcceptRequest,
  type AuthSession,
  type FleetContainer,
  type FleetContainerInput,
  type FleetDriver,
  type FleetDriverInput,
  type ManualCargoInput,
  type ManualListing,
  type MatchRequest,
  type MatchResponse,
  type RouteInfo,
  type ShipmentAssignment,
  type Shipment,
  type User,
} from "./types";

// Talks to the planned backend (FastAPI) under /api. The backend does not exist yet, so these
// paths are a proposal and have not been tested against a real server.

async function call<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`/api${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Cannot reach the server. Check that the backend is running.", 0);
  }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      /* keep the default message */
    }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const post = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

export const httpApi: Api = {
  mode: "http",
  register: (input) => call<AuthSession>("/auth/register", post(input)),
  login: (input) => call<AuthSession>("/auth/login", post(input)),
  getAdminProfile: (token) => call<User>("/admin/profile", {}, token),
  listRoutes: () => call<RouteInfo[]>("/routes"),
  runMatching: (token, request: MatchRequest) => call<MatchResponse>("/matching/run", post(request), token),
  listManualCargo: (token) => call<ManualListing[]>("/cargo/manual", {}, token),
  addManualCargo: (token, input: ManualCargoInput) => call<ManualListing>("/cargo/manual", post(input), token),
  deleteManualCargo: (token, id) => call<void>(`/cargo/manual/${id}`, { method: "DELETE" }, token),
  acceptCandidate: (token, request: AcceptRequest) => call<Shipment>("/shipments", post(request), token),
  listShipments: (token) => call<Shipment[]>("/shipments", {}, token),
  getShipment: (token, id) => call<Shipment>(`/shipments/${id}`, {}, token),
  listFleetDrivers: (token) => call<FleetDriver[]>("/fleet/drivers", {}, token),
  addFleetDriver: (token, input) => call<FleetDriver>("/fleet/drivers", post(input), token),
  deleteFleetDriver: (token, id) => call<void>(`/fleet/drivers/${id}`, { method: "DELETE" }, token),
  listFleetContainers: (token) => call<FleetContainer[]>("/fleet/containers", {}, token),
  addFleetContainer: (token, input) => call<FleetContainer>("/fleet/containers", post(input), token),
  updateFleetContainer: (token, id, input) => call<FleetContainer>(`/fleet/containers/${id}`, { ...post(input), method: "PUT" }, token),
  deleteFleetContainer: (token, id) => call<void>(`/fleet/containers/${id}`, { method: "DELETE" }, token),
  assignShipment: (token, id, assignment) => call<Shipment>(`/shipments/${id}/assignment`, post(assignment), token),
  advanceShipment: (token, id) => call<Shipment>(`/shipments/${id}/advance`, { method: "POST" }, token),
  cancelShipment: (token, id) => call<Shipment>(`/shipments/${id}/cancel`, { method: "POST" }, token),
};
