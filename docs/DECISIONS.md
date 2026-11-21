# Decisions log

Legend: **Final** = confirmed by the project owner. **Default** = proposed, not objected to.
**Open** = undecided. To change a Final decision, edit this file first, then the code and tests.

## Scope and principles

| ID | Decision | Status |
|---|---|---|
| D-001 | Standalone project "OptiFreight AI", separate from Open Project (OP). Scope is post-delivery backhaul cargo matching only | Final |
| D-002 | The original route is fixed and is the baseline. On-route delivery is the default | Final |
| D-003 | Hard rules run before any ML. ML can never override them. Unverified results are never eligible | Final |
| D-004 | Truck location is simulated or map-selected. No live GPS | Final |
| D-005 | Cargo sources: synthetic, public or authorized API (if one is found), manual entry | Final |
| D-006 | The project must be genuinely AI. Models: A (learned ranker), B (time and cost risk), C (optional neural network). A baseline is kept for honest comparison | Final |
| D-007 | The project is Full Stack, with authentication included | Final |
| D-008 | Free-first: the core demo must run locally without paid services | Final |

## Matching rules

| ID | Decision | Status |
|---|---|---|
| D-010 | Off-route pickups and drops are allowed up to a 40 km round trip per stop, measured by road distance (replaces the earlier 20 km). Exactly 40.0 km passes | Final |
| D-011 | Extra-job caps by original route length: up to 500 km = 3 jobs; 500-1250 km = 5 (max 3 per day); 1250-2000 km = 8 (max 4 per day); over 2000 km = 10 (max 4 per day) | Final |
| D-012 | Band edges belong to the lower band (exactly 500 km = 3 jobs) | Default |
| D-013 | A day is a calendar day in Indian time, resetting at 12:00 am | Final |
| D-014 | A job counts toward the day of its pickup. Cancelled jobs do not count | Default |
| D-015 | Bundling: pickups all within a 5 km radius and drops all within a 5 km radius count as 1 cargo, if capacity, cargo type, and rules allow. Applies to two or more cargos | Final |
| D-016 | Bundle radius means the smallest enclosing circle has radius 5 km or less, measured in a straight line | Default |
| D-017 | Detour budget over the whole trip, for time and for distance, checked separately | Final |
| D-018 | Budget multiplier is 1.25x up to 1000 km, rising linearly to 1.35x at 1500 km, then 1.35x. Time means active time (driving, loading, unloading, waiting; rest excluded). It is a hard cap | Final |
| D-019 | One checkbox, off by default, controls off-route pickups and drops. Each off-route stop is checked separately | Default |
| D-020 | After acceptance, tracking is simulated status progress, not GPS | Default |

## Features chosen

Trip planner with job counter; Indian cost model (diesel, tolls, driver allowance, loading);
vehicle and cargo classes with a compatibility matrix; driver hours and rest; load profile along
the route; e-way bill validity check; heavy-vehicle city-entry windows; over-dimensional and
hazardous cargo; listing reliability score; Accept action; Shipment page with status timeline;
"Open in Google Maps" button; authentication.

Not chosen: a sequence optimizer as the in-app planner; a "with MP vs without MP" simulation.

## Technology

| ID | Decision | Status |
|---|---|---|
| D-030 | Map: Leaflet first, with the "Open in Google Maps" URL button. The Google Embed minimap is added last and is optional | Final |
| D-031 | Demo corridors: Surat-Mumbai, Mumbai-Bengaluru, Delhi-Mumbai (headline), Delhi-Chennai | Default |
| D-032 | Stack: React, TypeScript, Vite, Leaflet; FastAPI, Pydantic, SQLAlchemy; PostgreSQL with PostGIS; Docker Compose; modular monolith | Default |
| D-033 | Routing: self-hosted OSRM on a corridor-clipped map, behind a swappable interface, with cached demo routes as an offline fallback | Default |

## Process

| ID | Decision | Status |
|---|---|---|
| D-040 | Build order: engine, then models tested, then frontend, then final end-to-end testing | Final |
| D-041 | Build folder by folder and file by file. Each file is shown in the chat and approved before the next | Final |
| D-042 | Local folder: `C:\Users\Aaryan Rawal\Desktop\Projects\OptiFreight AI`. GitHub repository: `Frieght-Engine` (spelled as typed) | Final |

## Open items

- Can two cargos that are not bundled be on the truck at the same time?
- How far ahead along the route may a pickup be?
- Route input method (map clicks, coordinates, or both)
- Authentication method and roles
- Public datasets (the owner is searching); labels and features for Models A, B, and C
- Financial assumptions (diesel, mileage, tolls, allowances) and regulatory values (driver hours,
  e-way bill validity, city entry windows, over-dimensional thresholds). Verify from official
  sources and keep every value configurable.
- Whether the project folder should move out of OneDrive-synced Desktop, if it is synced