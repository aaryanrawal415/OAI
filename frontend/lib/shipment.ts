import type { ShipmentStatus } from "../api/types";

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
  accepted: "Accepted",
  heading_to_pickup: "Heading to pickup",
  loaded: "Loaded",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ORDER: ShipmentStatus[] = ["accepted", "heading_to_pickup", "loaded", "in_transit", "delivered"];

/** The step after this one, or null when the shipment cannot move further. */
export function nextStatus(status: ShipmentStatus): ShipmentStatus | null {
  const index = ORDER.indexOf(status);
  return index >= 0 && index < ORDER.length - 1 ? ORDER[index + 1] : null;
}

export function isActive(status: ShipmentStatus): boolean {
  return status !== "delivered" && status !== "cancelled";
}
