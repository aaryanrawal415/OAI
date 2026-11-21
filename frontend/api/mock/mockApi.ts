import type { Api } from "../client";
import { readJson, removeKey, writeJson } from "../../lib/storage";
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
  type ShipmentAssignment,
  type Shipment,
  type ShipmentStatus,
  type User,
} from "../types";
import { runDemoMatching, tripCaps } from "./demoEngine";
import { ROUTES, findRoute } from "./routes";
import { isActive } from "../../lib/shipment";
import { getPlan } from "../../lib/subscriptions";

// DEMONSTRATION API. Everything is stored in this browser only. Passwords are hashed with
// SHA-256 for the demo and this is NOT real security. The real backend will replace all of it.

interface StoredUser extends User {
  password_hash: string;
}

const USERS_KEY = "of_users";
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const newId = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const driversKey = (orgId: string): string => `of_fleet_drivers_${orgId}`;
const containersKey = (orgId: string): string => `of_fleet_containers_${orgId}`;

async function hash(text: string): Promise<string> {
  try {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return `plain:${text}`; // only if the browser blocks crypto in an insecure context
  }
}

function session(user: StoredUser): AuthSession {
  const { password_hash: _ignored, ...safe } = user;
  return {
    token: `demo-${user.id}`,
    user: {
      ...safe,
      role: safe.role === "cargo_owner" ? "organization_owner" : safe.role ?? "client",
      tier: safe.tier ?? "basic",
    },
  };
}

function userIdFrom(token: string): string {
  if (!token.startsWith("demo-")) throw new ApiError("Please sign in again.", 401);
  return token.slice(5);
}

function storedUserFrom(token: string): StoredUser {
  const id = userIdFrom(token);
  const user = readJson<StoredUser[]>(USERS_KEY, []).find((item) => item.id === id);
  if (!user) throw new ApiError("Please sign in again.", 401);
  return user;
}

function organizationOwnerFrom(token: string): StoredUser {
  const user = storedUserFrom(token);
  if (user.role !== "organization_owner" && user.role !== "cargo_owner") {
    throw new ApiError("Only organization owners can manage fleet operations.", 403);
  }
  return user;
}

function organizationId(user: StoredUser): string {
  return user.organization_id ?? user.id;
}

const manualKey = (uid: string): string => `of_manual_${uid}`;
const shipKey = (uid: string): string => `of_ships_${uid}`;

const ORDER: ShipmentStatus[] = ["accepted", "heading_to_pickup", "loaded", "in_transit", "delivered"];

export const mockApi: Api = {
  mode: "mock",

  async register({ name, email, password, account_type, organization_name }) {
    await sleep(250);
    const users = readJson<StoredUser[]>(USERS_KEY, []);
    const clean = email.trim().toLowerCase();
    if (users.some((u) => u.email === clean)) throw new ApiError("An account with this email already exists.", 409);
    if (account_type === "organization_owner" && !organization_name?.trim()) {
      throw new ApiError("Organization name is required for owner accounts.", 400);
    }
    const id = newId("u");
    const user: StoredUser = {
      id,
      email: clean,
      name: name.trim(),
      role: account_type ?? "client",
      tier: "basic",
      password_hash: await hash(password),
      ...(account_type === "organization_owner"
        ? { organization_id: newId("org"), organization_name: organization_name?.trim() }
        : {}),
    };
    writeJson(USERS_KEY, [...users, user]);
    return session(user);
  },

  async login({ email, password }) {
    await sleep(250);
    const users = readJson<StoredUser[]>(USERS_KEY, []);
    const user = users.find((u) => u.email === email.trim().toLowerCase());
    if (!user || user.password_hash !== (await hash(password))) {
      throw new ApiError("Email or password is incorrect.", 401);
    }
    return session(user);
  },

  async getAdminProfile() {
    throw new ApiError("Admin profiles require server-verified administrator access.", 403);
  },

  async listRoutes() {
    await sleep(120);
    return ROUTES;
  },

  async runMatching(token: string, request: MatchRequest): Promise<MatchResponse> {
    const uid = userIdFrom(token);
    await sleep(600);
    return runDemoMatching(request, readJson<ManualListing[]>(manualKey(uid), []));
  },

  async listManualCargo(token) {
    return readJson<ManualListing[]>(manualKey(userIdFrom(token)), []);
  },

  async addManualCargo(token, input: ManualCargoInput) {
    const uid = userIdFrom(token);
    await sleep(200);
    const subscription = readJson<{ plan: "basic" | "professional" | "enterprise"; status: string } | null>("of_subscription", null);
    const limit = getPlan(subscription?.plan ?? "basic").limits.monthlyJobs;
    const now = new Date();
    const month = `${now.getUTCFullYear()}-${now.getUTCMonth()}`;
    const existing = readJson<ManualListing[]>(manualKey(uid), []);
    const usedThisMonth = existing.filter((listing) => {
      const created = new Date(listing.created_at);
      return `${created.getUTCFullYear()}-${created.getUTCMonth()}` === month;
    }).length;
    if (subscription?.status === "past_due" || subscription?.status === "cancelled") {
      throw new ApiError("Your subscription is not active. Update billing to add jobs.", 402);
    }
    if (limit !== -1 && usedThisMonth >= limit) {
      throw new ApiError(`This plan allows ${limit} cargo jobs per month. Upgrade for more capacity.`, 402);
    }
    const listing: ManualListing = { ...input, id: newId("m"), created_at: new Date().toISOString() };
    writeJson(manualKey(uid), [...existing, listing]);
    return listing;
  },

  async deleteManualCargo(token, id) {
    const uid = userIdFrom(token);
    writeJson(manualKey(uid), readJson<ManualListing[]>(manualKey(uid), []).filter((m) => m.id !== id));
  },

  async acceptCandidate(token, request: AcceptRequest) {
    const uid = userIdFrom(token);
    await sleep(300);
    const candidate = request.snapshot;
    if (!candidate) throw new ApiError("Missing listing details.", 400);
    if (candidate.eligible !== "pass") throw new ApiError("Only eligible jobs can be accepted.", 409);
    const route = findRoute(request.route_id);
    if (!route) throw new ApiError("Unknown route.", 404);
    const all = readJson<Shipment[]>(shipKey(uid), []);
    const active = all.filter((s) => s.route_id === route.id && isActive(s.status));
    const caps = tripCaps(route.distance_km);
    if (active.length >= caps.max_jobs_total) {
      throw new ApiError(`This trip already has the maximum of ${caps.max_jobs_total} jobs.`, 409);
    }
    if (active.some((s) => s.candidate.id === candidate.id)) throw new ApiError("You already accepted this job.", 409);
    const now = new Date().toISOString();
    const shipment: Shipment = {
      id: newId("s"),
      created_at: now,
      status: "accepted",
      status_history: [{ status: "accepted", at: now }],
      route_id: route.id,
      route_name: route.name,
      route_version: request.route_version,
      origin: request.origin ?? route.origin,
      destination: request.destination ?? route.destination,
      route_polyline: request.route_polyline ?? route.polyline,
      candidate,
      assigned_driver_id: null,
      fleet_container_id: null,
    };
    writeJson(shipKey(uid), [shipment, ...all]);
    return shipment;
  },

  async listShipments(token) {
    await sleep(150);
    return readJson<Shipment[]>(shipKey(userIdFrom(token)), []);
  },

  async getShipment(token, id) {
    const found = readJson<Shipment[]>(shipKey(userIdFrom(token)), []).find((s) => s.id === id);
    if (!found) throw new ApiError("Shipment not found.", 404);
    return found;
  },

  async listFleetDrivers(token) {
    const owner = organizationOwnerFrom(token);
    return readJson<FleetDriver[]>(driversKey(organizationId(owner)), []);
  },

  async addFleetDriver(token, input: FleetDriverInput) {
    const owner = organizationOwnerFrom(token);
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      throw new ApiError("Enter a driver name and a valid email address.", 400);
    }
    const key = driversKey(organizationId(owner));
    const drivers = readJson<FleetDriver[]>(key, []);
    if (drivers.some((driver) => driver.email.toLowerCase() === email)) {
      throw new ApiError("A driver with this email is already in your organization.", 409);
    }
    const driver: FleetDriver = { id: newId("driver"), name, email, created_at: new Date().toISOString() };
    writeJson(key, [...drivers, driver]);
    return driver;
  },

  async deleteFleetDriver(token, id) {
    const owner = organizationOwnerFrom(token);
    const orgId = organizationId(owner);
    const containers = readJson<FleetContainer[]>(containersKey(orgId), []);
    if (containers.some((container) => container.driver_id === id)) {
      throw new ApiError("Reassign this driver's containers before removing them.", 409);
    }
    const shipments = readJson<Shipment[]>(shipKey(owner.id), []);
    if (shipments.some((shipment) => shipment.assigned_driver_id === id)) {
      throw new ApiError("Reassign this driver's accepted jobs before removing them.", 409);
    }
    const key = driversKey(orgId);
    writeJson(key, readJson<FleetDriver[]>(key, []).filter((driver) => driver.id !== id));
  },

  async listFleetContainers(token) {
    const owner = organizationOwnerFrom(token);
    return readJson<FleetContainer[]>(containersKey(organizationId(owner)), []);
  },

  async addFleetContainer(token, input: FleetContainerInput) {
    const owner = organizationOwnerFrom(token);
    const registration = input.registration_number.trim().toUpperCase();
    if (registration.length < 3) throw new ApiError("Enter a valid container registration number.", 400);
    const orgId = organizationId(owner);
    const containerKey = containersKey(orgId);
    const containers = readJson<FleetContainer[]>(containerKey, []);
    if (containers.some((container) => container.registration_number.toUpperCase() === registration)) {
      throw new ApiError("This container is already registered to your organization.", 409);
    }
    const drivers = readJson<FleetDriver[]>(driversKey(orgId), []);
    if (input.driver_id && !drivers.some((driver) => driver.id === input.driver_id)) {
      throw new ApiError("Choose a driver in your organization.", 400);
    }
    const container: FleetContainer = {
      ...input,
      registration_number: registration,
      id: newId("container"),
      created_at: new Date().toISOString(),
    };
    writeJson(containerKey, [...containers, container]);
    return container;
  },

  async updateFleetContainer(token, id, input: FleetContainerInput) {
    const owner = organizationOwnerFrom(token);
    const orgId = organizationId(owner);
    const containerKey = containersKey(orgId);
    const containers = readJson<FleetContainer[]>(containerKey, []);
    const index = containers.findIndex((container) => container.id === id);
    if (index < 0) throw new ApiError("Container not found.", 404);
    if (containers[index].driver_id !== input.driver_id) {
      const shipments = readJson<Shipment[]>(shipKey(owner.id), []);
      if (shipments.some((shipment) => shipment.fleet_container_id === id && isActive(shipment.status))) {
        throw new ApiError("Reassign active offers before changing this container's driver.", 409);
      }
    }
    const registration = input.registration_number.trim().toUpperCase();
    if (registration.length < 3) throw new ApiError("Enter a valid container registration number.", 400);
    if (containers.some((container) => container.id !== id && container.registration_number.toUpperCase() === registration)) {
      throw new ApiError("This container is already registered to your organization.", 409);
    }
    const drivers = readJson<FleetDriver[]>(driversKey(orgId), []);
    if (input.driver_id && !drivers.some((driver) => driver.id === input.driver_id)) {
      throw new ApiError("Choose a driver in your organization.", 400);
    }
    const updated: FleetContainer = { ...input, registration_number: registration, id, created_at: containers[index].created_at };
    containers[index] = updated;
    writeJson(containerKey, containers);
    return updated;
  },

  async deleteFleetContainer(token, id) {
    const owner = organizationOwnerFrom(token);
    const shipments = readJson<Shipment[]>(shipKey(owner.id), []);
    if (shipments.some((shipment) => shipment.fleet_container_id === id)) {
      throw new ApiError("Reassign accepted jobs before removing this container.", 409);
    }
    const key = containersKey(organizationId(owner));
    writeJson(key, readJson<FleetContainer[]>(key, []).filter((container) => container.id !== id));
  },

  async assignShipment(token, id, assignment: ShipmentAssignment) {
    const owner = organizationOwnerFrom(token);
    const all = readJson<Shipment[]>(shipKey(owner.id), []);
    const index = all.findIndex((shipment) => shipment.id === id);
    if (index < 0) throw new ApiError("Shipment not found.", 404);
    const shipment = all[index];
    if (!isActive(shipment.status)) throw new ApiError("Only active shipments can be assigned.", 409);
    if (!!assignment.driver_id !== !!assignment.container_id) {
      throw new ApiError("Choose both a driver and a container, or clear both assignments.", 400);
    }
    if (assignment.driver_id && assignment.container_id) {
      const orgId = organizationId(owner);
      const driver = readJson<FleetDriver[]>(driversKey(orgId), []).find((item) => item.id === assignment.driver_id);
      const container = readJson<FleetContainer[]>(containersKey(orgId), []).find((item) => item.id === assignment.container_id);
      if (!driver || !container || container.driver_id !== driver.id) {
        throw new ApiError("Choose a container assigned to the selected driver.", 400);
      }
    }
    const updated = {
      ...shipment,
      assigned_driver_id: assignment.driver_id,
      fleet_container_id: assignment.container_id,
    };
    all[index] = updated;
    writeJson(shipKey(owner.id), all);
    return updated;
  },

  async advanceShipment(token, id) {
    const uid = userIdFrom(token);
    const all = readJson<Shipment[]>(shipKey(uid), []);
    const index = all.findIndex((s) => s.id === id);
    if (index < 0) throw new ApiError("Shipment not found.", 404);
    const current = all[index];
    const pos = ORDER.indexOf(current.status);
    if (pos < 0 || pos >= ORDER.length - 1) throw new ApiError("This shipment cannot move further.", 409);
    const next = ORDER[pos + 1];
    const updated: Shipment = {
      ...current,
      status: next,
      status_history: [...current.status_history, { status: next, at: new Date().toISOString() }],
    };
    all[index] = updated;
    writeJson(shipKey(uid), all);
    return updated;
  },

  async cancelShipment(token, id) {
    const uid = userIdFrom(token);
    const all = readJson<Shipment[]>(shipKey(uid), []);
    const index = all.findIndex((s) => s.id === id);
    if (index < 0) throw new ApiError("Shipment not found.", 404);
    const current = all[index];
    if (current.status === "delivered" || current.status === "cancelled") {
      throw new ApiError("This shipment can no longer be cancelled.", 409);
    }
    const updated: Shipment = {
      ...current,
      status: "cancelled",
      status_history: [...current.status_history, { status: "cancelled", at: new Date().toISOString() }],
    };
    all[index] = updated;
    writeJson(shipKey(uid), all);
    return updated;
  },

  async resetDemoData(token) {
    const uid = userIdFrom(token);
    removeKey(manualKey(uid));
    removeKey(shipKey(uid));
  },
};
