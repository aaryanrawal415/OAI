import { describe, expect, it } from "vitest";
import { googleMapsDirectionsUrl, googleMapsEmbedUrl } from "../lib/googleMapsUrl";

const start = { lat: 28.61, lng: 77.21 };
const end = { lat: 19.08, lng: 72.88 };

describe("google maps links", () => {
  it("fills in origin, destination and waypoints", () => {
    const url = new URL(
      googleMapsDirectionsUrl({ origin: start, destination: end, waypoints: [{ lat: 28.35, lng: 76.94 }, { lat: 19.3, lng: 73.06 }] }),
    );
    expect(url.hostname).toBe("www.google.com");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("origin")).toBe("28.61000,77.21000");
    expect(url.searchParams.get("destination")).toBe("19.08000,72.88000");
    expect(url.searchParams.get("travelmode")).toBe("driving");
    expect(url.searchParams.get("waypoints")).toBe("28.35000,76.94000|19.30000,73.06000");
  });
  it("leaves waypoints out when there are none", () => {
    const url = new URL(googleMapsDirectionsUrl({ origin: start, destination: end }));
    expect(url.searchParams.has("waypoints")).toBe(false);
  });
  it("builds the embed address with the key", () => {
    const url = new URL(googleMapsEmbedUrl("KEY", { origin: start, destination: end }));
    expect(url.searchParams.get("key")).toBe("KEY");
    expect(url.searchParams.get("mode")).toBe("driving");
  });
});
