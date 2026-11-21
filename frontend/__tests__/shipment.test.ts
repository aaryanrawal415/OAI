import { describe, expect, it } from "vitest";
import { isActive, nextStatus } from "../lib/shipment";

describe("shipment lifecycle", () => {
  it("removes completed and cancelled shipments from active jobs", () => {
    expect(isActive("accepted")).toBe(true);
    expect(isActive("heading_to_pickup")).toBe(true);
    expect(isActive("loaded")).toBe(true);
    expect(isActive("in_transit")).toBe(true);
    expect(isActive("delivered")).toBe(false);
    expect(isActive("cancelled")).toBe(false);
  });

  it("does not advance a delivered shipment", () => {
    expect(nextStatus("delivered")).toBeNull();
  });
});
