# Requirements

Rules and numbers live in `DECISIONS.md`. This file lists what the system must do and how we
know it is done. IDs are stable so tests can refer to them.

## Purpose

After a truck delivers its main cargo, find compatible extra cargo along the truck's planned
onward route, inside deterministic rules, and rank what survives with machine learning.

## Functional requirements

### Truck, route, location
- FR-01 Capture truck type, body type, max payload, available payload, available volume,
  restrictions, and availability time. Max payload is never treated as available payload.
- FR-02 Truck location comes from simulated coordinates or a map click. No live GPS.
- FR-03 The original onward route is the baseline. It is versioned; if it changes, all earlier
  results are invalidated.

### Cargo data
- FR-04 Cargo comes from synthetic data, manual entry, and a public or authorized source (when
  one is found), all normalized into one common model.
- FR-05 Manual entries are validated. Unknown fields stay null, never zero.
- FR-06 Duplicate, stale, and cancelled listings are detected and handled.
- FR-07 Every listing keeps its source type and verification status. Synthetic data is always
  labelled as demonstration data.

### Rules
- FR-08 Hard filters (capacity, cargo type, handling, safety, timing, status) run before any ML.
- FR-09 On-route delivery is the default.
- FR-10 One checkbox, off by default, allows off-route pickups and drops. Each off-route stop
  may add at most a 40 km round trip by road.
- FR-11 Extra jobs per trip are capped by original route length, with per-day caps.
- FR-12 Pickups within a 5 km radius and drops within a 5 km radius bundle into one job.
- FR-13 A trip-wide detour budget limits total extra time and total extra distance.
- FR-14 Timing windows, loading and unloading time, and driver hours and rest are enforced.
- FR-15 E-way bill validity, heavy-vehicle city-entry windows, and hazardous and
  over-dimensional cargo rules are enforced.
- FR-16 Every check returns pass, fail, or unknown. Unknown is never eligible.

### Intelligence and finance
- FR-17 Models rank only candidates that passed the hard filters; a deterministic validator
  re-checks every plan before display.
- FR-18 A baseline ranking is always available as a fallback and as a comparison.
- FR-19 Net contribution is revenue minus incremental costs only (fuel, tolls, driver time,
  handling). Gross revenue is never shown as profit.
- FR-20 Every recommendation has an explanation generated from its decision record, with each
  statement labelled fact, calculation, estimate, or recommendation.
- FR-21 Rejections show specific reasons.

### Shipment and accounts
- FR-22 The driver can accept a recommended plan. Accepting freezes the route version and the
  numbers shown.
- FR-23 A Shipment page shows a status timeline (simulated progress), a route minimap, and an
  "Open in Google Maps" button that pre-fills pickup, drop, and onward destination.
- FR-24 Authentication with user accounts.

## Proposed, not yet confirmed

Side-by-side comparison, time-feasibility timeline, printable trip sheet with QR code,
cost what-if editing, match history, installable PWA.

## Non-functional requirements

- NFR-01 Free-first: the core demo runs locally with no paid service.
- NFR-02 Reproducible: simulator seeds, data versions, config versions, and model versions are
  recorded with every result.
- NFR-03 Fail closed: failures never produce fabricated results or claim verification.
- NFR-04 Secrets stay out of source code and git.
- NFR-05 Performance targets are measured and reported, not assumed.
- NFR-06 Accessible, responsive interface.

## Out of scope

Live GPS, payments, real dispatch or booking with shippers, notifications, proof of delivery,
ERP or warehouse features, microservices, reinforcement learning, anything from OP.

## Acceptance criteria

1. Hard rules reject every ineligible job, and ML or scores can never override them.
2. The 40 km, job-cap, day-cap, bundling, and budget rules pass their boundary tests.
3. Distances for the 40 km and budget rules come from a road-network engine, not straight lines.
4. An unverified distance or a routing failure is reported as unknown, never eligible.
5. All cargo sources feed the same matching process.
6. Models beat the baseline on held-out data, or the report says honestly that they do not.
7. The rule regression suite passes on every commit.
8. The demo runs on both laptops with one command and no paid service.
9. Documentation states what is implemented, tested, simulated, and planned.