import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import type { CostOverrides, MatchRequest, MatchResponse, Place, TruckInput } from "../api/types";
import { readJson, writeJson } from "../lib/storage";

const KEY = "of_workspace";

export type LocationMode = "route_start" | "custom";

export interface WorkspaceState {
  routeId: string;
  selectedFleetContainerId: string | null;
  routeVersions: Record<string, number>; // bumped by "simulate a route change"
  truck: TruckInput;
  locationMode: LocationMode;
  offRoute: boolean; // default off
  compareIds: string[];
  lastMatch: MatchResponse | null;
  lastRequestKey: string | null; // what the last search was run with
  costOverrides: CostOverrides;
}

type Action =
  | { type: "selectFleetContainer"; containerId: string | null; truck: TruckInput | null }
  | { type: "setRoute"; routeId: string; origin: Place }
  | { type: "patchTruck"; patch: Partial<TruckInput> }
  | { type: "setLocation"; place: Place }
  | { type: "useRouteStart"; origin: Place }
  | { type: "setOffRoute"; value: boolean }
  | { type: "toggleCompare"; id: string }
  | { type: "clearCompare" }
  | { type: "setMatch"; match: MatchResponse; key: string }
  | { type: "clearMatch" }
  | { type: "setCosts"; costs: CostOverrides }
  | { type: "bumpRouteVersion"; routeId: string }
  | { type: "reset" };

function nextHourIso(): string {
  const d = new Date(Date.now() + 3600_000);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

export function initialState(): WorkspaceState {
  return {
    routeId: "delhi_mumbai",
    selectedFleetContainerId: null,
    routeVersions: {},
    truck: {
      vehicle_class: "hcv_10wheel",
      body_type: "closed_body",
      max_payload_kg: 21000,
      available_payload_kg: 18000,
      available_volume_m3: 60,
      location: { name: "Delhi", lat: 28.61, lng: 77.21 },
      available_from: nextHourIso(),
      handling_equipment: [],
    },
    locationMode: "route_start",
    offRoute: false,
    compareIds: [],
    lastMatch: null,
    lastRequestKey: null,
    costOverrides: {},
  };
}

export function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case "selectFleetContainer":
      return {
        ...state,
        selectedFleetContainerId: action.containerId,
        truck: action.truck ?? state.truck,
        locationMode: action.truck ? "custom" : state.locationMode,
      };
    case "setRoute":
      return {
        ...state,
        routeId: action.routeId,
        compareIds: [],
        truck: state.locationMode === "route_start" ? { ...state.truck, location: action.origin } : state.truck,
      };
    case "patchTruck":
      return { ...state, truck: { ...state.truck, ...action.patch } };
    case "setLocation":
      return { ...state, locationMode: "custom", truck: { ...state.truck, location: action.place } };
    case "useRouteStart":
      return { ...state, locationMode: "route_start", truck: { ...state.truck, location: action.origin } };
    case "setOffRoute":
      return { ...state, offRoute: action.value };
    case "toggleCompare": {
      const has = state.compareIds.includes(action.id);
      if (has) return { ...state, compareIds: state.compareIds.filter((id) => id !== action.id) };
      if (state.compareIds.length >= 3) return state;
      return { ...state, compareIds: [...state.compareIds, action.id] };
    }
    case "clearCompare":
      return { ...state, compareIds: [] };
    case "setMatch":
      return { ...state, lastMatch: action.match, lastRequestKey: action.key };
    case "clearMatch":
      return { ...state, lastMatch: null, lastRequestKey: null, compareIds: [] };
    case "setCosts":
      return { ...state, costOverrides: action.costs };
    case "bumpRouteVersion":
      return {
        ...state,
        routeVersions: { ...state.routeVersions, [action.routeId]: (state.routeVersions[action.routeId] ?? 1) + 1 },
      };
    case "reset":
      return initialState();
    default:
      return state;
  }
}

/** The exact request a search would send right now. Used to spot stale results. */
export function buildRequest(state: WorkspaceState): MatchRequest {
  return {
    route_id: state.routeId,
    route_version: state.routeVersions[state.routeId] ?? 1,
    truck: state.truck,
    off_route_enabled: state.offRoute,
    cost_overrides: state.costOverrides,
  };
}

interface WorkspaceValue {
  state: WorkspaceState;
  dispatch: Dispatch<Action>;
  routeVersion: number;
  request: MatchRequest;
  requestKey: string;
  /** True when the last results came from a different route version. */
  routeChanged: boolean;
  /** True when inputs changed since the last search. */
  inputsChanged: boolean;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const saved = readJson<WorkspaceState | null>(KEY, null, true);
    return saved ? { ...initialState(), ...saved } : initialState();
  });

  useEffect(() => {
    writeJson(KEY, state, true);
  }, [state]);

  const value = useMemo<WorkspaceValue>(() => {
    const request = buildRequest(state);
    const requestKey = JSON.stringify(request);
    const routeVersion = request.route_version;
    const last = state.lastMatch;
    return {
      state,
      dispatch,
      routeVersion,
      request,
      requestKey,
      routeChanged: !!last && last.route_id === state.routeId && last.route_version !== routeVersion,
      inputsChanged: !!last && state.lastRequestKey !== requestKey,
    };
  }, [state]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return value;
}
