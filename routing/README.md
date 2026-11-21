# Routing

Status: plan and configuration only. Nothing here has been run yet.

The 40 km rule, the detour budget, and the time checks all need real road distances. A
straight line is only allowed to discard candidates, never to approve them. This folder sets up
a local OSRM routing server (free, open source, no quota) covering only the four demo corridors.

## Files

| File | Purpose |
|---|---|
| `corridors.geojson` | Four approximate polygons (about 80 km each side of the highway) used to clip the map |
| `docker-compose.osrm.yml` | Starts the routing server on port 5000 |
| `profiles/truck.lua` | Truck road profile (not written yet; see "Truck profile") |
| `cached_routes/` | Saved demo routes for offline use and CI (generated later) |
| `data/` | Map and OSRM files, created by you; git-ignored because they are large |

## Corridors

| Corridor | Role |
|---|---|
| Surat to Mumbai | Up to 500 km band |
| Mumbai to Bengaluru | 500 to 1,250 km band |
| Delhi to Mumbai | 1,250 to 2,000 km band (headline demo) |
| Delhi to Chennai | Over 2,000 km band |

The polygons are built from rough highway waypoints and an 80 km margin. The margin must be
wide enough for 40 km round-trip detours and for alternative roads. View `corridors.geojson`
in any GeoJSON viewer before using it, and widen the margin if a hub you want is outside it.
The real route lengths come from the routing engine, not from this file.

## Build steps (Windows, using WSL and Docker Desktop)

Windows paths with spaces need quotes. Run Linux tools inside WSL, or use Docker images.

1. **Get the map.** Download the India extract (`india-latest.osm.pbf`) from Geofabrik
   (`download.geofabrik.de`) and save it as `routing/data/india-latest.osm.pbf`. Check the
   current licence terms: OpenStreetMap data is ODbL and must be credited ("Map data from
   OpenStreetMap contributors").
2. **Clip it to the corridors** with osmium-tool (in WSL: `sudo apt install osmium-tool`).
   Clip each corridor, then merge the four files:
   ```
   osmium extract -p corridors.geojson india-latest.osm.pbf -o corridors.osm.pbf
   ```
   If `osmium extract` does not accept a multi-feature file, split `corridors.geojson` into four
   single-polygon files, clip each, and join them with `osmium merge`. Check the osmium
   documentation for the current syntax.
3. **Build the OSRM data** (from the project root in PowerShell):
   ```
   docker run -t -v "${PWD}/routing/data:/data" ghcr.io/project-osrm/osrm-backend osrm-extract -p /opt/car.lua /data/corridors.osm.pbf
   docker run -t -v "${PWD}/routing/data:/data" ghcr.io/project-osrm/osrm-backend osrm-partition /data/corridors.osrm
   docker run -t -v "${PWD}/routing/data:/data" ghcr.io/project-osrm/osrm-backend osrm-customize /data/corridors.osrm
   ```
4. **Start the server:**
   ```
   docker compose -f routing/docker-compose.osrm.yml up
   ```
5. **Test it.** Coordinates are longitude first. This should return a distance for Delhi to
   Mumbai:
   ```
   curl "http://localhost:5000/route/v1/driving/77.209,28.614;72.878,19.076?overview=false"
   ```

Later these steps become `scripts/build_routing_data.ps1`.

## Truck profile

The first build uses the default car profile, so routes may use roads a loaded truck could not
(height, weight, or turning limits). Until `profiles/truck.lua` exists and is used, every
distance is treated as an estimate and shown as approximate, not as verified.

## Rules this folder must respect

- A result is "verified" only when it comes from the real OSRM server.
- Cached routes are always marked unverified (`cache_results_count_as_verified: false`).
- If the server is down and no cache entry exists, the answer is "unknown", never a guess.
- Keep the same clipped map on both laptops so results match.
- Docker Desktop may need more memory (Settings, Resources) for the map processing step.
