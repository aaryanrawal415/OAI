import { describe, expect, it } from "vitest";
import { initialState, reducer } from "../state/WorkspaceContext";

describe("workspace state", () => {
  it("starts with off-route stops switched off", () => {
    expect(initialState().offRoute).toBe(false);
  });
  it("allows at most three jobs to be compared", () => {
    let s = initialState();
    for (const id of ["a", "b", "c", "d"]) s = reducer(s, { type: "toggleCompare", id });
    expect(s.compareIds).toEqual(["a", "b", "c"]);
    s = reducer(s, { type: "toggleCompare", id: "b" });
    expect(s.compareIds).toEqual(["a", "c"]);
  });
  it("moves the truck to the new route start only while it follows the route start", () => {
    const mumbai = { name: "Mumbai", lat: 19.08, lng: 72.88 };
    let s = reducer(initialState(), { type: "setRoute", routeId: "mumbai_bengaluru", origin: mumbai });
    expect(s.truck.location).toEqual(mumbai);
    s = reducer(s, { type: "setLocation", place: { name: "Selected location", lat: 21, lng: 73 } });
    s = reducer(s, { type: "setRoute", routeId: "delhi_mumbai", origin: { name: "Delhi", lat: 28.61, lng: 77.21 } });
    expect(s.truck.location.lat).toBe(21);
  });
  it("clears the comparison when the route changes", () => {
    let s = reducer(initialState(), { type: "toggleCompare", id: "a" });
    s = reducer(s, { type: "setRoute", routeId: "surat_mumbai", origin: { name: "Surat", lat: 21.17, lng: 72.83 } });
    expect(s.compareIds).toEqual([]);
  });
  it("bumps the route version for the chosen route only", () => {
    let s = reducer(initialState(), { type: "bumpRouteVersion", routeId: "delhi_mumbai" });
    s = reducer(s, { type: "bumpRouteVersion", routeId: "delhi_mumbai" });
    expect(s.routeVersions["delhi_mumbai"]).toBe(3);
    expect(s.routeVersions["surat_mumbai"]).toBeUndefined();
  });
});
