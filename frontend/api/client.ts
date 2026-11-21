import type {
  AcceptRequest,
  AuthSession,
  FleetContainer,
  FleetContainerInput,
  FleetDriver,
  FleetDriverInput,
  ManualCargoInput,
  ManualListing,
  MatchRequest,
  MatchResponse,
  RegistrationAccountType,
  RouteInfo,
  ShipmentAssignment,
  Shipment,
  User,
} from "./types";
import { httpApi } from "./httpApi";
import { mockApi } from "./mock/mockApi";

/** Everything the interface needs from a server. The mock and HTTP versions both implement it. */
export interface Api {
  mode: "mock" | "http";
  register(input: {
    name: string;
    email: string;
    password: string;
    account_type?: RegistrationAccountType;
    organization_name?: string;
  }): Promise<AuthSession>;
  login(input: { email: string; password: string }): Promise<AuthSession>;
  getAdminProfile(token: string): Promise<User>;
  listRoutes(): Promise<RouteInfo[]>;
  runMatching(token: string, request: MatchRequest): Promise<MatchResponse>;
  listManualCargo(token: string): Promise<ManualListing[]>;
  addManualCargo(token: string, input: ManualCargoInput): Promise<ManualListing>;
  deleteManualCargo(token: string, id: string): Promise<void>;
  acceptCandidate(token: string, request: AcceptRequest): Promise<Shipment>;
  listShipments(token: string): Promise<Shipment[]>;
  getShipment(token: string, id: string): Promise<Shipment>;
  listFleetDrivers(token: string): Promise<FleetDriver[]>;
  addFleetDriver(token: string, input: FleetDriverInput): Promise<FleetDriver>;
  deleteFleetDriver(token: string, id: string): Promise<void>;
  listFleetContainers(token: string): Promise<FleetContainer[]>;
  addFleetContainer(token: string, input: FleetContainerInput): Promise<FleetContainer>;
  updateFleetContainer(token: string, id: string, input: FleetContainerInput): Promise<FleetContainer>;
  deleteFleetContainer(token: string, id: string): Promise<void>;
  assignShipment(token: string, id: string, assignment: ShipmentAssignment): Promise<Shipment>;
  /** Moves a shipment to its next status. Simulated progress only: there is no GPS. */
  advanceShipment(token: string, id: string): Promise<Shipment>;
  cancelShipment(token: string, id: string): Promise<Shipment>;
  resetDemoData?(token: string): Promise<void>;
}

export const api: Api = import.meta.env.VITE_API_MODE === "http" ? httpApi : mockApi;
